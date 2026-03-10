import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",      // 生成纯静态 HTML/CSS/JS
  trailingSlash: true,   // GitHub Pages 兼容路径
  images: {
    unoptimized: true,   // 静态导出不支持 Next.js 图片优化
  },
};

export default nextConfig;
