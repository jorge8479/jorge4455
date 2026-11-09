# UI Improvement Plan — FiveM/UCP Inspiration

## Research Findings

Premium FiveM/UCP websites share these patterns:
1. **Glassmorphism** — frosted glass cards with `backdrop-filter: blur`
2. **Scroll animations** — Intersection Observer fade-in on scroll
3. **Gradient section backgrounds** — subtle radial gradients, not flat colors
4. **Glow effects** — box-shadow glow on hover, accent color halos
5. **Live stats** — animated counters, real-time player counts
6. **Social proof** — testimonials, player count badges
7. **Better Discord section** — prominent with live member count
8. **Social links** — Twitter, YouTube, TikTok in footer
9. **Copy IP button** — one-click server connection
10. **Smooth micro-interactions** — button transforms, link underline animations

---

## Changes to Implement

### 1. `globals.css` — Design System Upgrade

**Glassmorphism utility:**
```css
.glass {
  background: rgba(11, 16, 24, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

**Scroll animation system:**
```css
.reveal { opacity: 0; transform: translateY(24px); transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
.reveal.visible { opacity: 1; transform: translateY(0); }
```

**Glow hover effects:**
```css
.glow-hover { transition: box-shadow 0.3s; }
.glow-hover:hover { box-shadow: 0 0 30px rgba(0, 180, 255, 0.15); }
```

**Section gradient backgrounds:**
```css
.section--gradient { background: radial-gradient(ellipse at center top, rgba(0, 180, 255, 0.03) 0%, var(--bg) 60%); }
```

**Animated counter:**
```css
@keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
```

**New button variants:**
- `.btn--glow` — primary with animated glow pulse
- `.btn--discord` — Discord purple styling

**Improved card system:**
- `.card` — base card with glass effect
- `.card--hover` — card with glow on hover

### 2. `HeroSection.tsx` — Enhance

- Add animated number counters for stats (useEffect + requestAnimationFrame)
- Add subtle parallax on background image
- Add "Connect" button with server IP copy functionality
- Add pulse animation on the online status dot
- Better spacing and typography hierarchy

### 3. `FeaturesGrid.tsx` — Enhance

- Add scroll reveal animations (IntersectionObserver)
- Add hover glow effect on cards
- Add subtle background gradient on section

### 4. `StorePreview.tsx` — Enhance

- Add scroll reveal animations
- Add glow effect on featured card
- Add "Most Popular" badge animation
- Better card hover effects

### 5. `TopPlayers.tsx` — Enhance

- Add scroll reveal animations
- Add hover effect on rows
- Add rank badge glow for top 3

### 6. `LatestNews.tsx` — Enhance

- Update to use new CSS variable system (currently uses old hardcoded colors)
- Add scroll reveal animations
- Add hover glow on news items

### 7. `DiscordWidget.tsx` — Complete Rewrite

- Full-width section with Discord branding
- Live member count display
- Gradient background with Discord purple
- Animated join button
- Social proof text

### 8. `Navbar.tsx` — Enhance

- Add glassmorphism effect when scrolled
- Add subtle border glow on scroll
- Add active link indicator (underline)

### 9. `Footer.tsx` — Enhance

- Add social media links (Twitter, YouTube, TikTok, Instagram)
- Add newsletter signup form (visual only)
- Add "Copy IP" with animation
- Better spacing

### 10. New: `ScrollReveal.tsx` — Reusable Component

A client component that wraps children and adds scroll reveal animation using IntersectionObserver.

### 11. `page.tsx` — Update

- Wrap sections in ScrollReveal components
- Add new sections if needed

---

## Implementation Order

1. `globals.css` — Foundation (glass, reveal, glow, gradient utilities)
2. `ScrollReveal.tsx` — New reusable component
3. `HeroSection.tsx` — Animated counters, parallax
4. `FeaturesGrid.tsx` — Scroll reveal, glow hover
5. `StorePreview.tsx` — Scroll reveal, glow
6. `TopPlayers.tsx` — Scroll reveal
7. `LatestNews.tsx` — Fix CSS variables, scroll reveal
8. `DiscordWidget.tsx` — Complete rewrite
9. `Navbar.tsx` — Glassmorphism
10. `Footer.tsx` — Social links, newsletter
11. `page.tsx` — Compose with ScrollReveal
12. Build verification

---

## Key Design Principles

- **Glassmorphism** everywhere — cards, panels, navbar
- **Scroll reveal** — everything fades in on scroll
- **Glow effects** — accent color glow on hover
- **Gradient backgrounds** — subtle radial gradients per section
- **Animated numbers** — counter animation for stats
- **Micro-interactions** — button transforms, link animations
- **Social proof** — player counts, testimonials
- **Dark immersive** — deep navy with cyan accents

---

## Verification
- `npx next build` — all routes compile
- Test scroll animations in browser
- Test responsive at 375px, 768px, 1440px
