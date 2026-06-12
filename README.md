<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Gemini-AI-7C5CFC?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
<img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License"/>

# ✨ GitHub README Generator

**Build a stunning GitHub profile README in minutes — no markdown knowledge required.**

[🚀 Live Demo](https://github-readme-generator-one.vercel.app) · [⭐ Star this repo](https://github.com/OgabekHub/github-readme-generator) · [🐛 Report Bug](https://github.com/OgabekHub/github-readme-generator/issues)

</div>

---

## 🎯 What is this?

GitHub profile READMEs are a developer's **digital business card** — but creating one requires knowing Markdown, hunting for badge/widget URLs, and constant trial-and-error.

**GitHub README Generator** turns all of that into a simple form. Fill it in, watch the live preview update instantly, click Download. Done.

---

## 🤖 V2: AI-Powered Bio Generator *(New!)*

Enter your GitHub username and click **✨ AI Tahlil** — the tool will:

1. Fetch your public repositories via GitHub API
2. Analyze your top languages and repo topics
3. Ask **Gemini AI** to write a professional bio tailored to you
4. Auto-detect and suggest your tech stack from your actual code

No manual typing needed. One click, and your profile comes alive.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Simple form — name, bio, location, social links | ✅ |
| **AI bio generation** (GitHub API + Gemini AI) | ✅ New in V2 |
| **AI tech stack detection** from your repos | ✅ New in V2 |
| 40+ skill icons via [skillicons.dev](https://skillicons.dev) | ✅ |
| 8 GitHub stats themes (Radical, Dracula, Tokyo Night…) | ✅ |
| Stats · Streak · Top Languages · Trophies · Visitor counter | ✅ |
| Live preview as you type | ✅ |
| One-click copy **or** download as `README.md` | ✅ |
| Open Graph meta tags for social sharing | ✅ |

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript 5**
- **Tailwind CSS 3**
- **Google Gemini AI** (`@google/generative-ai`)
- **Lucide Icons**

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/OgabekHub/github-readme-generator.git
cd github-readme-generator
npm install
```

### 2. Add your Gemini API key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste your key (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):

```env
GEMINI_API_KEY=your_key_here
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OgabekHub/github-readme-generator)

> Don't forget to add `GEMINI_API_KEY` in your Vercel project's Environment Variables.

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork → Clone → Create branch
git checkout -b feature/amazing-feature
# Make changes → Commit → Push → Open PR
```

---

## 📄 License

MIT — free to use, fork, and modify.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/OgabekHub">OgabekHub</a> · 
  <a href="https://github.com/OgabekHub/github-readme-generator">⭐ Star if you found it useful!</a>
</p>
