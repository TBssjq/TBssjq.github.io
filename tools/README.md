# 博客生成器 + 在线编辑器（Blog Generator & Admin）

零依赖的静态博客生成器 + 现代化 Markdown 编辑后台。
用 Markdown 写文章，在浏览器里改完点一下就能**构建、提交、推送到 GitHub**。

- **零第三方依赖**：只用 Node 内置模块，无需 `npm install`
- **视觉与博客一致**：后台沿用 `doc/` 的粘土态（Claymorphism）主题，明暗双主题
- **一键发布**：构建 → `git add` → `commit` → `pull --rebase` → `push`，一个按钮走完
- **文章分类 / 标签**：后台可归类，目录页自动生成筛选条

> 需要 Node.js 16+。仓库根目录运行即可。

---

## 目录

- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [在线编辑器](#在线编辑器)
- [分类与标签](#分类与标签)
- [一键 Git 推送](#一键-git-推送)
- [命令行用法](#命令行用法)
- [写文章](#写文章)
- [插入图片](#插入图片)
- [删除文章](#删除文章)
- [性能优化](#性能优化)
- [HTTP 接口](#http-接口)
- [环境变量](#环境变量)
- [安全设计](#安全设计)
- [构建验证](#构建验证)
- [常见问题](#常见问题)

---

## 快速开始

```bash
cd tools
npm run admin
```

终端会打印后台地址（默认 <http://127.0.0.1:4321/admin/>），并自动打开浏览器。

| 命令 | 说明 |
| --- | --- |
| `npm run admin` | 启动后台并自动打开浏览器 |
| `npm run serve` | 启动后台但不打开浏览器 |
| `npm run build` | 只构建，生成 `doc/` |
| `npm run verify` | 校验生成结果与 `doc/` 是否逐字节一致 |

---

## 项目架构

```
tools/
├── package.json          # 仅含 npm scripts，无运行时依赖
├── README.md
├── src/
│   ├── config.js         # 站点配置：标题、分类、Git、后台参数
│   ├── markdown.js       # 极简 Markdown 解析器（零依赖）
│   ├── templates.js      # 文章页 / 目录页 HTML 模板（复用 doc 风格类名）
│   ├── build.js          # 主构建：扫描 posts → 渲染 → 复制主题 → 输出 doc/
│   ├── store.js          # 存储层：后台唯一接触 posts/ 的模块（含路径穿越校验）
│   ├── git.js            # Git 封装：状态 / 提交 / 变基拉取 / 推送
│   ├── server.js         # 在线后台：零依赖 HTTP 服务（预览 + 后台 UI + REST API）
│   ├── new-post.js       # 命令行新建文章
│   ├── remove-post.js    # 命令行删除文章
│   └── verify.js         # 构建产物一致性校验
├── public/               # 后台前端（无构建、无框架、无内联代码）
│   ├── admin.html
│   ├── admin.css         # 粘土态主题，配色对齐 doc/
│   ├── admin.js
│   └── admin-theme.js    # 首屏前置脚本，避免主题闪烁
├── theme/                # 静态主题资源（构建时复制到 doc/）
│   ├── article.css / article.js
│   ├── index.css / index.js   # 目录页样式 + 分类筛选交互
└── posts/                # 文章源文件（Markdown + frontmatter）
    └── 2026/*.md
```

构建产物输出到仓库根目录的 `doc/`，与现有站点结构一致。

---

## 在线编辑器

### 界面布局

```
┌───────────────────────────────────────────────────────────────────┐
│ 水 博客后台        [新建] [构建] [同步 GitHub]  ⦿ 预览   ☀/🌙  退出 │
├──────────────┬────────────────────────────────────────────────────┤
│ 🔍 搜索      │  标题输入框                                         │
│ 分类筛选 chips│  日期 / slug / 日期标签 / 分类 / 标签 / 摘要        │
│ ── 2026 ──   │  ── Markdown 工具栏 ────────────────────            │
│  文章卡片…   │  ┌ 编辑区（Monospace） ┊ 实时预览（衬线体）┐        │
│              │  └                                        ┘        │
│              │  字数 / 词数 / 行数 / 阅读时长   [编辑│分栏│预览]   │
├──────────────┴────────────────────────────────────────────────────┤
│ 输出 │ Git  变更文件 / 最近提交 / 提交信息 / 一键推送              │
└───────────────────────────────────────────────────────────────────┘
```

### 编辑器功能

| 功能 | 说明 |
| --- | --- |
| 实时分栏预览 | 左侧写 Markdown、右侧渲染结果；支持**滚动同步**，中间分隔条可拖拽调宽度 |
| 视图切换 | 编辑 / 分栏 / 预览，宽度比例记在本地 |
| Markdown 工具栏 | 加粗、斜体、H2/H3、引用、无序 / 有序 / 任务列表、代码块、行内代码、链接、表格、分隔线、图片 |
| 图片插入 | 点按钮选择、**拖拽进编辑区**、或**直接 Ctrl+V 粘贴**截图 |
| 统计 | 字数 / 词数（中英混排分别计算）/ 行数 / 预计阅读时长 |
| 本地草稿 | 改动自动存进 `localStorage`，浏览器崩溃或误关页面后可一键恢复 |
| 分类 / 标签 | 分类输入框带已有分类联想，标签用逗号分隔，构建后同步到目录页 |
| Git 面板 | 分支、上游、待提交 / 待推送 / 待拉取、改动文件清单、最近提交 |
| 明暗主题 | 跟随系统，也可手动切换，选择记在本地；首屏由 `admin-theme.js` 预置，不会闪白 |

### 快捷键

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl / ⌘ + S` | 保存 |
| `Ctrl + B` | 加粗（光标在正文区） |
| `Ctrl + I` | 斜体 |
| `Ctrl + K` | 插入链接 |
| `Ctrl + Shift + B` | 构建站点 |
| `Ctrl + Shift + G` | 一键推送到 GitHub |

---

## 分类与标签

标签写在 frontmatter 里，构建后会体现在三处：

```markdown
---
title: 夏天的风
date: 2026-08-01
tags: 夏天, 海, 随笔     # 逗号、顿号、空格分隔都支持
---
```

1. **后台侧栏**：按标签筛选文章，chip 上带篇数；点「管理」可新建标签、删除标签（删除会同时从其所有文章中移除）
2. **目录页**：顶部生成标签筛选条，点击即筛选，空的年份段会自动折叠；支持 `#标签名` 直达
3. **文章页**：标题下方显示标签 chips

标签是自由文本，不用预先注册 —— 后台「标签管理」可新建标签，编辑器输入框会自动联想已用过的标签。

---

## 一键 Git 推送

后台底部 Git 面板提供三档操作：

| 按钮 | 行为 |
| --- | --- |
| **仅本地提交** | `git add -A` → `git commit`（不推送，适合攒几篇再发） |
| **一键推送** | 构建 → `add` → `commit` → `pull --rebase --autostash` → `push` |
| **刷新状态** | 重新读取分支、上游、改动文件、最近提交 |

顶部工具栏的「同步 GitHub」= 打开面板并直接跑一键推送。

细节：

- **先构建再提交**：勾选项，默认开启，保证推上去的 `doc/` 是最新的
- **先拉取再推送**：默认 `pull --rebase --autostash`，落后远程时自动变基；**一旦 rebase 冲突会立即中止推送**并提示去命令行处理，不会把冲突状态硬推上去
- **没有改动就跳过提交**，但已有的本地提交仍会被推送
- **首次推送自动补 `-u`**，无需手动设置上游
- 提交信息留空时用 `config.js` 里的 `commitTemplate`（`{time}` 会替换成本地时间）

### 相关配置

`src/config.js`：

```js
git: {
  enabled: true,          // 关掉整个 Git 面板
  remote: 'origin',
  branch: '',             // 留空 = 跟随当前分支
  pullBeforePush: true,
  push: true,             // false = 只提交不推送
  timeout: 120000,        // 单条 git 命令超时（毫秒）
  commitTemplate: 'chore(blog): 更新文章 {time}',
}
```

不想在后台暴露 Git，设 `ADMIN_GIT=0` 即可，面板会整体禁用。

---

## 命令行用法

```bash
npm run new        # 交互式新建文章（可顺带插入图片）
npm run remove     # 交互式删除文章
npm run build      # 生成 doc/index.html + doc/<year>/*.html，并同步主题
npm run dev        # 构建一次并监听 posts/ 增量重建
npm run verify     # 构建到临时目录与 doc/ 逐字节比对
npm run admin      # 启动在线后台并打开浏览器
npm run serve      # 启动在线后台但不打开浏览器
```

想先预览而不覆盖 `doc/`：

```bash
BLOG_OUT=.preview npm run build
# PowerShell:
$env:BLOG_OUT=".preview"; npm run build
```

### 新建文章

```bash
node src/new-post.js --title "夏天的风" --date 2026-08-01 \
  --tags "夏天,海" \
  --image "D:\pics\sea.png|海边的傍晚"
```

可用参数：`--title` `--date` `--slug` `--tags` `--body` `--excerpt`，
可重复的 `--image "路径|图注"`，以及 `--open`。

### 删除文章

```bash
node src/remove-post.js --slug 8.1            # 按 slug 删除（自动定位年份）
node src/remove-post.js --slug 8.1 --dry      # 只预览将删除的文件
node src/remove-post.js --slug 8.1 --no-build # 删完不重新构建
node src/remove-post.js --slug 8.1 --purge-year
```

---

## 写文章

在 `posts/<年份>/` 下新建 `.md`，例如 `posts/2026/8.01.md`：

```markdown
---
title: 文章标题
date: 2026-08-01
dateTag: 8月1日          # 目录卡片上的日期标签，可省略（默认从 date 推导）
slug: 8.01               # 输出文件名，可省略（默认用文件名）
tags: 夏天, 海            # 标签，可省略
excerpt: 覆盖摘要          # 可省略，默认取正文前 15 字
titleSuffix: none        # 可选：<title> 不追加站点名
compactConfig: true      # 可选：Tailwind 配置用早期紧凑写法
---

正文用 Markdown 书写……

## 小标题
- 列表项
- 列表项

> 引用文字

```js
console.log('代码块');
```
```

保存后运行 `npm run build`（或直接在后台点「构建」）。

**支持的语法**：`#`~`###` 标题、`**粗体**`、`*斜体*`、`` `行内代码` ``、
`-` / `1.` 列表、`>` 引用、`---` 分隔线、```` ``` ```` 代码块、
`[链接](url)`、`![图片](src "图注")`。

---

## 插入图片

把图片放在 `posts/<年份>/` 或其 `images/` 子目录下（后台上传会自动放进 `images/`），
构建时这些资源会原样复制到对应年份的输出目录。正文中有两种写法：

```markdown
![替代文字](images/sea.png "海边的傍晚")   ← 单独占一行：渲染成居中大图 + 图注

段落里也可以夹一张 ![小图](images/icon.png) 行内图片。
```

支持的格式：`png / jpg / jpeg / gif / webp / svg / avif / bmp`，单张上限 5 MB（`ADMIN_MAX_IMAGE`）。

---

## 删除文章

删除会移除源 Markdown（`posts/<年份>/<slug>.md`）、已生成的产物
（`doc/<年份>/<slug>.html`，受 `BLOG_OUT` 影响），并重新构建目录页，
使 `doc/index.html` 不再引用该文章。详情见[命令行用法](#命令行用法)。

---

## 性能优化

| 位置 | 做法 |
| --- | --- |
| 静态资源 | ETag + `Last-Modified` 协商缓存，命中直接回 `304`，不传正文 |
| 文本压缩 | 按 `Accept-Encoding` 自动选 brotli / gzip / deflate，压缩结果按 ETag 缓存，压了更大就放弃 |
| 大文件 | 超过 4 MB 或非文本类型仍走 `createReadStream`，不占内存 |
| 预览渲染 | 服务端按正文 SHA-1 缓存渲染结果（LRU 240 条）；客户端再缓存一层，并对请求做 220ms 防抖 |
| 过期请求 | 预览请求带 `AbortController`，新的输入会取消在途请求，并用序号丢弃迟到响应 |
| 文章列表 | `store.list()` 带 1 秒 TTL 缓存，所有写操作主动失效，不会读到脏数据 |
| 日志输出 | 只保留最近 500 行，长时间运行不会让 DOM 无限膨胀 |
| 首屏主题 | 由 `admin-theme.js` 同步执行，避免明暗切换时闪白 |

## 动效与移动端

全站动效由 **GSAP**（核心 + ScrollToPlugin + Flip + SplitText）驱动，并遵循以下原则：

- **优雅降级**：GSAP 未加载（如离线）时页面照常工作，只是没有动画；所有动效代码都做了 `typeof gsap` 防御。
- **尊重减弱动效**：检测到 `prefers-reduced-motion: reduce` 时自动关闭位移/缩放类动画，仅保留必要的淡入。
- **性能**：统一用 `transform` / `opacity`（合成层），`will-change` 仅加在真正在动的元素上；正文浮现用 `IntersectionObserver` 进场，不在首屏一次性渲染大量补间。

| 位置 | 动效 |
| --- | --- |
| 目录页 | 标题按字 `SplitText` 入场；年份 / 卡片错峰上浮；切换分类用 `Flip` 做布局过渡；卡片悬停随光标轻微 3D 倾斜；右下角「返回顶部」滚动出现并平滑滚动 |
| 文章页 | 顶部阅读进度条（滚动联动）；标题入场；正文各块滚动进入视口时浮现；代码块复制成功有弹跳反馈；图片加载淡入；「返回顶部」按钮 |
| 后台 | 登录卡片弹入；主界面分块入场；文章列表错峰浮现；打开文章时编辑器滑入；日志行逐条淡入；按钮点击回弹；主题切换图标旋转 |

移动端适配：

- 目录页：窄屏隐藏网易云播放器避免溢出、筛选条改为横向滚动、卡片留白收紧、`back-to-top` 缩小。
- 文章页：标题 / 正文字号随屏收小、隐藏播放器、正文卡片圆角与圆间距收敛。
- 后台：`<900px` 侧栏变为顶部区块、分栏编辑上下堆叠；`<620px` 工具栏横向滚动、元信息网格单列、状态栏换行；触屏设备加大可点区域并去掉点击延迟。

> 后台的 GSAP 以**同源**文件（`tools/public/gsap*.min.js`）提供，以满足后台 `script-src 'self'` 的内容安全策略；目录页 / 文章页通过 jsDelivr CDN 加载。

---

## HTTP 接口

全部为 JSON。写接口强制 `Content-Type: application/json`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/session` | 查询站点 / Git 配置（无需登录） |
| GET | `/api/posts` | 文章列表（含分类、标签） |
| POST | `/api/posts` | 新建 |
| GET | `/api/posts/<year>/<slug>` | 读取 |
| PUT | `/api/posts/<year>/<slug>` | 保存（可改 slug / 日期 / 标签） |
| DELETE | `/api/posts/<year>/<slug>` | 删除源文件与产物 |
| GET | `/api/tags` | 全站标签（含篇数）+ 标签池 |
| POST | `/api/tags` | 新建标签（body: `{ name }`） |
| DELETE | `/api/tags` | 删除标签（body: `{ name }`，同步从其所有文章中移除） |
| POST | `/api/preview` | Markdown 渲染预览 |
| POST | `/api/build` | 触发构建，返回耗时与日志 |
| GET | `/api/git/status` | 分支 / 上游 / ahead-behind / 改动文件 |
| GET | `/api/git/log` | 最近 10 条提交 |
| POST | `/api/git/sync` | 一体化同步：`{ message, build, pull, push }` |
| POST | `/api/images` | 上传图片（base64） |
| GET | `/api/images/<year>` | 该年图片列表 |

`/api/git/sync` 返回：

```json
{
  "ok": true, "pushed": true, "pulled": true, "committed": true,
  "branch": "main", "remote": "origin", "ms": 1832,
  "message": "chore(blog): 更新文章 2026-09-01 14:30",
  "log": ["构建完成，用时 21ms", "  生成文章: 2026/8.1.html"],
  "steps": [
    { "step": "add",    "ok": true,  "output": "git add -A" },
    { "step": "commit", "ok": true,  "output": "[main 3a1b2c] chore(blog): ..." },
    { "step": "pull",   "ok": true,  "output": "Already up to date." },
    { "step": "push",   "ok": true,  "output": "To github.com:me/me.github.io" }
  ]
}
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ADMIN_PORT` | `4321` | 监听端口 |
| `ADMIN_HOST` | `127.0.0.1` | **要对外访问必须显式设为 `0.0.0.0`** |
| `ADMIN_MAX_BODY` | `12582912`（12 MB） | 请求体上限 |
| `ADMIN_MAX_IMAGE` | `5242880`（5 MB） | 单张图片上限 |
| `ADMIN_GIT` | `1` | 设为 `0` 关闭后台 Git 功能 |
| `GIT_REMOTE` | `origin` | 远程仓库名 |
| `GIT_BRANCH` | 当前分支 | 推送目标分支 |
| `GIT_PULL` | `1` | 设为 `0` 推送前不拉取 |
| `GIT_PUSH` | `1` | 设为 `0` 只提交不推送 |
| `GIT_TIMEOUT` | `120000` | 单条 git 命令超时（毫秒） |
| `GIT_COMMIT_TEMPLATE` | `chore(blog): 更新文章 {time}` | 默认提交信息 |
| `BLOG_OUT` | 仓库 `doc/` | 构建输出目录 |

---

## 安全设计

- **默认只监听 `127.0.0.1`**，对外暴露需显式 `ADMIN_HOST=0.0.0.0`，且务必套 HTTPS 反向代理
- **CSRF**：所有写接口强制 `Content-Type: application/json`，跨站表单发不出 JSON 即无法提交
- **命令注入**：Git 全部走 `execFileSync('git', [args])`，不经 shell、不拼命令行字符串；
  提交信息还会额外过滤控制字符并截断到 300 字
- **路径穿越**：所有文件路径经 `store.js` 的 `safeJoin()` 校验；
  年份限 `\d{4}`、slug 限 `[A-Za-z0-9._-]` 且不能以点开头
- **后台 CSP**：`default-src 'self'`，仅放行 Google Fonts；无内联脚本 / 样式
- 上传文件校验扩展名白名单与大小上限

---

## 构建验证

`npm run verify` 会把站点生成到临时目录，与仓库里的 `doc/` 逐字节比对：

```bash
npm run verify
# IDENTICAL  2026/4.24.html
# IDENTICAL  index.html
# ...
# 全部与 doc/ 逐字节一致。
```

- 退出码 `0` 表示完全一致；`1` 表示存在差异（此时 `npm run build` 可把 `doc/` 同步为最新结果）
- 预览而不覆盖 `doc/`：`BLOG_OUT=.preview npm run preview`

---

## 常见问题

**GitHub Pages 上能用这个后台吗？**
不能。Pages 只托管静态文件，跑不了 Node。后台要跑在你自己的机器上（或 VPS / Render / Railway），
生成的 `doc/` 照旧推到 GitHub 由 Pages 发布。两者职责是分开的。

**推送失败提示认证错误？**
HTTPS 远程需要凭证管理器或 Personal Access Token；更省事的做法是把远程换成 SSH：
`git remote set-url origin git@github.com:用户名/仓库.git`。

**rebase 冲突了怎么办？**
后台会中止推送并在输出里提示。到命令行 `git status` 看冲突文件，解决后
`git rebase --continue`，再回来点推送。

**后台样式和博客不一样？**
后台刻意沿用 `doc/` 的粘土态配色（陶瓷灰 `#d8dde6` / 陶土橙 `#f97316`）与
`Noto Serif SC` + `ZCOOL KuaiLe` 字体。字体从 Google Fonts 加载，
加载失败会自动回落到系统字体，不影响功能。

**`npm run build` 之后 `npm run verify` 报差异？**
说明你改过 `theme/` 或 `templates.js` 但没重新构建。跑一次 `npm run build` 即可。

---

## 自定义

- 改 `src/config.js`：站点标题、目录文案、`comingYears`、
  Giscus 仓库配置、Git 行为
- 改 `theme/` 下的 css/js 调整博客外观与交互；构建时自动同步到 `doc/`
- 改 `public/admin.css` 的 `:root` / `html[data-theme='dark']` 变量调整后台配色
