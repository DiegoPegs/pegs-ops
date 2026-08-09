import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pacotes do monorepo distribuídos como TypeScript, sem build próprio.
  transpilePackages: ['@pegs-ops/shared'],
  webpack: (config) => {
    // Os pacotes compartilhados usam NodeNext, onde os imports relativos
    // apontam para ".js". Ensinamos o bundler a resolvê-los para os ".ts".
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };

    return config;
  },
};

export default nextConfig;
