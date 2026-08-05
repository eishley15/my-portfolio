# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Personal clients** — couples, families, and individuals hiring Kyle for milestone moments: weddings, portraits, events. Typically discover through social (Instagram, Facebook) or word of mouth. Evaluating primarily on aesthetic match, trustworthiness, and ease of inquiry.

**Commercial clients / brands** — businesses, local companies, and agencies in Tarlac and Angeles City / Pampanga looking for campaign, product, or event coverage. Evaluate on professionalism, breadth of work, and responsiveness.

Both audiences reach the site after a recommendation or social impression and need to quickly confirm Kyle is the right fit before reaching out.

## Product Purpose

Kyle Payawal Studio is a personal portfolio for a photo and video professional based in Tarlac and Angeles City, Pampanga. It exists to turn visitors who already have some intent — a referral, an Instagram follow — into inquiries and bookings. Success means the visitor leaves with enough confidence in Kyle's craft and professionalism to send a message or request a quote.

A secondary use case is the client gallery: a private, access-code-gated delivery system for sharing and downloading finished work with specific clients, backed by Supabase.

## Positioning

Kyle works across both photo and video, rooted in the Central Luzon market, with an editorial-dark visual identity that is uncommon in the local event and commercial photography space. The combination of high-production aesthetic and local accessibility is the distinguishing position — not just another bright, generic portfolio.

## Operating Context

- Visitors browse on mobile and desktop; mobile discovery from Instagram is common
- The site is the primary professional web presence (domain: kylepayawal.studio)
- Social links: instagram.com/payawalkyle and facebook.com/kyle.payawal
- Client gallery is a separate authenticated flow — clients receive an access code; not a public browsing experience
- Work is organized into categories (handled by Supabase); featured work surfaces on Home and Work pages

## Capabilities and Constraints

- React 18 + Vite, React Router v6, Framer Motion v11, Tailwind CSS v3
- Supabase for portfolio data storage and gallery file storage
- Pages: Home, Work, Gallery (client delivery), About, Contact
- Contact form posts to an API endpoint (Vercel serverless function implied by vercel.json)
- ZIP download of client galleries via jszip
- No CMS — content managed directly in Supabase
- No shadcn/ui — custom component system with CSS custom properties

## Brand Commitments

- **Name:** Kyle Payawal / Kyle Payawal Studio
- **Palette:** Aged Cream (`#EDE8DC`) as page background, Near-Black Ink (`#0E0C0B`) as foreground, stepped cream ramp (Linen Dim `#E3D9C8`, Pale Surface `#F4EFE5`, Antique White `#F0EBE0`) — no accent color. The no-accent rule is absolute; ink on cream is the entire palette on light surfaces.
- **Fonts:** Fraunces variable serif (display, weight 900 + italic 300 counterpoint) + Outfit 300/400 (body/UI) — replaces the previous Bebas Neue / Instrument Serif / DM Sans stack.
- **Shape:** Zero border radius throughout — buttons, cards, inputs, images. Sharp corners are an identity signal.
- **Texture:** Subtle film grain overlay (SVG fractalNoise, `mix-blend-mode: multiply`, ~3% opacity as `body::before`) — a committed aesthetic signal, not decoration.
- **Tone:** Editorial, minimal, confident — no clutter, no cheerful stock language.
- **Motion:** Framer Motion throughout; specular sheen on buttons, magnetic hover on cards, stagger reveals, parallax.

## Evidence on Hand

- Hero image: `src/assets/hero.png`
- Live portfolio images stored and served from Supabase
- Social presence: Instagram and Facebook pages exist
- Real client gallery delivery already built and in production

## Product Principles

1. **Craft first, conversion second.** The work must look extraordinary before any CTA is considered. A visitor who is wowed converts; a visitor who reads a pitch does not.
2. **Trust through restraint.** Professionalism is communicated by what is *not* there — no clutter, no noise, no generic language. Every element earns its place.
3. **Local authority, editorial presence.** The Pampanga/Tarlac market context is an asset, not a limitation. The aesthetic should feel like it belongs in Manila or abroad while being rooted here.
4. **Seamless client experience.** The private gallery flow must be as polished as the public portfolio — clients judge the studio by the delivery experience too.
5. **Mobile-first reality.** The primary discovery channel is Instagram; the first visit is almost certainly on a phone.

## Accessibility & Inclusion

No formally stated requirements. Standard WCAG 2.2 AA should apply given the public-facing nature of the site. The dark, low-contrast palette requires attention to text contrast ratios on muted/dimmed text tokens.
