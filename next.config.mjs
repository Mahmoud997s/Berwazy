/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDocker = process.env.DOCKER_CONTAINER === 'true';
    const backendUrl = isDocker ? 'http://backend:5000' : 'http://127.0.0.1:5000';
    console.log(`[NextConfig] Rewriting API requests to: ${backendUrl} (isDocker: ${isDocker})`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`
      }
    ]
  }
}

export default nextConfig;
