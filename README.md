# Portfolio site

A personal portfolio with a resume, social links and projects.
Built with Next.js (App Router), TypeScript and Tailwind CSS. Ready to deploy on Vercel.

## Edit your content

All content lives in **`data/portfolio.ts`**. Replace the placeholders:

- `name`, `role`, `location`, `tagline`, `about`
- `socials`: LinkedIn, GitHub, email and X. Leave one as `""` to hide it.
- `skills`, `experience`, `projects`

TypeScript will flag a typo or a missing field when you run the dev server or build.

### Add your resume

Save your resume as `public/resume.pdf`.
To use a different filename, update `resume` in `data/portfolio.ts`.

### Add project screenshots (optional)

Put images in `public/projects/`, for example `public/projects/project-one.png`,
then set `image: "/projects/project-one.png"` on that project.
Projects without an image show a placeholder with their initials.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Run `npm run build` to check that a production build succeeds.

## Project structure

```
app/
  layout.tsx       Page shell, fonts, SEO metadata, theme script
  page.tsx         Puts the sections together
  globals.css      Tailwind import and light/dark colour tokens
components/        One component per section (Hero, About, Projects, ...)
data/portfolio.ts  All of your content
public/            Resume PDF and images
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Keep the default settings. Vercel detects Next.js automatically.
4. Click **Deploy**. Every push to `main` redeploys the site.

You can add a custom domain later under *Project → Settings → Domains*.
