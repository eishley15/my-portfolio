const TOKEN_KEY = 'gallery_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('galleryClient'); // remove legacy client object
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(accessCode) {
  const res = await fetch('/api/gallery-auth', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ accessCode }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Access code not found.');

  setToken(data.token);
  return data.token;
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getAccessCodeFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.accessCode || null;
  } catch {
    return null;
  }
}

// ── Share links ───────────────────────────────────────────────────────────────
// Exchange a /g/<token> share link for a gallery session JWT.
export async function loginWithShareToken(shareToken) {
  const res = await fetch('/api/gallery-auth', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ shareToken }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'This link is no longer active.');

  setToken(data.token);
  return data;
}

// Verify a share link's download PIN. On success the session is upgraded in place.
// Resolves to { ok: true } or { ok: false, error, attemptsLeft?, retryAfter? }.
export async function verifySharePin(pin) {
  const res = await fetch('/api/gallery-auth', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify({ action: 'verify-pin', pin }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not verify PIN.', attemptsLeft: data.attemptsLeft, retryAfter: data.retryAfter };

  setToken(data.token);
  return { ok: true };
}

export function isShareSession() {
  const token = getToken();
  if (!token) return false;
  try {
    return Boolean(JSON.parse(atob(token.split('.')[1])).sid);
  } catch {
    return false;
  }
}
