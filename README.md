# Portfolio site

A personal portfolio with a resume, social links and projects, built with Next.js (App Router),
TypeScript and Tailwind CSS. Animation and smooth scrolling come from Motion and Lenis. Ready to deploy on Vercel.

## Edit your content

All content lives in **`data/portfolio.ts`**. The main fields:

| Field | What it controls |
|---|---|
| `name`, `role`, `timezone` | Hero, nav, footer, live local time |
| `availability` | Status with a green dot at the top of the page (`""` hides it) |
| `focus` | Rotating phrases in the hero ("…building *fintech platforms*") |
| `marquee` | Words in the big scrolling banner under the hero |
| `statement`, `about`, `stats` | About section. The statement lights up word by word as you scroll; stats count up |
| `intros` | One-line intros next to the Experience, Work and Toolkit titles |
| `experience`, `leadership` | Timeline. Roles at the same company are grouped automatically |
| `projects` | Pinned, stacking project cards. Keep `highlights` to two short bullets so cards fit on laptops |
| `skills`, `education`, `socials`, `resume` | Toolkit cards, education card, links and the résumé PDF |

Wrap words in `*asterisks*` inside `statement` to set them in the orange italic serif.

### Files

- Résumé: `public/resume.pdf`
- Project screenshots (16:9): `public/projects/`

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Run `npm run build` to check that a production build succeeds.

## How it's put together

```
app/
  layout.tsx            Fonts, SEO metadata, theme + intro boot script, global providers
  page.tsx              Section order, and the curtain that slides over the hero
  globals.css           Tailwind, light/dark colour tokens, effects (grain, footer reveal, spotlight)
  opengraph-image.tsx   Link preview image for LinkedIn, Slack, etc.
  icon.tsx              Favicon
components/
  Providers.tsx         Lenis smooth scrolling, intro state, Motion config
  Preloader.tsx         Counter intro (once per browser session)
  Hero.tsx, DotField.tsx, RotatingWords.tsx
  Marquee.tsx, About.tsx, Experience.tsx, Work.tsx, Toolkit.tsx, Footer.tsx
  Nav.tsx, ThemeToggle.tsx, Cursor.tsx, ScrollProgress.tsx
  ui/                   Reusable pieces: RevealText, Magnetic, RollingText, CountUp, SpotlightCard
data/portfolio.ts       All of your content
lib/                    Small helpers and hooks
```

Accessibility: visitors who prefer reduced motion get native scrolling, no intro and no
scroll-driven movement. Everything is keyboard reachable, and animated text has a plain-text
version for screen readers.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js automatically.
3. Every push to `main` redeploys the site.

If you add a custom domain, set `NEXT_PUBLIC_SITE_URL` (for example `https://yourname.com`) in
the Vercel project's environment variables so link previews use the right address.
