# 彭程兴个人作品集

按照提供的 Prisma 模板改编的 React 18 + Vite + TypeScript + Tailwind CSS 3 网站，使用 framer-motion 与 lucide-react。

## 运行

安装 Node.js 与 pnpm 后，在当前目录执行：

```sh
pnpm install
pnpm dev
```

浏览器打开 http://127.0.0.1:5173 。构建部署文件：

```sh
pnpm build
```

## 内容修改

- `src/App.tsx`：个人介绍、工作经历、作品清单和联系方式。
- `src/index.css`：页面样式和响应式布局。
- `public/media/`：网页视频、封面、照片与简历。视频是适合网页播放的副本，原始素材保留在上级的“作品集”目录。
- `scripts/prepare-media.py`：生成网页素材，依赖 ffmpeg、ffprobe 和 pdfplumber。

公开电话和邮箱来源于原始简历；简历未提供微信号。账号增长数据按参与运营成果表述。
