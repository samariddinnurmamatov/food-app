import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts'); // 🔹 To‘g‘ri path

const nextConfig: NextConfig = {
  // Inline the (small) CSS into the HTML so it isn't a render-blocking request —
  // improves FCP/LCP on slow connections.
  experimental: { inlineCss: true },
  // (Next 16 removed the build-time ESLint integration, so no `eslint` key is needed —
  // `next build` no longer lints. Run ESLint separately if desired.)
  // Next 15 streams metadata into <body> (hoisted client-side) for normal UAs and
  // only blocks-and-renders it in <head> for recognized bots. That breaks the
  // <head> meta description for crawlers/Lighthouse whose UA looks like a normal
  // browser. Our metadata is STATIC, so blocking (non-streamed, always-in-<head>)
  // metadata for every UA costs ~nothing and is correct for SEO. Match all UAs.
  htmlLimitedBots: /.*/,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 16 requires every explicit next/image `quality` prop value to be
    // allow-listed here (banner q40, cards q60, default 75).
    qualities: [40, 55, 60, 75],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Telegram Mini App: NO X-Frame-Options / CSP frame-ancestors — the app runs
  // inside Telegram's iframe/webview and must remain embeddable. Safe headers only.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
