<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Gemini-AI-7C5CFC?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
<img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License"/>

# ✨ GitHub README Generator

**Build a stunning GitHub profile README in minutes — no markdown knowledge required.**

[⭐ Star this repo](https://github.com/OgabekHub/github-readme-generator) · [🐛 Report Bug](https://github.com/OgabekHub/github-readme-generator/issues)

</div>

---

## 🎯 What is this?

GitHub profile READMEs are a developer's **digital business card** — but creating one requires knowing Markdown, hunting for badge/widget URLs, and constant trial-and-error.

**GitHub README Generator** turns all of that into a simple form. Fill it in, watch the live preview update, then copy, download or publish it to your profile in one click.

---

## ✨ Features

| Feature | |
|---------|--|
| Simple form with a live, GitHub-like preview | ✅ |
| **AI profile analysis** (GitHub API + Gemini): bio in 🇺🇿 🇬🇧 🇷🇺, your most-starred projects, detected tech stack, social links | ✅ |
| **Multi-language README** with Uzbek / English / Russian tabs | ✅ |
| 3 layouts: Classic, Minimalist, Cyberpunk | ✅ |
| 65 skill icons via [skillicons.dev](https://skillicons.dev), optional grouping | ✅ |
| 14 widgets: stats, streak, top languages, trophies, activity graph, summary cards, WakaTime, snake, 3D contributions, typing SVG, capsule header, banner, visitor counter, Uzbekistan rank | ✅ |
| 34 themes, translated to what every widget service supports | ✅ |
| **1-click publish** to your `username/username` repository (GitHub OAuth) | ✅ |
| Copy or download `README.md`; the form is saved in your browser | ✅ |
| UI in Uzbek, English and Russian · light & dark mode | ✅ |

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Tailwind CSS 3** · **Framer Motion** · **Lucide Icons**
- **Google Gemini** (`@google/generative-ai`)
- **marked** + **DOMPurify** for the sanitized preview
- **Vitest** + **ESLint** · GitHub Actions CI

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/OgabekHub/github-readme-generator.git
cd github-readme-generator
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Needed for | Notes |
|----------|------------|-------|
| `GEMINI_API_KEY` | AI analysis | Free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GITHUB_TOKEN` | Recommended | Raises the GitHub API limit from 60 to 5000 requests/hour; no scopes needed |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | 1-click publish | A [GitHub OAuth App](https://github.com/settings/developers) with the callback URL `<your-site>/api/auth/callback` |
| `NEXT_PUBLIC_SITE_URL` | Production | Public URL of your deployment — used for the header banner, the footer link and social previews |

Values left as `your_…_here` are treated as not set. Publishing only asks for the `public_repo` scope.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates Next.js route types and runs `tsc` |
| `npm test` | Unit tests (Vitest) |

CI runs lint, typecheck, tests and a production build on every push and pull request.

---

## 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OgabekHub/github-readme-generator)

Add the environment variables above in your Vercel project, set `NEXT_PUBLIC_SITE_URL` to your production URL, and update the OAuth App's callback URL to `https://<your-domain>/api/auth/callback`.

---

## 🔒 Security notes

- Everything a user, the AI or a GitHub profile provides is escaped in the generated README, and the live preview is sanitized with DOMPurify.
- GitHub OAuth uses a `state` parameter; the token is kept in an `httpOnly` cookie and revoked on logout.
- `/api/analyze` is rate limited per IP. The limiter is in memory (per server instance) — back it with a shared store such as Redis if you need strict limits.
- `/api/test-ai` (Gemini key diagnostics) only responds in development.

---

## 📁 Project Structure

```
app/
  page.tsx              main page (form + live preview)
  api/analyze           GitHub profile analysis + Gemini
  api/auth/*            GitHub OAuth (login, callback, session, logout)
  api/commit            writes README.md to username/username
  api/banner            dynamic SVG header banner
components/             ProfileForm, Preview, Dropdown, …
lib/
  readme-generator.ts   form data → README markdown
  themes.ts             theme names/colors per widget service
  github-api.ts         GitHub REST helpers + skill detection
  markdown.ts           sanitized preview rendering
  i18n.ts               UI translations (uz / en / ru)
tests/                  Vitest unit tests
```

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change, and make sure `npm run lint`, `npm run typecheck` and `npm test` pass.

```bash
# Fork → Clone → Create branch
git checkout -b feature/amazing-feature
# Make changes → Commit → Push → Open PR
```

---

## 📄 License

[MIT](LICENSE) — free to use, fork, and modify.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/OgabekHub">OgabekHub</a> · 
  <a href="https://github.com/OgabekHub/github-readme-generator">⭐ Star if you found it useful!</a>
</p>
