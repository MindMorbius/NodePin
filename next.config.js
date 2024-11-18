/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

// 检测是否在 Cloudflare Pages 环境
if (process.env.CF_PAGES) {
  nextConfig.env = {
    ...nextConfig.env,
    NODEJS_COMPAT: '1'
  };
}

module.exports = nextConfig; 