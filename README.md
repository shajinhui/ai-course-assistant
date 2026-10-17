# 小肥鱼AI

版本 2.44.3。小肥鱼AI 是使用用户自填 OpenAI 兼容接口的油猴脚本，聊天、搜题、作业考试与视频弹题都以该接口为唯一作答来源。

完整图文教程见 [详细使用教程（单文件 HTML）](docs/tutorial.html)，也可[从 Release 下载教程](https://github.com/shajinhui/ai-course-assistant/releases/latest/download/tutorial.html)。下载后用浏览器打开，可离线阅读，包含安装、API 配置、菜单导览、平台操作和可搜索的故障排查，并支持打印或保存为 PDF。

主导航固定为 **AI 聊天、在线搜题、答题结果、设置**。平台操作只显示当前页面及已登记 iframe 匹配的功能；首页、窗口、日志、配置同步和调试入口收进默认关闭的 **高级工具**。版本更新入口直接打开 GitHub Release，旧的检查更新面板不再出现在菜单中。旧版 AI 接口配置与面板选中记录继续兼容。

仓库中有两份等价构建产物：`xxx.js` 供调试，`xxx.user.js` 可直接安装。**它们由 `src/` 源码树构建生成，请勿直接编辑。**

## 安装与打包

安装 Tampermonkey 后，打开 [最新 Release](https://github.com/shajinhui/ai-course-assistant/releases/latest)，点击附件 **`ai-course-assistant.user.js`**，在油猴页面确认安装。如果浏览器只下载了文件，可在油猴管理面板的「实用工具 → 导入文件」中选中它。随后在脚本面板填写自己的 API 地址、Key 和模型。

模块目录用于开发，油猴实际运行的是合并后的一个文件。使用 Node.js 22.13+（推荐 24）和 pnpm 10.26.1：

```sh
pnpm install --frozen-lockfile
pnpm run build     # 更新根目录的 xxx.js / xxx.user.js
pnpm run check     # 检查已提交产物与源码一致、语法正确
pnpm test
pnpm run package   # 从 src/ 生成 dist/ 下的发布文件
```

`dist/` 中有三个文件：

| 文件 | 用途 |
| --- | --- |
| `ai-course-assistant.user.js` | 完整油猴安装文件，和根目录 `xxx.user.js` 内容相同 |
| `ai-course-assistant.meta.js` | 只含元数据头，供油猴检查版本更新 |
| `SHA256SUMS` | 上述两个文件的 SHA-256 校验和 |

API Key 在用户安装后填写，不写入源码或发布包。`node_modules/`、`dist/`、本地备份、工作记录与 `.env` 不进入 Git 仓库。

### GitHub 自动发布

推送 `main` 或创建 Pull Request 时，GitHub Actions 会安装锁定依赖、检查构建、运行测试，并上传打包产物到该次运行的 Artifacts。推送 `v*` 标签且检查通过后，会自动创建 Release 并附上这三个发布文件及 HTML 使用教程。工作流也支持在 Actions 页面手动运行构建。

发布新版本时，修改 `src/meta/userscript-header.txt` 中的 `@version`，例如 `2.44.1`，然后：

```sh
pnpm run build
pnpm run check
pnpm test
pnpm run package
git add src/meta/userscript-header.txt xxx.js xxx.user.js
git commit -m "Release v2.44.1"
git tag v2.44.1
git push origin main
git push origin v2.44.1
```

功能修改涉及的其他源码也应一同提交。标签必须与脚本版本一致，例如 `@version 2.44.1` 对应 `v2.44.1`，不一致时发布会中止。脚本的 `@updateURL` 与 `@downloadURL` 指向本仓库最新 Release，安装后可由油猴检查后续版本。

## 源码结构

```
src/
  meta/userscript-header.txt     油猴元数据头
  kernel/                        内核（原 UMD 打包体，按职责切分）
    00-prelude.js                UMD 外壳开头
    01…24/40/41-*vendor*.js      内联第三方库（lodash / events / marked / semver / md5 / Typr）
    02…22-*.js                   工具、存储、事件、UI 元素、答题引擎、Worker
    12-ai-client.js              ★ 自定义 AI 接入
    30…53-project-*.js           各平台适配（后台 / 通用 / 智慧树 / 超星 / 智慧职教 / 资源库 / 慕课）
    99-exports.js                对外导出表
    zz-epilogue.js               UMD 外壳收尾
  ui/theme.css                   ★ 主题样式（设计令牌 / 布局 / AI 面板 / 弹窗）
  entries/bootstrap.js           ★ 启动入口
  entries/ai-entry.js            ★ 悬浮「小肥鱼AI」按钮
  entries/anti-copy-hook.js      ★ 反复制 Hook
tools/
  module-map.mjs                 模块映射表（唯一的装配定义）
  build.mjs                      构建 / 校验
  package.mjs                    油猴发布包 / 更新元数据 / SHA-256
  preview.mjs                    生成主题预览页（改样式时用）
  extract-from-bundle.mjs        从原始单文件重新派生源码树（归档工具）
preview/index.html               主题预览页（生成物）
tests/                           接口、面板、构建、发布包测试
.github/workflows/build.yml      自动检查 / 构建 / 标签发布
```

带 `★` 的是相对原版脚本改动最集中的部分，日常维护基本只会碰这几处。

界面遵循两条约定：**菜单名不带 emoji**，**面板配置项按 `separator` 分组**，需要收纳的一组加上 `collapsed: true` 即折叠为默认收起的「高级」区块（见 `src/kernel/32-project-common.js` 的 `common.settings`）。折叠组内只要有值被改过，标题会自动追加「已修改」提示，不会因为收起而让人忘记改过什么。

### 模块清单

行号是各模块在**原始单文件**中的位置，用于溯源和 `extract-from-bundle.mjs`。

| 模块 | 原行号 | 职责 |
| --- | --- | --- |
| `meta/userscript-header.txt` | 1–57 | 油猴元数据头（@match / @grant / @connect） |
| `kernel/00-prelude.js` | 61–70 | 打包器辅助函数 + UMD 外壳开头 |
| `kernel/01-vendor-lodash.js` | 71–263 | 内联 lodash（debounce 依赖链） |
| `kernel/02-utils-string.js` | 264–319 | $string / StringUtils / $const |
| `kernel/03-core-store.js` | 320–443 | 存储抽象：ObjectStoreProvider / GMStoreProvider / $store |
| `kernel/04-core-app.js` | 444–562 | $ 门面：配置代理、sleep、uuid、openWindow |
| `kernel/05-core-bootstrap.js` | 563–674 | start$1：脚本启动与平台挂载 |
| `kernel/06-utils-dom.js` | 675–751 | el / $el / $$el / 事件绑定 / 拖拽 |
| `kernel/07-core-panel-env.js` | 752–806 | 面板 shadow root、$elements 注册表、$gm 权限封装 |
| `kernel/08-utils-creator.js` | 807–1001 | $creator：UI 组件工厂 |
| `kernel/09-utils-dom-search.js` | 1002–1025 | domSearch / domSearchAll |
| `kernel/10-utils-similarity.js` | 1026–1107 | 字符串相似度与答案匹配（answerSimilar / answerExactMatch） |
| `kernel/11-core-request.js` | 1108–1162 | request()：GM_xmlhttpRequest / fetch 统一封装 |
| `kernel/12-ai-client.js` | 1163–1330 | OpenAIClient + searchQuestionAnswers + answerPopupWithAI（自定义 AI 接入） `★` |
| `kernel/13-playwright.js` | 1331–1423 | ListOfActions + RemotePlaywright 远程操作 |
| `kernel/14-ui-elements.js` | 1424–1721 | IElement 及 Config / Container / Header / Message / Modal / ScriptPanel 等自定义元素 |
| `kernel/15-answer-utils.js` | 1722–1781 | 题型识别与答案拆分（defaultWorkTypeResolver / splitAnswer） |
| `kernel/16-ui-search-infos.js` | 1782–1837 | SearchInfosElement + definedCustomElements |
| `kernel/17-core-events.js` | 1838–1913 | CorsEventEmitter + cors 实例 |
| `kernel/18-vendor-events.js` | 1914–2279 | 内联 events 包（Node EventEmitter 浏览器垫片） |
| `kernel/19-core-script.js` | 2280–2377 | CommonEventEmitter / BaseScript / Script |
| `kernel/20-ui-render.js` | 2378–2804 | RenderScript + $modal / $message / $menu |
| `kernel/21-answer-resolve.js` | 2805–3053 | defaultQuestionResolve：按题型逐项作答的核心引擎 |
| `kernel/22-core-worker.js` | 3054–3312 | OCSWorker + waitForContinuate + Project 基类 |
| `kernel/23-vendor-marked.js` | 3313–5355 | 内联 marked：Markdown 渲染 |
| `kernel/24-vendor-semver.js` | 5356–5745 | 内联 semver：版本比较 |
| `kernel/30-project-background.js` | 5746–6348 | BackgroundProject：跨标签页后台协调 |
| `kernel/31-utils-work-shared.js` | 6349–6526 | $console、作业前置检查、复制/提示等公共工具 |
| `kernel/32-project-common.js` | 6527–7233 | CommonProject：AI 设置面板与聊天界面 |
| `kernel/33-projects-shared.js` | 7234–7568 | 各平台共用的作业流程（commonWork / createWorkerControl / waitForMedia） |
| `kernel/34-project-zhs.js` | 7569–8391 | ZHSProject：智慧树适配 |
| `kernel/40-vendor-md5.js` | 8392–8614 | 内联 md5 |
| `kernel/41-vendor-typr.js` | 8615–11071 | 内联 Typr：字体解析（用于图形验证码识别） |
| `kernel/50-project-cx.js` | 11072–12198 | CXProject：超星/学习通适配 |
| `kernel/51-project-icve.js` | 12199–12738 | IcveMoocProject：智慧职教适配 |
| `kernel/52-project-zjy.js` | 12739–13049 | ZJYProject：资源库适配 |
| `kernel/53-project-icourse.js` | 13050–13577 | ICourseProject：中国大学 MOOC 适配 |
| `kernel/99-exports.js` | 13578–13640 | definedProjects() 与对外导出表 |
| `kernel/zz-epilogue.js` | 13641 | UMD 外壳收尾 |
| `ui/theme.css` | 13644–14270 | 主题样式（设计令牌 / 布局 / AI 面板 / 弹窗） `★` |
| `entries/bootstrap.js` | 14274–14294 | 启动入口：组装 projects 并调用 start() `★` |
| `entries/ai-entry.js` | 14300–14366 | 悬浮「小肥鱼AI」按钮（Shadow DOM） `★` |
| `entries/anti-copy-hook.js` | 14368–14577 | 反复制 Hook：解锁页面文本选择 `★` |

## 维护流程

```sh
npm run build     # 由 src/ 生成 xxx.js 与 xxx.user.js
npm run check     # 校验产物与 src/ 一致，并做语法检查
npm test          # 运行测试（会自动先校验产物是否过期）

node tools/preview.mjs   # 生成 preview/index.html，改样式时先看它
```

改动流程固定为三步：**编辑 `src/` 下的文件 → `npm run build` → 在油猴里重新安装 `xxx.user.js`**。

改样式时不必装到油猴里再打开网课页面：`tools/preview.mjs` 会把**真实的** `src/ui/theme.css` 注入 Shadow DOM，复刻「头部 + 菜单 + 设置面板」在浅色/深色下的样子，直接打开 `preview/index.html` 即可核对。

改动定位速查：

| 想改什么 | 改哪里 |
| --- | --- |
| 接口地址拼接、超时、错误文案、提问提示词 | `src/kernel/12-ai-client.js` |
| 答题面板、聊天界面、设置项与分组 | `src/kernel/32-project-common.js` |
| 配色、圆角、暗色模式 | `src/ui/theme.css` |
| 配置项的分组/折叠渲染规则 | `src/kernel/08-utils-creator.js` 的 `scriptPanel` |
| 悬浮按钮文案与样式 | `src/entries/ai-entry.js` |
| 某个平台的适配逻辑 | `src/kernel/5*-project-*.js` |
| 支持的域名、权限声明 | `src/meta/userscript-header.txt` |

### 配色约定

整套主题是**无彩度石墨灰**，唯一上色的是语义色（成功/警告/错误）。三点务必保持：

- 不要引入蓝紫系颜色。`tests/build.test.cjs` 里有一份禁用色清单，出现即测试失败。
- 强调块（激活的页签、主按钮、AI 头像、用户气泡）统一用 `--ocs-grad` 作底色，其上的文字用 `--ocs-on-accent`。暗色模式下 `--ocs-grad` 会翻转成浅石墨，`--ocs-on-accent` 跟着变成深色，所以**不要在这些位置写死 `#fff`**。
- 亮/暗两套令牌都要满足对比度要求（正文 ≥ 7:1，次级文字与强调文字 ≥ 4.5:1），测试会逐个校验。

### 装配规则与注意事项

- `tools/module-map.mjs` 是**唯一的装配定义**，构建与派生共用它。模块顺序即拼接顺序。
- 拼接是纯文本首尾相接，不做压缩或代码转换，因此源码行与产物行一一对应，便于调试。
- **不要把模块当独立 ES 模块给某个文件加 `import`**。所有模块共享内核 IIFE 的同一个闭包作用域，靠变量提升互相引用；文件之间没有 import/export，新增文件后需要登记到 `module-map.mjs`。
- **不要在模块文件里加文件头注释块**，那会原样进入产物。模块职责记录在 `module-map.mjs` 的 `note` 字段里。
- `src/ui/theme.css` 落盘时只保存模板字符串**内部**的 CSS；`const STYLE = \`…\`;` 的包裹由构建脚本补回。
- 产物是构建生成的，直接改 `xxx.js` / `xxx.user.js` 会在下次构建时被覆盖。

### 这个结构是怎么来的

原始脚本是一个 14577 行的单文件打包产物。`tools/extract-from-bundle.mjs` 按 `module-map.mjs` 把它按职责切开，且**只做切分、不改写任何逻辑**：

```sh
node tools/extract-from-bundle.mjs [原始文件路径]   # 默认读 .backup/20261015-original/xxx.js
```

切分后会立刻在内存里重新拼装并与原文件比对 sha256，不一致就整体报错，不会留下不一致的源码树。切分当时产物 sha256 是 `3d4a03d3…`，与原文件逐字节相同，即模块化重构本身没有引入任何行为变化。

此后 `src/` 又做过界面调整（石墨灰配色、菜单去 emoji、设置项分组折叠），因此**现在的产物哈希已不等于原版**，这是预期内的。初次拆分时的原版保留在开发者本机的 `.backup/20261015-original/`，该备份不上传到 GitHub。

`extract-from-bundle.mjs` 产出的是重构前的原始内容，在 `src/` 已存在时会拒绝执行以免覆盖现有改动。日常维护不需要它，只用于溯源。

## 使用

1. 在 Tampermonkey 中用 `xxx.user.js` 替换原脚本，或把它的全部内容粘贴到原脚本编辑器并保存。避免同时启用新旧两份脚本。
2. 打开脚本匹配的网课网站，点击右下角 **小肥鱼AI** 按钮，或选择 **AI 聊天**。
3. 填写 **API 地址、API Key、模型名称**。离开输入框后自动保存，无需在代码里写 Key。
4. 点击 **测试连接**。成功后可输入问题，点击发送，或按 Ctrl / ⌘ + Enter。清空对话会重置上下文。
5. 手动搜题入口是 **在线搜题**。完成接口配置后，搜题与原平台的自动答题流程直接调用 AI，无需选择答题来源。

接口地址支持以下写法：

| 输入地址 | 实际请求地址 |
| --- | --- |
| `https://服务商域名` | `https://服务商域名/v1/chat/completions` |
| `https://服务商域名/v1` | `https://服务商域名/v1/chat/completions` |
| `https://服务商域名/api/v1` | `https://服务商域名/api/v1/chat/completions` |
| 完整的 `…/chat/completions` 地址 | 直接使用，不重复拼接 |

模型名称填写服务商提供的准确模型 ID。无需鉴权的本地服务可以将 Key 留空。默认超时为 60 秒，可设置为 5～300 秒。

## 行为

- 采用 [OpenAI 官方 Chat Completions 文档](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) 描述的 `model`、`messages` 和 `choices[].message.content` 格式，使用非流式文本回复。
- 聊天支持上下文与可编辑系统提示词。上下文只保留在当前页面，刷新后清空；每次携带最近 10 轮对话。
- 接口配置保存在油猴的本机存储中，Key 使用密码输入框，不进入原脚本的请求日志或桌面配置同步。
- AI 搜题要求模型返回 `{"answers":["答案"]}`，再转换为原答题引擎支持的格式。无有效答案时不填写，接口错误会显示在结果中。
- 聊天、搜题、作业考试和视频弹题均以配置的 AI 为自动作答来源。AI 无有效答案时保留题目供手动处理。
- 已删除题库接口、解析器、配置入口、状态查询、题库回退和答案缓存调用。重复搜题会重新请求 AI；以前保存的题库配置、答案缓存和来源模式不会参与作答。
- 已移除原脚本的随机作答兜底；视频内题目可选择 AI 答题或忽略。
- 答题后的操作默认由用户手动保存或提交，可在 **设置** 中调整。
- 原外部 AI 网页入口已替换；自动更新地址使用本仓库的 GitHub Release。
- 为支持用户自选服务商，脚本使用 `GM_xmlhttpRequest` 并声明 `@connect *`；AI 请求发往用户填写的地址。

已修复影响这条接入路径的油猴权限、异常 `typeof` 判断、面板构造、答题配置及结果展示缺失。原有平台适配代码仍需在对应平台验证，部分自动操作仍依赖原本的本地配套服务。

## 验证

```sh
npm install
npm run check
npm test
```

测试使用模拟接口与 jsdom，不需要真实 Key，也不调用收费服务。测试分别是：

- `tests/ai-api.test.cjs` —— 直接加载 `src/kernel/12-ai-client.js`，覆盖地址拼接、鉴权、错误与超时、结构化答案解析、重复提问重新请求。
- `tests/ai-panel.test.cjs` —— 在 jsdom 中整份运行构建产物，覆盖四个主入口切换、高级工具收纳、旧菜单记录兼容、平台路由与 iframe 菜单匹配、配置持久化、聊天、手动搜题、旧题库数据失效、OCSWorker 与视频弹题填写，以及设置分组和折叠状态。
- `tests/build.test.cjs` —— 校验产物与 `src/` 完全一致、元数据与权限声明完整、源码树文件齐全，并守住配色：禁用蓝紫系颜色，每套令牌的正文（≥ 7:1）、次级文字与强调文字（≥ 4.5:1）对比度达标。
- `tests/package.test.cjs` —— 检查安装文件与源码构建一致、更新元数据完整、校验和正确、重复打包稳定，并拒绝发布不匹配的版本标签。
