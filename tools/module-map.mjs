/**
 * 模块映射表：描述 `src/` 源码树与单文件构建产物之间的对应关系。
 *
 * 每一项是一个「部件」，按数组顺序拼接即得到最终的用户脚本。
 * 部件只有两种形态：
 *   - { file, start, end }  从原始单文件中第 start~end 行（含两端，1 起始）切出的代码块
 *   - { text }              显式分隔符（通常是被切掉的首尾空行），保证拼接结果逐字节一致
 * 特例：
 *   - { file, start, end, wrap: 'js-template' } 该区间是一个 JS 模板字符串，
 *     落盘时只保存模板内部的 CSS 文本，构建时再补回 `const STYLE = \`` 与 `\`;`。
 *
 * 该表同时被 tools/extract-from-bundle.mjs（按此切分原始文件）
 * 和 tools/build.mjs（按此拼装产物）使用，两者共用同一份定义，不会漂移。
 *
 * 注意：start / end 指向的是**重构前的原始单文件**行号，只对归档工具 extract-from-bundle.mjs
 * 有意义。构建只关心数组顺序与 file 路径。src/ 一旦被编辑，行号便不再对应现有文件，
 * 此时不要去跑 extract-from-bundle.mjs（它默认也会拒绝执行）。
 */

/**
 * 模板字符串包裹用的前缀 / 后缀，仅 wrap=js-template 的部件使用。
 * 后缀之后还要补一个换行：该换行原本属于被切走那一段的收尾行（即 `` `; `` 那一行），
 * 每个文件部件都必须以换行结束，拼接时才不会粘连下一部件。
 */
export const TEMPLATE_WRAP = { prefix: 'const STYLE = `', suffix: '`;', trailingNewline: '\n' };

/** 原始单文件的总行数（不含结尾换行产生的空元素）。 */
export const BUNDLE_LINE_COUNT = 14577;

/** 源码树部件定义，顺序即拼接顺序。 */
export const PARTS = [
  { file: 'src/meta/userscript-header.txt', start: 1, end: 57, note: '油猴元数据头（@match / @grant / @connect）' },
  { text: '\n\n\n', note: '元数据头与内核之间的空行' },

  { file: 'src/kernel/00-prelude.js', start: 61, end: 70, note: '打包器辅助函数 + UMD 外壳开头' },
  { file: 'src/kernel/01-vendor-lodash.js', start: 71, end: 263, note: '内联 lodash（debounce 依赖链）' },
  { file: 'src/kernel/02-utils-string.js', start: 264, end: 319, note: '$string / StringUtils / $const' },
  { file: 'src/kernel/03-core-store.js', start: 320, end: 443, note: '存储抽象：ObjectStoreProvider / GMStoreProvider / $store' },
  { file: 'src/kernel/04-core-app.js', start: 444, end: 562, note: '$ 门面：配置代理、sleep、uuid、openWindow' },
  { file: 'src/kernel/05-core-bootstrap.js', start: 563, end: 674, note: 'start$1：脚本启动与平台挂载' },
  { file: 'src/kernel/06-utils-dom.js', start: 675, end: 751, note: 'el / $el / $$el / 事件绑定 / 拖拽' },
  { file: 'src/kernel/07-core-panel-env.js', start: 752, end: 806, note: '面板 shadow root、$elements 注册表、$gm 权限封装' },
  { file: 'src/kernel/08-utils-creator.js', start: 807, end: 1001, note: '$creator：UI 组件工厂' },
  { file: 'src/kernel/09-utils-dom-search.js', start: 1002, end: 1025, note: 'domSearch / domSearchAll' },
  { file: 'src/kernel/10-utils-similarity.js', start: 1026, end: 1107, note: '字符串相似度与答案匹配（answerSimilar / answerExactMatch）' },
  { file: 'src/kernel/11-core-request.js', start: 1108, end: 1162, note: 'request()：GM_xmlhttpRequest / fetch 统一封装' },
  { file: 'src/kernel/12-ai-client.js', start: 1163, end: 1330, note: '★ OpenAIClient + searchQuestionAnswers + answerPopupWithAI（自定义 AI 接入）' },
  { file: 'src/kernel/13-playwright.js', start: 1331, end: 1423, note: 'ListOfActions + RemotePlaywright 远程操作' },
  { file: 'src/kernel/14-ui-elements.js', start: 1424, end: 1721, note: 'IElement 及 Config / Container / Header / Message / Modal / ScriptPanel 等自定义元素' },
  { file: 'src/kernel/15-answer-utils.js', start: 1722, end: 1781, note: '题型识别与答案拆分（defaultWorkTypeResolver / splitAnswer）' },
  { file: 'src/kernel/16-ui-search-infos.js', start: 1782, end: 1837, note: 'SearchInfosElement + definedCustomElements' },
  { file: 'src/kernel/17-core-events.js', start: 1838, end: 1913, note: 'CorsEventEmitter + cors 实例' },
  { file: 'src/kernel/18-vendor-events.js', start: 1914, end: 2279, note: '内联 events 包（Node EventEmitter 浏览器垫片）' },
  { file: 'src/kernel/19-core-script.js', start: 2280, end: 2377, note: 'CommonEventEmitter / BaseScript / Script' },
  { file: 'src/kernel/20-ui-render.js', start: 2378, end: 2804, note: 'RenderScript + $modal / $message / $menu' },
  { file: 'src/kernel/21-answer-resolve.js', start: 2805, end: 3053, note: 'defaultQuestionResolve：按题型逐项作答的核心引擎' },
  { file: 'src/kernel/22-core-worker.js', start: 3054, end: 3312, note: 'OCSWorker + waitForContinuate + Project 基类' },
  { file: 'src/kernel/23-vendor-marked.js', start: 3313, end: 5355, note: '内联 marked：Markdown 渲染' },
  { file: 'src/kernel/24-vendor-semver.js', start: 5356, end: 5745, note: '内联 semver：版本比较' },
  { file: 'src/kernel/30-project-background.js', start: 5746, end: 6348, note: 'BackgroundProject：跨标签页后台协调' },
  { file: 'src/kernel/31-utils-work-shared.js', start: 6349, end: 6526, note: '$console、作业前置检查、复制/提示等公共工具' },
  { file: 'src/kernel/32-project-common.js', start: 6527, end: 7233, note: 'CommonProject：AI 设置面板与聊天界面' },
  { file: 'src/kernel/33-projects-shared.js', start: 7234, end: 7568, note: '各平台共用的作业流程（commonWork / createWorkerControl / waitForMedia）' },
  { file: 'src/kernel/34-project-zhs.js', start: 7569, end: 8391, note: 'ZHSProject：智慧树适配' },
  { file: 'src/kernel/40-vendor-md5.js', start: 8392, end: 8614, note: '内联 md5' },
  { file: 'src/kernel/41-vendor-typr.js', start: 8615, end: 11071, note: '内联 Typr：字体解析（用于图形验证码识别）' },
  { file: 'src/kernel/50-project-cx.js', start: 11072, end: 12198, note: 'CXProject：超星/学习通适配' },
  { file: 'src/kernel/51-project-icve.js', start: 12199, end: 12738, note: 'IcveMoocProject：智慧职教适配' },
  { file: 'src/kernel/52-project-zjy.js', start: 12739, end: 13049, note: 'ZJYProject：资源库适配' },
  { file: 'src/kernel/53-project-icourse.js', start: 13050, end: 13577, note: 'ICourseProject：中国大学 MOOC 适配' },
  { file: 'src/kernel/99-exports.js', start: 13578, end: 13640, note: 'definedProjects() 与对外导出表' },
  { file: 'src/kernel/zz-epilogue.js', start: 13641, end: 13641, note: 'UMD 外壳收尾' },

  { text: '\n\n', note: '内核与主题样式之间的空行' },
  { file: 'src/ui/theme.css', start: 13644, end: 14270, wrap: 'js-template', note: '★ 主题样式（设计令牌 / 布局 / AI 面板 / 弹窗）' },
  { text: '\n\n\n', note: '样式与启动入口之间的空行' },
  { file: 'src/entries/bootstrap.js', start: 14274, end: 14294, note: '★ 启动入口：组装 projects 并调用 start()' },
  { text: '\n\n\n\n\n', note: '启动入口与悬浮入口之间的空行' },
  { file: 'src/entries/ai-entry.js', start: 14300, end: 14366, note: '★ 悬浮「小肥鱼AI」按钮（Shadow DOM）' },
  { text: '\n', note: '悬浮入口与反复制 Hook 之间的空行' },
  { file: 'src/entries/anti-copy-hook.js', start: 14368, end: 14577, note: '★ 反复制 Hook：解锁页面文本选择' }
];

/** 需要构建脚本做模板包裹的部件。 */
export const isTemplated = (part) => part.wrap === 'js-template';

/**
 * 把一个部件的内容还原为它在最终产物中的完整文本。
 * @param {object} part 部件定义
 * @param {string} payload 部件主体（模板部件传入的是模板**内部**文本）
 */
export function renderPart(part, payload) {
  if (isTemplated(part)) {
    return TEMPLATE_WRAP.prefix + payload + TEMPLATE_WRAP.suffix + TEMPLATE_WRAP.trailingNewline;
  }
  if (typeof part.text === 'string') return part.text;
  return payload;
}

/** 从主题样式部件的原始行中剥离出模板内部的 CSS 文本。 */
export function stripTemplateWrap(lines) {
  const head = lines[0].slice(TEMPLATE_WRAP.prefix.length);
  const tail = lines[lines.length - 1];
  if (!tail.endsWith(TEMPLATE_WRAP.suffix)) {
    throw new Error('主题样式部件结尾缺少模板字符串收口');
  }
  // 首行剩余部分 + 中间各行 + 结尾前保留的换行
  return [head, ...lines.slice(1, -1)].join('\n') + '\n';
}
