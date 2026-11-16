import type { NextConfig } from "next";

const esDesarrollo = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Patrón "Next.js FastAPI Starter": en desarrollo /api/py/* va a uvicorn;
  // en producción a la función serverless api/index.py.
  rewrites: async () => [
    {
      source: "/api/py/:path*",
      destination: esDesarrollo
        ? "http://127.0.0.1:8000/api/py/:path*"
        : "/api/",
    },
  ],
};

export default nextConfig;
