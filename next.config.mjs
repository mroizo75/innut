/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        domains: ['storage.googleapis.com'],
        remotePatterns: [
            {
              protocol: 'https',
              hostname: '**',
            },
        ],
    },
};

export default nextConfig;
