/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'github-readme-stats.vercel.app' },
      { protocol: 'https', hostname: 'github-readme-stats-eight-theta.vercel.app' },
      { protocol: 'https', hostname: 'github-profile-trophy.vercel.app' },
      { protocol: 'https', hostname: 'github-readme-streak-stats.herokuapp.com' },
      { protocol: 'https', hostname: 'skillicons.dev' },
      { protocol: 'https', hostname: 'img.shields.io' },
      { protocol: 'https', hostname: 'komarev.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'user-badge.committers.top' },
      { protocol: 'https', hostname: 'github-readme-activity-graph.vercel.app' },
    ],
  },
}

module.exports = nextConfig
