import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Reload env variables for Nodemailer Gmail SMTP
};

export default nextConfig;
