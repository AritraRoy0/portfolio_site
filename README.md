# Portfolio site

A personal portfolio with a resume, social links and projects, built with Next.js (App Router),
TypeScript and Tailwind CSS. Animation and smooth scrolling come from Motion and Lenis. Ready to deploy on Vercel.

## Edit your content

All content lives in **`data/portfolio.ts`**. The main fields:

| Field | What it controls |
|---|---|
| `name`, `role`, `timezone` | Hero, nav, ID badge, footer, live local time |
| `availability` | Status pill with a green dot in the hero, badge and footer (`""` hides it) |
| `tagline`, `searchDescription` | The tagline appears in the hero and link previews; `searchDescription` is the snippet under your name in Google (third person, under ~155 characters) |
| `currently` | "Now: …" line in the hero and About (`""` hides it) |
| `globeCaption` | Caption chip beside the hero globe (`""` hides it) |
| `focus` | Rotating phrases in the hero ("…building *fintech platforms*") |
| `marquee` | Words on the lime tape under the hero (the second tape lists your skills) |
| `statement`, `about`, `stats` | About section. The statement lights up word by word as you scroll; stats count up |
| `intros` | One-line intros next to the Experience, Work and Toolkit titles |
| `experience`, `leadership` | Timeline. Roles at the same company are grouped; numbers in bullets get a highlighter stroke |
| `projects` | 3D project carousel. Each project's screenshot is a card on the ring; its text appears underneath. Each project also gets its own page at `/projects/<title>`; add a few paragraphs to its optional `details` to give that page more to rank on |
| `skills` | Toolkit bento. Groups labelled Languages, Frameworks, Cloud, Databases or Tools each get a live illustration |
| `education`, `socials`, `resume` | ID badge, links, command menu and the résumé PDF |

Wrap words in `*asterisks*` inside `statement` and section titles to set them in the accent italic serif.

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

## What's on the page

- **Boot intro** (once per browser session): a log prints, a counter runs to 100, and the screen lifts away in columns. Any key or click skips it.
- **Hero**: a dotted globe with pulsing fleet nodes and data arcs. It spins faster as you scroll and can be dragged with the mouse.
- **Command menu**: press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> or <kbd>/</kbd> to jump to a section, open a project, copy the email or switch theme.
- **About**: an ID badge on a lanyard that swings when you scroll fast or drag it sideways.
- **Work**: a 3D turntable carousel. Drag or swipe the ring, scroll sideways on a trackpad, use the arrow
  keys or the controls, or click a side card to bring it round. It turns on its own (with a pause button)
  until you take over. With fewer than six projects, the ring repeats them so it always looks full.
- **Toolkit**: a code editor typing in each language, an orbit of frameworks, a deploy pipeline, a SQL query and a git graph.
- **Contact**: a lime footer revealed from underneath the page.
- **Project pages** (`/projects/vault`, …): a page per project with its screenshot, overview, highlights,
  stack and links, plus links to the other projects. Each has its own link-preview image.

## How it's put together

```
app/
  layout.tsx            Fonts, site-wide SEO metadata, theme + intro boot script, global providers
  page.tsx              Section order, the curtain that slides over the hero, structured data
  projects/[slug]/      A page per project, and its link preview image
  not-found.tsx         404 page
  globals.css           Tailwind, light/dark colour tokens, effects (grain, grid, spotlight, footer reveal)
  opengraph-image.tsx   Link preview image for LinkedIn, Slack, etc.
  icon.tsx, apple-icon.tsx   Favicon (also served at /favicon.ico) and home-screen icon
  robots.ts, sitemap.ts, manifest.ts, llms.txt/   Files for search engines, browsers and AI assistants
components/
  Providers.tsx         Lenis smooth scrolling, intro, command menu and toast state, Motion config
  Preloader.tsx         Boot-sequence intro
  Hero.tsx, Globe.tsx, RotatingWords.tsx
  Marquee.tsx, About.tsx, Badge.tsx, Experience.tsx, Work.tsx, Toolkit.tsx, Footer.tsx
  work/                 The project carousel: Carousel (ring, controls, autoplay), RingCard, ProjectDetails
  toolkit/              The live illustrations in the Toolkit cards
  Nav.tsx, CommandMenu.tsx, BackToTop.tsx, ThemeToggle.tsx, Cursor.tsx
  ui/                   Reusable pieces: RevealText, ScrambleText, Magnetic, RollingText, CountUp, SpotlightCard
data/
  portfolio.ts          All of your content
  landmask.ts           Packed land/sea mask for the globe (Natural Earth, public domain)
lib/                    Small helpers, hooks, the theme switch, and seo.ts (site URL, structured data)
```

Accessibility: visitors who prefer reduced motion get native scrolling, no intro, a still globe and
a carousel that turns instantly and never on its own. Everything is keyboard reachable: the project
ring is a slider (arrow keys, Home, End), the command menu is a proper combobox, and animated text
has a plain-text version for screen readers.

Performance: the globe pauses when it is covered or the tab is hidden, and drops to half rate on
slow devices; Toolkit animations only run while on screen.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js automatically.
3. Every push to `main` redeploys the site.

Canonical links, the sitemap and link previews use Vercel's production domain, so a custom domain
is picked up automatically on the next deploy. To force a specific address, set `NEXT_PUBLIC_SITE_URL`
(for example `https://yourname.com`) in the Vercel project's environment variables.

## Search engines

Everything is generated from `data/portfolio.ts`:

- `/sitemap.xml` (home and project pages, with screenshots) and `/robots.txt`, which points to it
- A canonical URL, title, description and link-preview image for every page
- Structured data (schema.org JSON-LD): a `Person`, `WebSite` and `ProfilePage` on the home page, and
  each project with a breadcrumb trail on its own page
- `/llms.txt`: the whole portfolio as plain Markdown for AI assistants and AI search
- Preview deployments are marked `noindex`, so only the production site shows up in search

To get indexed and see how the site performs in search:

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)):
   add a *URL prefix* property for your site URL, choose the *HTML tag* method, and copy the code from
   `content="..."`. Add it in Vercel as the environment variable `GOOGLE_SITE_VERIFICATION`, redeploy,
   then click *Verify*. Under *Sitemaps*, submit `sitemap.xml`.
2. **Bing Webmaster Tools** ([bing.com/webmasters](https://www.bing.com/webmasters)), which also feeds
   DuckDuckGo and ChatGPT search: import from Search Console, or verify with the meta tag code as
   `BING_SITE_VERIFICATION`, then submit the sitemap.
