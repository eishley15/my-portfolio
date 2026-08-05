#!/usr/bin/env node
/**
 * Runtime security verification for Client Gallery 2.0.
 * Hits live Supabase + local API endpoints to confirm RLS, JWT, and rate-limiting hold.
 *
 * Usage:
 *   node scripts/security-verify.js
 *   BASE_URL=https://kylepayawal.studio node scripts/security-verify.js
 *
 * Requires a running dev server (npm run dev) when testing localhost.
 * Set GALLERY_ACCESS_CODE_A and optionally GALLERY_ACCESS_CODE_B in .env
 * to run the cross-gallery favorites isolation check.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// ── Load .env ─────────────────────────────────────────────────────────────────
const envPath = new URL('../.env', import.meta.url).pathname;
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // .env missing — rely on process.env (CI/Vercel)
}

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  DOWNLOAD_TOKEN_SECRET,
} = process.env;

const BASE_URL      = process.env.BASE_URL || 'http://localhost:5173';
const ACCESS_CODE_A = process.env.GALLERY_ACCESS_CODE_A || process.env.GALLERY_ACCESS_CODE;
const ACCESS_CODE_B = process.env.GALLERY_ACCESS_CODE_B;

// ── Helpers ───────────────────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

let passed = 0, failed = 0, skipped = 0;

function pass(msg)         { console.log(green('  ✓') + ' ' + msg); passed++; }
function fail(msg, detail) { console.log(red('  ✗') + ' ' + bold(msg) + (detail ? `\n    ${red(detail)}` : '')); failed++; }
function skip(msg, reason) { console.log(yellow('  ⊘') + ' ' + msg + (reason ? yellow(` (${reason})`) : '')); skipped++; }
function section(title)    { console.log('\n' + bold(title)); }

// ── Preflight ─────────────────────────────────────────────────────────────────
const missingEnv = [];
if (!VITE_SUPABASE_URL)    missingEnv.push('VITE_SUPABASE_URL');
if (!VITE_SUPABASE_ANON_KEY) missingEnv.push('VITE_SUPABASE_ANON_KEY');
if (!SUPABASE_URL)         missingEnv.push('SUPABASE_URL');
if (!SUPABASE_SERVICE_KEY) missingEnv.push('SUPABASE_SERVICE_KEY');

if (missingEnv.length) {
  console.error(red(`\nMissing env vars: ${missingEnv.join(', ')}`));
  console.error('Fill in .env and retry.\n');
  process.exit(1);
}

const anon    = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── 1. RLS — anon cannot read gallery tables ──────────────────────────────────
section('1. Supabase RLS — anon key isolation');

async function checkAnonBlocked(table) {
  const { data, error } = await anon.from(table).select('*').limit(1);
  if (error || !data || data.length === 0) {
    pass(`anon SELECT on ${table} → blocked (0 rows or error)`);
  } else {
    fail(`anon SELECT on ${table} returned ${data.length} row(s)`, 'RLS not enforced!');
  }
}

await checkAnonBlocked('clients');
await checkAnonBlocked('files');
await checkAnonBlocked('gallery_scenes');
await checkAnonBlocked('gallery_favorites');

// ── 2. RLS — anon CAN still read portfolio (must not over-revoke) ─────────────
section('2. Supabase RLS — portfolio still public');

{
  const { data, error } = await anon.from('portfolio').select('*').limit(1);
  if (!error && data && data.length > 0) {
    pass(`anon SELECT on portfolio → ${data.length} row(s) returned (public read intact)`);
  } else {
    fail('anon SELECT on portfolio returned 0 rows or errored', error?.message || 'No data');
  }
}

// ── 3. API — unauthenticated requests rejected ────────────────────────────────
section('3. API endpoint authentication');

async function expectStatus(label, url, options, expectedStatus) {
  try {
    const res = await fetch(url, options);
    if (res.status === expectedStatus) {
      pass(`${label} → ${res.status}`);
    } else {
      fail(`${label} → expected ${expectedStatus}, got ${res.status}`);
    }
  } catch (e) {
    fail(`${label} → fetch failed`, e.message);
  }
}

await expectStatus(
  'GET /api/gallery-config (no token)',
  `${BASE_URL}/api/gallery-config`,
  {},
  401,
);

await expectStatus(
  'GET /api/gallery-config (tampered JWT)',
  `${BASE_URL}/api/gallery-config`,
  { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.fake.signature' } },
  401,
);

await expectStatus(
  'GET /api/gallery-favorites (no token)',
  `${BASE_URL}/api/gallery-favorites`,
  {},
  401,
);

// ── 4. Rate limiting on gallery-auth ─────────────────────────────────────────
section('4. Rate limiting — gallery-auth (11 rapid wrong-code requests)');

{
  const authUrl = `${BASE_URL}/api/gallery-auth`;
  let hitLimit  = false;
  let lastStatus;

  for (let i = 1; i <= 11; i++) {
    try {
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: `wrong-code-${i}-${Date.now()}` }),
      });
      lastStatus = res.status;
      if (res.status === 429) { hitLimit = true; break; }
    } catch (e) {
      fail(`Request ${i} failed`, e.message);
      break;
    }
  }

  if (hitLimit) {
    pass('Rate limit triggered (429) within 11 attempts');
  } else {
    fail(
      `Rate limit NOT triggered after 11 attempts (last status: ${lastStatus})`,
      'Check rateLimit.js — RATE_LIMIT should be 10',
    );
  }
}

// ── 5. JWT token payload sanity ───────────────────────────────────────────────
section('5. JWT token payload — no full client row leaked');

if (!ACCESS_CODE_A) {
  skip('JWT payload check', 'Set GALLERY_ACCESS_CODE_A (or GALLERY_ACCESS_CODE) in .env');
} else {
  try {
    const res = await fetch(`${BASE_URL}/api/gallery-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode: ACCESS_CODE_A }),
    });

    if (res.status !== 200) {
      fail('Login with GALLERY_ACCESS_CODE_A failed', `HTTP ${res.status}`);
    } else {
      const { token } = await res.json();
      const parts = token?.split('.');
      if (!parts || parts.length !== 3) {
        fail('Response did not contain a valid JWT');
      } else {
        let payload;
        try       { payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()); }
        catch (_) { payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()); }

        const dangerousFields = ['cover_image_url', 'cover_video_url', 'supabase_url', 'service_key'];
        const leaked = dangerousFields.filter((f) => payload[f] !== undefined);
        if (leaked.length > 0) {
          fail('JWT payload contains unexpected full-row fields', leaked.join(', '));
        } else {
          pass(`JWT payload fields: ${Object.keys(payload).join(', ')}`);
        }
      }
    }
  } catch (e) {
    fail('JWT payload check threw', e.message);
  }
}

// ── 6. Cross-gallery favorites isolation ─────────────────────────────────────
section('6. Cross-gallery favorites isolation');

if (!ACCESS_CODE_A || !ACCESS_CODE_B) {
  skip(
    'Cross-gallery favorites check',
    'Set both GALLERY_ACCESS_CODE_A and GALLERY_ACCESS_CODE_B in .env',
  );
} else {
  try {
    const loginA = await fetch(`${BASE_URL}/api/gallery-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode: ACCESS_CODE_A }),
    });

    if (loginA.status !== 200) {
      fail('Could not log in as gallery A', `HTTP ${loginA.status}`);
    } else {
      const { token: tokenA } = await loginA.json();

      // Get a real file_id belonging to gallery B via service key (bypasses RLS)
      const { data: filesB } = await service
        .from('files')
        .select('id')
        .eq('access_code', ACCESS_CODE_B)
        .limit(1);

      if (!filesB || filesB.length === 0) {
        skip('Cross-gallery favorites check', 'No files found for GALLERY_ACCESS_CODE_B');
      } else {
        const fileBId = filesB[0].id;

        const res = await fetch(`${BASE_URL}/api/gallery-favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({ fileId: fileBId }),
        });

        if (res.status === 403 || res.status === 401) {
          pass(`Gallery A token rejected for gallery B file → ${res.status}`);
        } else if (res.status === 200 || res.status === 201) {
          fail(
            'Gallery A token favorited a gallery B file!',
            'Cross-gallery write not blocked — fix ownership check in gallery-favorites.js',
          );
        } else {
          // 400/404 are also acceptable rejections
          pass(`Gallery A token rejected for gallery B file → ${res.status}`);
        }
      }
    }
  } catch (e) {
    fail('Cross-gallery favorites check threw', e.message);
  }
}

// ── 7. Expired gallery returns 410 ───────────────────────────────────────────
section('7. Expired gallery → 410');

{
  const { data: expired } = await service
    .from('clients')
    .select('access_code')
    .or('is_active.eq.false,expires_at.lt.now()')
    .limit(1);

  if (!expired || expired.length === 0) {
    skip('Expired gallery 410 check', 'No inactive/expired gallery in DB');
  } else if (!DOWNLOAD_TOKEN_SECRET) {
    skip('Expired gallery 410 check', 'DOWNLOAD_TOKEN_SECRET not set — cannot mint test token');
  } else {
    const { default: jwt } = await import('jsonwebtoken');
    const expiredToken = jwt.sign(
      { accessCode: expired[0].access_code, sub: expired[0].access_code },
      DOWNLOAD_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    await expectStatus(
      `GET /api/gallery-config with stale token for inactive gallery`,
      `${BASE_URL}/api/gallery-config`,
      { headers: { Authorization: `Bearer ${expiredToken}` } },
      410,
    );
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n' + bold('─'.repeat(56)));
console.log(
  [
    passed  > 0 ? green(`${passed} passed`)    : null,
    failed  > 0 ? red(`${failed} failed`)      : null,
    skipped > 0 ? yellow(`${skipped} skipped`) : null,
  ]
    .filter(Boolean)
    .join('  '),
);
console.log('');

if (failed > 0) {
  console.log(red(bold('Security verification FAILED ✗')));
  process.exit(1);
} else {
  console.log(green(bold('Security verification PASSED ✓')));
  process.exit(0);
}
