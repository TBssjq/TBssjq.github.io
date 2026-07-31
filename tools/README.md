# 博客生成器（Blog Generator）

零依赖的静态博客生成器，博客风格继承自 `doc/` 下的粘土态（Claymorphism）主题。
用 Markdown 写文章，运行一条命令即可重新生成 `doc/` 下的目录页与所有文章页。

## 项目架构

```
tools/
├── package.json          # 仅含 npm scripts，无运行时依赖
├── README.md
├── src/
│   ├── config.js         # 站点配置：标题、年份、Giscus、输入输出目录
│   ├── markdown.js       # 极简 Markdown 解析器（零依赖）
│   ├── templates.js      # 文章页 / 目录页 HTML 模板（复用 doc 风格类名）
│   ├── new-post.js       # 新建文章：交互式问答 / 命令行参数，支持导入图片
│   ├── remove-post.js    # 删除文章：删除源与产物，并重新生成目录页
│   └── build.js          # 主构建：扫描 posts → 渲染 → 复制主题 → 输出 doc/
├── theme/                # 静态主题资源（构建时复制到 doc/）
│   ├── article.css        # 文章页样式（粘土态，来自 doc/article.css）
│   ├── index.css          # 目录页样式（来自 doc/index.css）
│   ├── article.js         # 文章页交互：暗色切换 / 代码复制 / Giscus
│   ├── index.js           # 目录页交互：暗色切换
│   └── layout.css         # 页面骨架布局（替代原 article 页里的 Tailwind 工具类）
└── posts/                # 文章源文件（Markdown + frontmatter）
    └── 2026/
        ├── 7.21.md
        ├── 5.30.md
        └── 4.24.md
```

构建产物输出到仓库根目录的 `doc/`（与现有站点结构一致）。

## 使用方法

```bash
cd tools
npm run new        # 交互式新建一篇文章（可顺带插入图片）
npm run build      # 生成 doc/index.html + doc/<year>/*.html，并同步主题资源
npm run dev        # 等同 build（如需监听可在此扩展 --watch）
npm run verify     # 构建到临时预览并与 doc/ 逐字节比对，验证风格/结构一致
```

> 需要 Node.js 16+。无需 `npm install`，没有任何第三方依赖。
>
> 想先预览生成结果而不覆盖 `doc/`，可指定输出目录：
> `BLOG_OUT=.preview npm run build`（PowerShell：`$env:BLOG_OUT=".preview"; npm run build`）

## 添加一篇文章

### 方式一：交互式（推荐）

```bash
npm run new
```

依次回答标题、日期、slug、日期标签，最后进入**图片添加**环节：
逐行输入本地图片路径后回车即可导入（想加图注就写成 `路径|图注`），直接回车结束。
（目录页摘要由构建器自动取正文前 15 字，无需手动填写。）

```
文章标题: 夏天的风
发布日期 YYYY-MM-DD (2026-08-01):
文件名 slug (8.1):
目录页日期标签 (8月1日):

添加图片：输入本地图片路径后回车（可加 "|图注"），直接回车结束。
  图片路径: D:\pics\sea.png|海边的傍晚
  图片路径:
```

图片会被复制到 `posts/<年份>/images/`，并在正文中自动写入 Markdown 图片语法。

### 方式二：命令行参数（可脚本化）

```bash
node src/new-post.js --title "夏天的风" --date 2026-08-01 \
  --excerpt "一句话摘要" \
  --image "D:\pics\sea.png|海边的傍晚" \
  --image "D:\pics\sky.jpg"
```

可用参数：`--title` `--date` `--slug` `--tag` `--body`、
可重复的 `--image "路径|图注"`，可选 `--excerpt "覆盖摘要"`（默认取正文前 15 字），
以及 `--open`（创建后用默认编辑器打开）。

支持的图片格式：`png / jpg / jpeg / gif / webp / svg / avif / bmp`。

### 方式三：手写 Markdown

在 `posts/<年份>/` 下新建一个 `.md` 文件，例如 `posts/2026/8.01.md`：

```markdown
---
title: 文章标题
date: 2026-08-01
dateTag: 8月1日          # 目录卡片上显示的日期标签，可省略（默认从 date 推导）
slug: 8.01               # 输出文件名，可省略（默认用文件名）
excerpt: 覆盖摘要          # 可选：省略则构建时自动取正文前 15 字
titleSuffix: none        # 可选：<title> 不追加站点名（还原早期手写页面）
compactConfig: true      # 可选：Tailwind 配置用早期的紧凑写法
---

正文用 Markdown 书写……

## 小标题
- 列表项
- 列表项

> 引用文字

\`\`\`js
console.log('代码块');
\`\`\`
```

保存后运行 `npm run build` 即可。

## 删除一篇文章

删除会移除源 Markdown（`posts/<年份>/<slug>.md`）、已生成的产物
（`doc/<年份>/<slug>.html`，受 `BLOG_OUT` 影响），并重新构建目录页，使 `doc/index.html` 不再引用该文章。

### 方式一：交互式（推荐）

```bash
npm run remove
```

列出所有文章并输入序号即可删除：

```
选择要删除的文章：
  [1] 2026/8.1  夏天的风
  [2] 2026/7.21 旧文章
输入序号:
```

### 方式二：命令行参数（可脚本化）

```bash
npm run remove -- --slug 8.1            # 按 slug 删除（自动定位年份）
npm run remove -- --year 2026 --slug 8.1  # 同时指定年份，避免重名歧义
npm run remove -- --slug 8.1 --dry        # 只预览将删除的文件，不实际删除
npm run remove -- --slug 8.1 --no-build   # 只删除源与产物，不重新生成目录页
npm run remove -- --slug 8.1 --purge-year # 该年再无其它文章时，一并清空整年目录
```

可用参数：

- `--slug <slug>`：要删除的文章文件名（不含 `.md`）。
- `--year <yyyy>`：与 `--slug` 配合，精确指定年份。
- `--dry`：预览模式，列出将删除的文件但不执行删除、不重新构建。
- `--no-build`：删除源与产物后跳过重新构建（需自行运行 `npm run build`）。
- `--purge-year`：当该年份已无其它文章时，一并删除 `posts/<年份>/` 与输出目录。

> 删除前可先用 `--dry` 确认影响范围；删除后会自动重新构建目录页。

## 在文章里插入图片

把图片放在 `posts/<年份>/` 或其 `images/` 子目录下（`npm run new` 会自动放进 `images/`），
构建时这些资源会原样复制到对应年份的输出目录。正文中有两种写法：

```markdown
![替代文字](images/sea.png "海边的傍晚")   ← 单独占一行：渲染成居中大图 + 图注

段落里也可以夹一张 ![小图](images/icon.png) 行内图片。
```

单独成行的图片会渲染成与 `doc/2026/4.24.html` 完全一致的结构：

```html
<div class="my-8">
    <img src="images/sea.png" alt="替代文字" class="w-full rounded-xl shadow-lg" loading="lazy">
    <p class="text-center text-sm text-gray-400 mt-2 no-dropcap">海边的傍晚</p>
</div>
```

省略双引号里的图注则只输出图片、不生成说明文字。

## 构建验证

`npm run verify` 会把站点生成到临时目录 `.verify-preview/`，再与仓库里的 `doc/`
逐字节比对，确认生成器输出与 `doc/` 风格、结构完全一致：

```bash
npm run verify
# 输出示例：
# IDENTICAL  2026/4.24.html
# IDENTICAL  2026/5.30.html
# IDENTICAL  index.html
# IDENTICAL  article.css
# ...
# 全部与 doc/ 逐字节一致。
```

- 退出码 `0` 表示完全一致；`1` 表示存在差异（此时运行 `npm run build` 可把 `doc/` 同步为最新生成结果）。
- 预览而不覆盖 `doc/`：`BLOG_OUT=.preview npm run preview`（PowerShell：`$env:BLOG_OUT=".preview"; npm run preview`）。

## 样式与交互

- 视觉风格完全沿用 `doc/` 的粘土态（陶瓷灰底 + 陶土橙强调 + 双向软阴影）。
- 文章页与目录页的暗色切换、代码复制、Giscus 评论均与原站一致（`theme/article.js`、`theme/index.js`）。
- `layout.css` 仅提供页面骨架布局，替代原 article 页里依赖的 Tailwind CDN 工具类，使整站**零外部库**。

## 自定义

改 `src/config.js`：站点标题、目录文案、`comingYears`（目录页"即将发布"占位年份）、
Giscus 仓库配置。改 `theme/` 下的 css/js 调整外观与交互；构建时会自动同步到 `doc/`。
