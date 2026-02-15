# Artist Assets Integration Guide

## Overview
This guide explains how to add the actual artist logos and background images to replace the current placeholders.

---

## Current Status

### What's Currently Used (Placeholders)

**Artist Logos:**
- All three artists currently use: `/placeholder-logo.svg`
- Displays as a gray box with "LOGO" text

**Artist Background Images:**
- MK: `/luxury-recording-studio-with-microphone-in-dramati.jpg`
- Michael Bibi: `/professional-music-producer-at-mixing-console-with.jpg`
- Danny Howard: `/massive-concert-crowd-at-music-festival-with-red-s.jpg`

These are generic stock images and should be replaced with actual artist photos.

---

## Step 1: Prepare Artist Logos

### Requirements for Logos

**File Format:**
- SVG (preferred) or PNG with transparency
- High resolution (min 200x200px for PNG)

**Style Guidelines:**
- Should work well on black background
- White or light-colored logos work best
- Should be recognizable at small sizes (64x64px on desktop, 80x80px on mobile)

**Naming Convention:**
```
/public/mk-logo.svg (or .png)
/public/michael-bibi-logo.svg (or .png)
/public/danny-howard-logo.svg (or .png)
```

### Example Logo Preparation

If you have existing logos:
1. Export as SVG or PNG with transparent background
2. Ensure they're properly sized (square aspect ratio works best)
3. Test on black background to ensure visibility
4. Optimize file size (compress PNGs, minify SVGs)

---

## Step 2: Prepare Artist Background Images

### Requirements for Background Images

**File Format:**
- JPG or PNG
- Optimized for web (compressed but high quality)

**Dimensions:**
- Minimum: 1920x1080px (Full HD)
- Recommended: 2560x1440px (2K) or higher
- Aspect ratio: 16:9 (landscape)

**Content Guidelines:**
- High-quality photos of the artist
- Should work well in **grayscale/black and white**
- Dramatic lighting preferred
- Performance shots, studio shots, or portraits work best
- Should have good contrast (not too flat)

**Image Style:**
- Will automatically be converted to grayscale by CSS
- Opacity will be set to 30%
- Subtle zoom effect on hover
- Should look good with dark overlay

**Naming Convention:**
```
/public/mk-artist-photo.jpg
/public/michael-bibi-artist-photo.jpg
/public/danny-howard-artist-photo.jpg
```

### Example Background Image Sources

Good options for artist photos:
- Official press photos from the artist's team
- High-quality performance shots from live shows
- Studio session photography
- Professional portrait photography

Avoid:
- Low resolution images
- Images with busy backgrounds
- Photos that don't work well in B&W
- Images with poor lighting/contrast

---

## Step 3: Add Files to Project

### File Locations

Place all files in the `/public` folder:

```
/public/
  mk-logo.svg
  michael-bibi-logo.svg
  danny-howard-logo.svg
  mk-artist-photo.jpg
  michael-bibi-artist-photo.jpg
  danny-howard-artist-photo.jpg
```

---

## Step 4: Update the Code

### Edit `/app/page.tsx`

Find the `artists` array (around line 29) and update it:

**Current code:**
```typescript
const artists = [
  {
    name: "MK",
    logo: "/placeholder-logo.svg",
    image: "/luxury-recording-studio-with-microphone-in-dramati.jpg"
  },
  {
    name: "Michael Bibi",
    logo: "/placeholder-logo.svg",
    image: "/professional-music-producer-at-mixing-console-with.jpg"
  },
  {
    name: "Danny Howard",
    logo: "/placeholder-logo.svg",
    image: "/massive-concert-crowd-at-music-festival-with-red-s.jpg"
  }
]
```

**Update to:**
```typescript
const artists = [
  {
    name: "MK",
    logo: "/mk-logo.svg",
    image: "/mk-artist-photo.jpg"
  },
  {
    name: "Michael Bibi",
    logo: "/michael-bibi-logo.svg",
    image: "/michael-bibi-artist-photo.jpg"
  },
  {
    name: "Danny Howard",
    logo: "/danny-howard-logo.svg",
    image: "/danny-howard-artist-photo.jpg"
  }
]
```

### Save and Test

After updating:
1. Save the file
2. Check the browser (dev server should auto-refresh)
3. Scroll to the Artists page
4. Hover over each artist to see their background image
5. Check that logos display correctly

---

## Step 5: Optimize the Images (Optional but Recommended)

### Compress Images

Use tools to optimize file sizes without losing quality:

**Online Tools:**
- TinyPNG (https://tinypng.com) - for PNG compression
- Squoosh (https://squoosh.app) - for JPG optimization
- SVGOMG (https://jakearchibald.github.io/svgomg/) - for SVG optimization

**Target File Sizes:**
- Logos: < 50KB (SVG) or < 100KB (PNG)
- Background images: < 500KB each

### Next.js Image Optimization

For even better performance, you can use Next.js Image component instead:

```typescript
import Image from 'next/image'

// Then in the background section:
<Image
  src={artists.find((a) => a.name === hoveredArtist)?.image}
  alt=""
  fill
  className="object-cover grayscale opacity-30"
  priority
/>
```

This provides automatic optimization and lazy loading.

---

## Testing Checklist

After adding assets, test the following:

- [ ] All three artist logos display correctly
- [ ] Logos are visible on black background
- [ ] Logos scale appropriately on mobile
- [ ] Hovering over MK shows MK's background image
- [ ] Hovering over Michael Bibi shows Michael Bibi's background image
- [ ] Hovering over Danny Howard shows Danny Howard's background image
- [ ] Background images look good in grayscale
- [ ] Background images have proper contrast
- [ ] Hover transition is smooth (no lag)
- [ ] Images load quickly (file sizes optimized)
- [ ] Mobile experience works correctly (no hover issues)

---

## Troubleshooting

### Logo Not Showing
- Check file path is correct
- Verify file is in `/public` folder
- Check file extension matches code (.svg vs .png)
- Inspect browser console for 404 errors

### Background Image Not Showing
- Check file path and name
- Verify image file is not corrupted
- Check file size (very large images may cause performance issues)
- Inspect element in browser dev tools to see if CSS is applied

### Image Quality Issues
- Use higher resolution source images
- Ensure compression didn't degrade quality too much
- Test grayscale conversion manually to see if image works in B&W

### Performance Issues
- Compress images more aggressively
- Consider using WebP format for better compression
- Use Next.js Image component for automatic optimization
- Add loading states for images

---

## Alternative: Using Artist Data Object

If you have many artists or want more flexibility, you could create a separate data file:

**Create `/data/artists.ts`:**
```typescript
export interface Artist {
  name: string
  logo: string
  image: string
}

export const artists: Artist[] = [
  {
    name: "MK",
    logo: "/mk-logo.svg",
    image: "/mk-artist-photo.jpg"
  },
  {
    name: "Michael Bibi",
    logo: "/michael-bibi-logo.svg",
    image: "/michael-bibi-artist-photo.jpg"
  },
  {
    name: "Danny Howard",
    logo: "/danny-howard-logo.svg",
    image: "/danny-howard-artist-photo.jpg"
  }
]
```

**Then import in `/app/page.tsx`:**
```typescript
import { artists } from '@/data/artists'
```

This approach makes it easier to manage artist data separately from UI code.

---

## Need Help?

If you run into issues:

1. Check browser console for errors
2. Verify all file paths are correct
3. Ensure files are properly named and located
4. Test with one artist first before adding all three
5. Clear browser cache if images don't update

The site will work with placeholder logos/images, but will look much better with actual artist assets!
