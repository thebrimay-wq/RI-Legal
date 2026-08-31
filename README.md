# RI Legal Group

Landing page for RI Legal Group, a California real estate and estate law practice.
Offices in El Segundo. Principal attorney: Russel Islam, Esq.

Static HTML, CSS, and one JavaScript file. No build step, no dependencies.

## Run it

Open `index.html` in a browser. That is the whole setup.

For a local server:

```bash
python3 -m http.server 8000
```

## Structure

```
index.html        One page: hero, about, what we do, how we work, contact
css/styles.css    Design tokens at the top, then components
js/main.js        Scroll engine, mobile nav, hero video, form validation
assets/           Logo, favicon, hero videos, photography
```

| Anchor | Content |
| --- | --- |
| Hero | Cover headline, lede, two CTAs, captioned film plate |
| `#about` | Two columns of body text with a drop cap, portrait, four facts |
| `#practice` | Six practice areas as a numbered index, photo plates, pull quote |
| `#process` | Four steps as a ruled table |
| `#contact` | Firm details and the intake sheet, laid over a photograph |

## Design system

Grotesque on paper. Every value is a token in the `:root` block at the top of
`css/styles.css`; components never name a raw colour, so the page re-skins from
that one block.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F2F0EA` | Page ground |
| `--paper-alt` | `#FFFFFF` | Alternating sections, intake sheet |
| `--paper-deep` | `#E8E5DD` | Contact section, image wells |
| `--ink` | `#111110` | Headlines, rules, buttons |
| `--ink-soft` | `#4A4843` | Body text |
| `--ink-faint` | `#6E6B64` | Labels, captions, helper text |
| `--accent` | `#C1462B` | Rules, drop cap, large text |
| `--accent-ink` | `#A63A22` | The accent as small text (passes AA) |
| `--rule` | `#D6D2C8` | Hairlines and dividers |

**Archivo** carries display and body. **Instrument Serif** italic appears exactly
twice, on the hero accent line and the pull quote. Filled-in form values use the
system monospace stack, which costs no extra font request and reads as typed.

Headings run at `-0.04em` tracking and `0.94` line height. There is no monospace
label font here; small labels are Archivo tracked out to `0.14em`–`0.2em`.

Every foreground and background pair was measured. The lowest ratio on the page is
`4.67:1` on 14px fact labels, against a `4.5:1` requirement. Form field borders are
`3.41:1` against the sheet, meeting WCAG 1.4.11 for non-text contrast.

### Editorial devices

- Drop cap on the first about paragraph, set in the accent
- Pull quote in Instrument Serif italic, drawn from the about copy
- Practice areas as a numbered index with hairline rules, not cards
- Gallery captions numbered `Fig. 01`–`Fig. 04`
- Intake form styled as a printed sheet: `Form RI-01` masthead, fields numbered
  `01`–`05`, tinted wells, and a drop shadow so it lifts off the section

## Motion

All scroll motion runs through one listener and one animation frame in
`js/main.js`, and touches nothing but `transform` and `opacity`.

| Effect | How |
| --- | --- |
| Heading reveal | Every word of a `[data-split]` heading is wrapped in a mask and slides up, staggered 55ms. The walker recurses into child elements, so the italic `<em>` survives the split |
| Block reveal | `[data-reveal]` fades and lifts 20px, siblings staggered 90ms via a `--d` property |
| Image parallax | Each `.frame__inner` is 118% of its frame and drifts ±7% across its transit of the viewport. The hero film and the contact plate use the same mechanism |
| Progress | A vermillion hairline along the bottom of the masthead, scaled to scroll position |
| Nav hover | The label slides up and a duplicate rises into its place, drawn from `data-text` |

Word masks carry `padding: 0 0.05em 0.22em` with a matching negative margin, which
keeps descenders and glyph side bearings inside the mask without changing layout.

`prefers-reduced-motion` removes all of it: the splitter never runs, reveals start
visible, parallax is forced to `none`, and the hero video never loads.

The scroll handler queues one frame at a time and clears its own queue flag on
`visibilitychange`. A queued frame never fires while the page is hidden, and the
flag would otherwise latch on and freeze the masthead and parallax for the session.

`js/main.js` also honours two opt-outs it inherited from an earlier dark build:
`body[data-magnetic="off"]` disables cursor-following buttons, and
`.hero__media[data-parallax="off"]` skips the full-page hero translate. Both are
set on this page.

## Header

`position: fixed`, paper at 92% with a 10px blur and a hairline rule beneath.
The masthead is light, so it
uses the black `RI legal logo.png`. The footer is dark and uses the white file.
`favicon.png` is the square R mark, used for the tab and the Apple touch icon.

## Hero video

Three clips loop behind the cover plate and crossfade:

| File | Clip | Length |
| --- | --- | --- |
| `hero-1.mp4` | Coastal home, aerial | 11.6s |
| `hero-2.mp4` | Downtown towers, aerial | 15.4s |
| `hero-3.mp4` | Document signing | 10.1s |

`hero-1.mp4` is the only one with a `src` in the HTML. `js/main.js` attaches the
next clip once playback starts, so the page paints on one 2.6 MB file rather than
three. Each clip hands off about a second before it ends, and the sequence wraps.

No playback and no download of clips 2 and 3 under `prefers-reduced-motion` or Data
Saver; `hero-poster.jpg` holds. Playback pauses when the hero scrolls out of view.

### Replacing a clip

Keep clips between 8 and 16 seconds and re-encode before committing:

```bash
ffmpeg -i source.mp4 -an -movflags +faststart \
  -vf "scale=1600:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slower -crf 30 -maxrate 2200k -bufsize 4400k -g 60 \
  assets/hero-1.mp4
```

That lands around 2 MB for a 12 second clip. Regenerate the poster from the lead:

```bash
ffmpeg -ss 1.5 -i assets/hero-1.mp4 -frames:v 1 -vf "scale=1600:-2" -q:v 6 assets/hero-poster.jpg
```

## Photography

Six photographs, cropped and encoded to WebP, 395 KB total:

| File | Where |
| --- | --- |
| `img-about.webp` | `#about`, beside the heading |
| `work-residential.webp` `work-commercial.webp` `work-landuse.webp` `work-trust.webp` | `#practice` plates |
| `img-contact.webp` | Behind the intake sheet |

All carry `filter: saturate(0.72–0.78) contrast(1.02–1.04)`. The sources came from
different libraries with different white balance, and one has a deep blue sky next
to another with green cabinetry; the shared grade pulls them together. Every one is
`loading="lazy"` with `width` and `height` set.

To swap one, crop and encode at the same ratio:

```bash
python3 -c "
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open('source.jpg')).convert('RGB')
ImageOps.fit(im, (700, 875), method=Image.LANCZOS, centering=(0.5, 0.42)).save(
    'assets/work-commercial.webp', 'WEBP', quality=78, method=6)
"
```

Use `(900, 1125)` for the about frame and `(900, 1200)` for the contact plate.

## Before this goes live

- [ ] **The form does not send anything.** It fakes a submit and shows a success
      message. Point it at Formspree, Netlify Forms, or your own endpoint; the block
      to replace is marked in `js/main.js`
- [ ] The four fact tiles in `#about`. `2` practices is safe. Confirm `Statewide`
      California coverage, the `48 hrs` response time, and the `Flat fee` promise
- [ ] The free-consultation claim in the hero note
- [ ] Practice copy, so it matches what the firm takes on. The land use and probate
      entries name California procedures (CEQA, conditional use permits, Superior
      Court probate); trim any the firm does not handle
- [ ] The original downloads still sit in `assets/` under their stock-library
      filenames and are gitignored, not committed. Delete them when you no longer
      need the masters
- [ ] Licence terms for the stock photography and footage

Have the firm review every claim on this page against California Rule of
Professional Conduct 7.1 and the State Bar advertising standards before publishing.

## Deploy

Live at **https://thebrimay-wq.github.io/RI-Legal/** via GitHub Pages, from `main`
at the repo root. Push to `main` and Pages rebuilds in a minute or two.

Netlify, Cloudflare Pages, and Vercel all work the same way. Nothing to build.

## Accessibility

Skip link, visible focus rings, labelled inputs with errors beside the field, 52px
form controls, 48px touch targets, a keyboard-operable menu, and
`prefers-reduced-motion` respected across reveals, heading splits, parallax, and
video. No content is gated behind motion: with JavaScript off, headings are plain
text, every section is visible, and the form still posts.
