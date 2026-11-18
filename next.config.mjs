
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone on your own server, default output on Vercel
  output: process.env.VERCEL ? undefined : 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'old.farajahan.com',
      },
    ],
  },

  staticPageGenerationTimeout: 180,

  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 2,
  },
};

export default withNextIntl(nextConfig);
