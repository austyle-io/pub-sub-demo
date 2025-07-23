const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  flexsearch: {
    codeblocks: true,
  },
  codeHighlight: true,
});

module.exports = withNextra({
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Static export configuration
  distDir: 'dist',
  basePath: process.env.NODE_ENV === 'production' ? '/docs' : '',
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
});
