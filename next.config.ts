import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts'); // 🔹 To‘g‘ri path

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
};

export default withNextIntl(nextConfig);
