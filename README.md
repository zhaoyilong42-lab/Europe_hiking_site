<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Europe hiking

欧洲一日徒步路线与行程定制网站。

## 本地运行

需要 Node.js 22.5 或更新版本。

1. 安装依赖：`npm install`
2. 启动本地网站：`npm run dev`

路线资料会在启动或构建时自动导出为静态文件，不需要登录、Supabase、数据库服务或服务器。

## GitHub Pages 发布

推送到 `main` 分支后，GitHub Actions 会自动构建并发布网站。

首次发布时，请在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。发布成功后的网址为：

`https://zhaoyilong42-lab.github.io/Europe_hiking_site/`
