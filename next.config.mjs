/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isVercel = process.env.VERCEL === 'true';
    const isDocker = process.env.DOCKER_CONTAINER === 'true';
    const backendUrl = isVercel ? '' : (isDocker ? 'http://backend:5000' : 'http://127.0.0.1:5000');
    console.log(`[NextConfig] Rewriting API requests to: ${backendUrl || 'Vercel API'} (isVercel: ${isVercel}, isDocker: ${isDocker})`);
    
    return [
      {
        source: '/api/:path*',
        destination: isVercel ? '/api/:path*' : `${backendUrl}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: isVercel ? '/uploads/:path*' : `${backendUrl}/uploads/:path*`
      }
    ]
  }
}

export default nextConfig;
