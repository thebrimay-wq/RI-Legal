# RI Legal

Marketing site for RI Legal, a Rhode Island law practice. Static HTML and CSS — no build step, no dependencies.

## Run it

Open `index.html` in a browser. That's the whole setup.

For a local server (needed if you add fetch calls or routing later):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html        One page, sectioned: hero, practice areas, attorneys, process, contact
css/styles.css    Design tokens at the top, then components
js/main.js        Progressive enhancement — mobile nav, scroll reveal, form validation
assets/           Attorney photos and any images
```

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `--color-primary` | `#1E3A8A` | Navy. Headers, links, the institution. |
| `--color-accent` | `#B45309` | Gold. Reserved for the primary CTA only. |
| `--color-foreground` | `#0F172A` | Body text on light surfaces. |
| `--color-background` | `#F8FAFC` | Page ground. |

Type is **EB Garamond** for headings and **Lato** for body, loaded from Google Fonts.
Dark mode follows the OS setting through `prefers-color-scheme`; both palettes are
defined in `css/styles.css` and meet WCAG AA contrast.

Change the palette by editing the `:root` block at the top of `css/styles.css`. Every
component reads from those variables, so nothing else needs to be touched.

## Before this goes live

The site ships with placeholder content. Replace:

- [ ] Attorney names, bios, bar admissions, and law schools in the `#attorneys` section
- [ ] Photos — placeholder SVGs sit at `assets/attorney-1.svg`–`attorney-3.svg`. Drop in real images (4:5 ratio, ~800×1000px) and update the `src` in `index.html`
- [ ] Office address, phone, and email — they appear in `#contact` **and** the footer
- [ ] The stats block (`30+`, `600+`, `48 hrs`, `2`) with real, defensible numbers
- [ ] The client testimonial, or delete the section
- [ ] Practice area descriptions to match what the firm actually takes on
- [ ] The form handler in `js/main.js` — it currently fakes a submit. Point it at
      Formspree, Netlify Forms, or your own endpoint.

Advertising rules for attorneys vary by state. Have the firm review all claims,
the testimonial, and the disclaimers against Rhode Island Rule of Professional
Conduct 7.1 before publishing.

## Deploy

GitHub Pages, from the repo root:

Settings → Pages → Source: Deploy from a branch → `main` / `(root)`

Any static host works — Netlify, Cloudflare Pages, Vercel. There is nothing to build.

## Accessibility

Built to WCAG AA: skip link, visible focus rings, labeled inputs with errors beside
the field, 48px touch targets, `prefers-reduced-motion` respected, and keyboard-operable
navigation. Re-check contrast if you change the palette.
