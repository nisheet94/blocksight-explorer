/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // webpack(config) {
  //   config.experiments = {
  //     ...config.experiments,
  //     topLevelAwait: true,
  //   };
  //   return config;
  // },
  env: {
    projectId: process.env.INFURA_API_KEY,
    etherscanKey: process.env.ETHERSCAN_API_KEY,
    polygonscanKey: process.env.POLYGONSCAN_API_KEY,
  },
};

module.exports = nextConfig;
