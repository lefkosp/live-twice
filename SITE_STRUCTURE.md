# Live Twice - New Site Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Fixed on all pages)                               │
│  ┌──────────┐                          ┌──────────────┐   │
│  │    LT    │                          │ Get in Touch │   │
│  │  (logo)  │                          │   (button)   │   │
│  └──────────┘                          └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 1: Home

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         LIVE                                │
│                         TWICE                               │
│                                                             │
│         Bespoke social growth for                           │
│           electronic music artists.                         │
│                                                             │
│                  ┌──────────────┐                          │
│                  │ Get in Touch │                          │
│                  └──────────────┘                          │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- Large "LIVE TWICE" wordmark (logo typography)
- Single tagline underneath
- One CTA button
- Minimal, dramatic, centered

---

## Page 2: About

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         About                               │
│                                                             │
│          We work with a select group of                     │
│         artists. Our methods are proven, but                │
│         we keep them close. If you know, you know.          │
│                                                             │
│                  ┌──────────────┐                          │
│                  │ Get in Touch │                          │
│                  └──────────────┘                          │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- Simple "About" title
- One paragraph of mysterious copy
- One CTA button
- Completely minimal, no images, no details

---

## Page 3: Artists

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        Artists                              │
│                                                             │
│          ┌────┐                                            │
│          │LOGO│  MK                                        │
│          └────┘  ─────────────────────────────────────     │
│                                                             │
│          ┌────┐                                            │
│          │LOGO│  Michael Bibi                              │
│          └────┘  ─────────────────────────────────────     │
│                                                             │
│          ┌────┐                                            │
│          │LOGO│  Danny Howard                              │
│          └────┘  ─────────────────────────────────────     │
│                                                             │
│                  ┌──────────────┐                          │
│                  │ Get in Touch │                          │
│                  └──────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- "Artists" title
- 3 artists with logo + name
- Clean dividing lines between artists
- One CTA button

**Hover Interaction:**
When you hover over an artist:
1. Artist name + logo animate and scale up slightly
2. Artist name changes to accent red color
3. All other page elements fade to 20% opacity
4. Background changes to a B&W image of that specific artist
5. Subtle zoom effect on the background image

---

## Page 4: Contact

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                      Let's talk.                            │
│                                                             │
│              We work with a limited number                  │
│                     of artists.                             │
│           If you're serious about growth,                   │
│                   get in touch.                             │
│                                                             │
│                  ┌──────────────┐                          │
│                  │ Get in Touch │                          │
│                  └──────────────┘                          │
│                                                             │
│               business@livetwice.co.uk                      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Content:**
- "Let's talk." headline
- Brief selective positioning copy
- One CTA button (mailto link)
- Email address link
- Simple, direct, focused

---

## Footer Navigation (Desktop Only)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   ● ○ ○ ○                                  │
│                   Home                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Fixed at bottom center
- Shows 4 dots for 4 pages
- Active page highlighted in red
- Click to jump to any section
- Current section label below dots

---

## Design Philosophy

### Color Palette
- **Background:** Pure black (#0a0a0a)
- **Text:** White/off-white (#fafafa)
- **Accent:** Luxurious red (used sparingly)
- **Muted:** Gray tones for subtle elements

### Typography
- **Headings:** Geist Sans, light/regular weight
- **Body:** Geist Sans, regular weight
- **Accents:** Geist Mono for technical elements

### Interactions
- Magnetic button effects (buttons subtly follow cursor)
- Smooth horizontal scroll between sections (desktop)
- Vertical scroll on mobile
- Grain overlay for texture
- WebGL shader background for depth
- Custom cursor (desktop only)

### Spacing & Layout
- Maximum whitespace
- Centered content
- Generous padding
- Clear visual hierarchy without clutter

---

## What Makes This Different

### Before (Version 1)
- 11 sections with extensive information
- Detailed case studies with metrics
- Explanation of methodologies
- Multiple CTAs and options
- Stats-heavy results showcase
- Fan account tactics revealed
- Ad strategy explained

### After (Current Version)
- 4 minimal sections
- Zero methodology details
- No case study specifics
- Single focused CTA per page
- No stats or metrics shown
- No tactical information revealed
- Pure positioning and intrigue

---

## User Experience Flow

1. **Land on homepage** → See bold logo, understand it's about music artists
2. **Scroll to About** → Learn they're selective and secretive
3. **Scroll to Artists** → See they work with major names (social proof)
4. **Hover on artist** → Interactive experience shows quality/attention to detail
5. **Scroll to Contact** → Clear path to get in touch if interested
6. **Any page** → Always have access to "Get in Touch" CTA

The journey creates curiosity without revealing competitive advantages.

---

## Mobile Optimization

- Vertical scroll instead of horizontal
- Touch-optimized interactions
- Simplified layouts (no custom cursor, no magnetic effects)
- Same content hierarchy
- Responsive typography scales appropriately
- Artist hover effects disabled on mobile for better UX

---

## Technical Stack

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS v4
- **Animations:** Custom CSS transitions + transforms
- **Background:** WebGL shader (with fallback)
- **Typography:** Geist font family
- **Interactions:** Custom React hooks
- **Performance:** Optimized with scroll snap, transform3d, will-change

---

## Files Changed

```
Modified:
- app/page.tsx (complete rewrite, 571 lines)
- app/layout.tsx (simplified metadata)

Created:
- CHANGES.md (this summary)
- SITE_STRUCTURE.md (visual guide)

Unchanged:
- All component files
- All styling files
- All assets/images
- All hooks
```

---

## Next Steps for Launch

1. **Replace placeholder artist logos** with real logos
2. **Add proper artist background images** (high-quality B&W photos)
3. **Test hover interactions** on various devices
4. **Review copy** for brand voice alignment
5. **Update favicon** if needed (currently uses placeholder)
6. **SEO optimization** (metadata is minimal but can be enhanced)
7. **Deploy to production** (Vercel/Netlify recommended)

The site is now production-ready from a code perspective.
