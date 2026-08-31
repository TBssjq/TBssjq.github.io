# TBssjq.github.io

这是一个基于 GitHub Pages 的静态博客站点，同时附带一个本地在线后台，用于管理文章、上传图片、构建站点以及一键同步到 Git。

## 项目简介

- 站点内容源文件位于 `tools/posts/`
- 构建产物输出到仓库根目录的 `doc/`
- 后台代码位于 `tools/src/` 和 `tools/public/`
- 本地管理后台可直接在浏览器中编辑 Markdown、预览页面、删除文章、构建站点
- 支持 Git 状态查看、提交和推送

## 快速开始

```bash
cd tools
npm run admin
```

默认后台地址：

```text
http://127.0.0.1:4321/admin/
```

首次启动时，系统会随机生成一个管理后台口令，并保存到：

```text
tools/.admin-token
```

也可以在启动前显式指定：

```bash
ADMIN_TOKEN=my-secret npm run admin
```

> 这个口令是后台管理口令，不是 GitHub 登录或 Git 的远程凭证。

## 目录结构

```text
.
├── doc/                  # 生成的静态站点
├── tools/
│   ├── README.md         # 详细开发与使用说明
│   ├── package.json      # 后台脚本
│   ├── src/              # 后端与构建逻辑
│   ├── public/           # 后台前端页面
│   ├── theme/            # 站点主题资源
│   └── posts/            # Markdown 文章源文件
├── index.html            # 站点首页
├── style.css             # 站点样式
├── robots.txt            # 站点规则
├── sitemap.xml           # 站点地图
├── 404.html              # 404 页面
└── README.md             # 项目入口说明
```

## 主要功能

- Markdown 文章编辑与实时预览
- 标签管理
- 图片上传与插入
- 站点构建输出
- Git 仓库状态查看、提交与推送
- 后台登录、会话管理与口令轮换

## 安全说明

- 仅本地后台口令保存在 `tools/.admin-token`，不要提交到 GitHub
- 生产环境中请不要直接暴露后台到公网；如果需外网访问，务必使用 HTTPS 反向代理
- Git 身份来自本机 Git 配置（`git config user.name` / `user.email`），不是管理后台口令
- 删除文章时需要再输入当前管理口令确认，避免误删

## 详细文档

更完整的后台说明、环境变量、Git 同步、HTTP 接口和安全设计，请见：

```text
tools/README.md
```

## 常用命令

```bash
cd tools
npm run admin     # 启动后台
npm run serve     # 仅启动后台，不打开浏览器
npm run build     # 构建站点
npm run verify    # 校验构建结果
```

## 维护建议

- 不要把 `.admin-token`、`.env`、私钥等文件提交到仓库
- 如需修改后台口令，使用后台内“修改口令”功能或设置 `ADMIN_TOKEN`
- 若忘记口令，可删除本地的 `tools/.admin-token` 后重启服务，系统会重新生成

以上是本项目的简要说明；如需完整开发与部署细节，请直接阅读 [tools/README.md](tools/README.md)。