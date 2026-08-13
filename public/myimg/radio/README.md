# Station backdrops

Drop artwork here and point a station at it in `src/data/radio/index.ts`:

```ts
{
  id: 'saloon',
  // ...
  backdrop: {
    src: '/myimg/radio/saloon.jpg',
    mobileSrc: '/myimg/radio/saloon-mobile.jpg', // optional, portrait crop
    alt: '',                                     // '' if purely decorative
    opacity: 0.55,                               // lower = more station colour
    position: 'center',                          // CSS object-position
  },
}
```

Leave `backdrop` off and the station falls back to its generated CSS/SVG motif,
so stations can gain artwork one at a time.

## Specs

- Landscape ~1920x1080, plus an optional ~1080x1920 portrait crop for phones
- JPEG or WebP, aim under ~400KB each (the vignette hides fine detail anyway)
- Dark or mid-tone images work best; the vignette and grain sit on top
- Keep the centre visually quiet, since the track title sits there

## Sourcing

Only use art you have the right to use:

- Generate your own with an image model and keep the output
- Commission an illustrator
- Free-licence photography, e.g. Unsplash or Pexels, checking each licence

Do not reuse artwork from other radio sites; those are their commissioned
assets.
