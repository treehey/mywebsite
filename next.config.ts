import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",      // 生成纯静态 HTML/CSS/JS
  trailingSlash: true,   // GitHub Pages 兼容路径
  basePath: isProd ? "/mywebsite" : "",
  assetPrefix: isProd ? "/mywebsite/" : "",
  env: { NEXT_PUBLIC_BASE_PATH: isProd ? "/mywebsite" : "" },
  images: {
    unoptimized: true,   // 静态导出不支持 Next.js 图片优化
  },
};

export default nextConfig;
