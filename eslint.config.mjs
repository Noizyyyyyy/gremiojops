/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/votar',
        destination: '/votacao',
      },
      {
        source: '/painel',
        destination: '/adm',
      },
      {
        source: '/concluido',
        destination: '/obrigado',
      },
    ];
  },
};

export default nextConfig;