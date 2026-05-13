/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Límite de carga de archivos para route handlers
  serverRuntimeConfig: {
    maxBodySize: '100mb',
  },
}

export default nextConfig
