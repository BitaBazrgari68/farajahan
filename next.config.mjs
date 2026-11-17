import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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