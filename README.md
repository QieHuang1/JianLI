# 彭程兴个人作品集

React 18 + Vite + TypeScript + Tailwind CSS 作品集网站，部署到 GitHub Pages。

## 运行

```sh
pnpm install
pnpm dev
pnpm build
```

## 内容修改

- `src/App.tsx`：个人介绍、工作经历、作品清单和联系方式。
- `src/fonts.css`：本地字体声明。
- `public/media/`：网页视频、封面、照片与简历。
- `scripts/prepare-media.py`：生成网页素材，依赖 ffmpeg、ffprobe 和 pdfplumber。

推送到 `main` 分支后，GitHub Actions 会自动构建并发布 Pages。
