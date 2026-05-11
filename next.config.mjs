/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Aumentar límite de carga de archivos a 100MB
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export default nextConfig
