// next.config.mjs
const repo = '3d-globe';
const isProd = process.env.NODE_ENV === 'production';

export default {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  images: { unoptimized: true },

  // keep from your original config to prevent build failures
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
