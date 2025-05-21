/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your Next.js configuration here
};

module.exports = nextConfig;

// Import and initialize OpenNext Cloudflare for development
const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev(); 