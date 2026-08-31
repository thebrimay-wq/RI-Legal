# RI Legal Group

Landing page for RI Legal Group, a California real estate and estate law practice.
Offices in El Segundo. Principal attorney: Russel Islam, Esq.
Static HTML, CSS, and one small JS file. No build step, no dependencies.

## Run it

Open `index.html` in a browser. That is the whole setup.

For a local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Structure

```
index.html        One page: hero, about, what we do, how we work, contact
css/styles.css    Design tokens at the top, then components
js/main.js        Hero video sequence, mobile nav, scroll reveal, form validation
assets/           Logo, hero videos, hero poster, section photography
```

## Sections

| Anchor | Content |
| --- | --- |
| Hero | Full-bleed video under a transparent header, positioning line, lede, two CTAs |
| `#about` | Two paragraphs on the firm, plus a four-tile fact strip |
| `#practice` | Six cards: residential, commercial, leasing, land use, estate planning, probate |
| `#process` | Four steps from consultation to close-out |
| `#contact` | Office details and the intake form |

## Design system

Technical minimalism: graphite ground, bone type, one brass signal colour. Every value
is a token in the `:root` block at the top of `css/styles.css`; components never name a
raw colour, so the whole page re-skins from that one block.

| Token | Value | Use |
| --- | --- | --- |
| `--ink-900` | `#0C0C0E` | Page ground |
| `--ink-850` | `#111114` | Alternating sections, form |
| `--ink-950` | `#08080A` | Hero base and footer |
| `--bone` | `#EDEAE4` | Primary text |
| `--muted` | `#9A968E` | Body and secondary text |
| `--faint` | `#8A8781` | Mono meta, captions, helper text |
| `--brass` | `#D4B36A` | Accent word, eyebrows, CTA, focus ring |
| `--brass-deep` | `#A8894A` | Index numbers, hairline gradients |
| `--line` | `rgba(255,255,255,0.07)` | Grid rails, dividers, card seams |

Type is **Space Grotesk** for display and body, **JetBrains Mono** for every label,
index, caption, and piece of meta. The mono is doing the technical work: section
indices (`01 / About the firm`), card numbers, coordinates, and form labels.

Headings run at `-0.035em` tracking and `1.02` line height, which is what makes the
display type read as contemporary rather than corporate.

Every foreground and background pair on the page was measured: the lowest ratio
anywhere is 5.08:1 on 12px helper text, against a 4.5:1 requirement.

### Atmosphere

Three fixed layers sit behind and above the content, all `pointer-events: none` and all
decoration only:

- `.rails` — five hairlines pinned to the container edges and thirds, so the page scrolls
  against a stationary rule system. Two are dropped below 860px
- `.grain` — an inline SVG `feTurbulence` at 30% on `mix-blend-mode: overlay`
- `.bloom` — blurred brass discs behind the about and contact sections

## Motion

All scroll motion runs through one listener and one animation frame in `js/main.js`, and
touches nothing but `transform` and `opacity`.

| Effect | How |
| --- | --- |
| Hero parallax | The video layer trails the page by 0.26. `.hero__media` is inset `-12%` top and bottom so the frame never runs out of picture |
| Image parallax | Each `.frame__inner` is 118% of its frame and drifts ±7% across its transit of the viewport |
| Heading reveal | `js/main.js` wraps every word of a `[data-split]` heading in a mask and slides it up, staggered 55ms. The walker recurses into child elements, so the brass `<em>` in the hero survives the split |
| Block reveal | `[data-reveal]` fades and lifts 28px. Siblings in a group are staggered 90ms apart via a `--d` custom property |
| Progress | A hairline along the bottom of the header, scaled to scroll position |
| Magnetic buttons | Buttons lean toward the cursor within their own bounds. Fine pointers only |
| Nav hover | The label slides up and a duplicate rises into its place, drawn from `data-text` |
| Card hover | A brass wash scales up from the bottom edge |

`prefers-reduced-motion` removes all of it: headings render as plain text (the splitter
never runs), reveals start visible, parallax transforms are forced to `none`, and the
grain and hero scan lines are hidden.

The scroll handler queues one frame at a time. It also clears its own queue flag on
`visibilitychange`, because a queued frame never fires while the page is hidden and the
flag would otherwise latch on and freeze the header, progress bar, and parallax for the
rest of the session.

## Header

The bar is `position: fixed` and starts transparent over the hero video, with a short
dark gradient beneath it so the type clears the brightest frame. Past 8px of scroll
`js/main.js` sets `data-scrolled="true"` and the bar takes the page ground at 82% with a
16px blur and a hairline border. A brass hairline along its bottom edge tracks scroll
position. Opening the mobile menu forces the solid state through `data-menu="open"`, so
the panel never floats over the video.

Nav labels slide up on hover while a duplicate rises into place, drawn from each link's
`data-text` attribute. The current section is marked with `aria-current` by an observer
that picks the highest section on the page, so exactly one item is ever lit.

### Logo files

The header holds two `<img>` marks. The bar is dark in every state now, so only the
white one is shown:

| File | Used by |
| --- | --- |
| `RI legal logo white.png` | The header and the footer |
| `RI legal logo.png` | Kept for `.logo--dark`, which the dark palette leaves hidden. Restore it by removing `display: none` from that rule if the page ever gains a light surface behind the bar |

Neither carries a CSS filter. `favicon.png` is the square R mark, white
on charcoal, used for the browser tab and as the Apple touch icon. The full wordmark
was the favicon at first and collapsed into an unreadable sliver at 16px, which is why
the square mark exists.

## Photography

Six stock photographs, cropped and re-encoded to WebP:

| File | Where | Ratio |
| --- | --- | --- |
| `img-about.webp` | `#about`, beside the heading | 4:5 |
| `work-residential.webp` | `#practice` strip | 4:5 |
| `work-commercial.webp` | `#practice` strip | 4:5 |
| `work-landuse.webp` | `#practice` strip | 4:5 |
| `work-trust.webp` | `#practice` strip | 4:5 |
| `img-contact.webp` | `#contact`, under the details | 4:5 |

All six carry `filter: saturate(0.5) contrast(1.1) brightness(0.74)`. The sources came
from different libraries with different white balance, and one has a deep blue sky next
to another with green cabinetry. The shared grade pulls them together and drops them far
enough that they read as apertures in the graphite rather than bright rectangles pasted
on it. The gallery lifts to near-full saturation on hover. Adjust in the `.frame__inner
img` rule. Every one is `loading="lazy"` with `width` and `height` set, so nothing
below the fold blocks the first paint and nothing shifts as they arrive.

To swap one, crop and encode at the same ratio:

```bash
python3 -c "
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open('source.jpg')).convert('RGB')
ImageOps.fit(im, (700, 875), method=Image.LANCZOS, centering=(0.5, 0.42)).save(
    'assets/work-commercial.webp', 'WEBP', quality=78, method=6)
"
```

Use `(900, 1125)` for the about frame and `(900, 1200)` for the contact frame.

## Hero video

Three clips loop behind the hero and crossfade into each other:

| File | Clip | Length |
| --- | --- | --- |
| `hero-1.mp4` | Coastal home, aerial | 11.6s |
| `hero-2.mp4` | Downtown towers, aerial | 15.4s |
| `hero-3.mp4` | Document signing | 10.1s |

`hero-1.mp4` is the only one with a `src` in the HTML. `js/main.js` attaches the next
clip once playback starts, so the page paints on one 2.6 MB file rather than three.
Each clip hands off about a second before it ends, and the sequence wraps.

`.hero__scrim` sits between the video and the copy. It is three stacked gradients: a
warm highlight top right, a left-to-right darkening pass, and a vertical vignette. The
darkest point is 90% over the headline and the lightest is 66% at the right edge, which
keeps every line of hero text above 4.5:1 even on the brightest frame.

The videos never play when the visitor has **reduced motion** turned on or **Data Saver**
enabled. In both cases `hero-poster.jpg` stays up and the other two files are never
requested. Playback also pauses when the hero scrolls out of view and resumes when the
tab comes back to the foreground.

### Replacing a clip

Drop the new file in `assets/`, then change the `src` on the first `<video>` or the
`data-src` on the other two in `index.html`. Keep clips between 8 and 16 seconds, and
re-encode before committing:

```bash
ffmpeg -i source.mp4 -an -movflags +faststart \
  -vf "scale=1600:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slower -crf 30 -maxrate 2200k -bufsize 4400k -g 60 \
  assets/hero-1.mp4
```

That lands around 2 MB for a 12 second clip. The source files sit behind a scrim at
partial opacity, so 1600px and CRF 30 hold up. Regenerate the poster from the first
frame of whichever clip leads:

```bash
ffmpeg -ss 1.5 -i assets/hero-1.mp4 -frames:v 1 -vf "scale=1600:-2" -q:v 6 assets/hero-poster.jpg
```

## Before this goes live

The page ships with placeholder contact details and claims. Replace:

- [ ] The four fact tiles in `#about`. `2` practices is safe. Confirm `Statewide`
      California coverage, the `48 hrs` response time, and the `Flat fee` promise
- [ ] Practice card copy, so it matches what the firm actually takes on. The land use
      and probate cards name California procedures (CEQA, conditional use permits,
      Superior Court probate); trim any the firm does not handle
- [ ] The intake email. It currently points at `russislam@gmail.com` in `#contact` and
      the footer. A domain address reads better on a firm site and is easier to hand off
- [ ] The form handler in `js/main.js`. It currently fakes a submit. Point it at
      Formspree, Netlify Forms, or your own endpoint. The block to replace is marked
- [ ] The original downloads still sit in `assets/` under their stock-library filenames:
      three 2560x1440 videos at about 48 MB and six 1920px JPEGs at about 3 MB. Nothing
      references them. Delete them or add them to `.gitignore` before the first commit
- [ ] Licence terms for the stock photography and footage, if the firm plans to keep
      these rather than shoot its own

Have the firm review every claim on this page, including the response time, the
statewide reach, and the fee language, against California Rule of Professional
Conduct 7.1 and the State Bar advertising standards before publishing.

## Deploy

GitHub Pages, from the repo root:

Settings → Pages → Source: Deploy from a branch → `main` / `(root)`

Netlify, Cloudflare Pages, and Vercel all work the same way. There is nothing to build.

## Accessibility

Skip link, visible focus rings, labelled inputs with errors beside the field, 48px
touch targets, a keyboard-operable menu, and `prefers-reduced-motion` respected across
the scroll reveals, the heading splits, the parallax, and the hero video. No content is
gated behind motion: with JavaScript off, headings are plain text, every section is
visible, and the form still posts.
All body and helper text clears 4.5:1 in both themes. Re-check contrast if you
change the palette.
