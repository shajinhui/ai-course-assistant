#!/usr/bin/env node
/**
 * 主题预览生成器：把真实的 src/ui/theme.css 注入 Shadow DOM，
 * 按脚本实际生成的 DOM 结构复刻「头部 + 菜单 + 设置面板」，输出 preview/index.html。
 *
 *   node tools/preview.mjs
 *
 * 目的是改样式后能立刻肉眼确认效果，不必装到油猴里再打开网课页面。
 * 页面只是静态复刻，不含脚本逻辑。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 预览页里需要压掉容器自身的固定定位，改成随文档流排布。 */
const PREVIEW_OVERRIDES = `
container-element { position: relative !important; top: auto; left: auto; inset: auto; max-width: 100%; }
container-element > .body { max-height: none; padding: 12px; }
script-panel-element { min-width: 0; }
`;

const configElement = (label, control) =>
  `<config-element><label>${label}</label><div class="config-wrapper">${control}</div></config-element>`;

const input = (type, value) => `<input type="${type}" value="${value}">`;
const checkbox = (checked) => `<input type="checkbox"${checked ? ' checked' : ''}>`;
const textarea = (placeholder) => `<textarea placeholder="${placeholder}"></textarea>`;
const select = (options, selected) =>
  `<select>${options.map((o) => `<option${o === selected ? ' selected' : ''}>${o}</option>`).join('')}</select>`;

const CONFIGS_COMMON = [
  configElement('搜题间隔（秒）', input('number', '3')),
  configElement('答题后操作', select(['由我手动保存或提交', '只保存', '全部完成时提交', '直接提交'], '由我手动保存或提交')),
  configElement('保存或提交前等待（秒）', input('number', '3'))
].join('');

const CONFIGS_ADVANCED = [
  configElement('系统通知', select(['只显示右下角通知', '通知以及提示音（叮的一声）', '通知，提示音，以及任务栏闪烁提示', '关闭系统通知'], '只显示右下角通知')),
  configElement('搜题并发数', input('number', '1')),
  configElement('答案分隔符（逗号分隔）', input('text', '===,#,---,###,|,;,；')),
  configElement('题干需移除的文字（每行一个）', textarea('每行一个')),
  configElement('对非任务点题目答题', checkbox(false)),
  configElement('答案匹配模式', select(['相似匹配', '精确匹配'], '相似匹配'))
].join('');

const MENU = ['脚本首页', '窗口', '日志', '配置同步', '开发者调试', '请求记录', '版本更新']
  .map((name) => `<button class="tool-item" type="button">${name}</button>`).join('');
const NAVIGATION = ['AI 聊天', '在线搜题', '答题结果', '设置']
  .map((name) => `<button class="nav-item${name === '设置' ? ' active' : ''}" type="button"${name === '设置' ? ' aria-current="page"' : ''}>${name}</button>`).join('');

const panel = ({ advancedOpen = false, changed = false } = {}) => `
  <script-panel-element>
    <div class="separator">设置</div>
    <div class="notes card"><ul>
      <li>搜题与自动答题统一使用你在「AI 聊天」里配置的接口。</li>
      <li>下面只列出三项常用设置，其余在「高级设置」里，点开即可调整。</li>
    </ul></div>
    <div class="configs-container card">
      <div class="configs-group-title">常用</div>
      <div class="configs card"><div class="configs-body">${CONFIGS_COMMON}</div></div>
      <details class="configs-group"${advancedOpen ? ' open' : ''}>
        <summary><span>高级设置</span>${changed ? '<span class="configs-group-hint">· 已修改</span>' : ''}</summary>
        <div class="configs card"><div class="configs-body">${CONFIGS_ADVANCED}</div></div>
      </details>
    </div>
    <div class="script-panel-body"></div>
  </script-panel-element>`;

const shell = ({ menuOpen = false, advancedOpen = false, changed = false, platform = false } = {}) => `
  <container-element>
    <header-element>
      <div class="header-layout"><div class="header-toolbar">
        <div class="brand"><span class="brand-mark"></span><span class="brand-name">小肥鱼AI</span></div>
        <details class="advanced-tools"${menuOpen ? ' open' : ''}>
          <summary>高级工具</summary><div class="tools-content">${MENU}</div>
        </details>
        <div class="theme-toggle">◐</div>
        <div class="switch"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19 13H5v-2h14v2z"/></svg></div>
      </div>
      <nav class="primary-nav" aria-label="主要功能">${NAVIGATION}</nav>
      ${platform ? '<nav class="platform-nav" aria-label="知到智慧树当前页面功能"><span class="platform-label">知到智慧树</span><button class="nav-item" type="button">共享课 · 学习</button></nav>' : ''}
      </div>
    </header-element>
    <div class="body">${panel({ advancedOpen, changed })}</div>
  </container-element>`;

const frame = (title, theme, options) => `
  <section class="frame">
    <h2>${title}</h2>
    <div class="host" data-theme="${theme}"></div>
    <template class="src">${shell(options)}</template>
  </section>`;

async function main() {
  const theme = await readFile(path.join(ROOT, 'src/ui/theme.css'), 'utf8');
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>小肥鱼AI · 菜单与设置预览</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; padding: 32px;
    background: #fafafa;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
    color: #18181b;
  }
  h1 { margin: 0 0 6px; font-size: 21px; letter-spacing: .3px; }
  .lede { margin: 0 0 26px; color: #71717a; font-size: 13px; line-height: 1.7; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px; align-items: start; }
  .frame { padding: 0; }
  .frame h2 { margin: 0 0 11px; font-size: 12px; font-weight: 700; color: #71717a; letter-spacing: .6px; text-transform: uppercase; }
  .host { min-height: 620px; align-self: start; }
</style>
</head>
<body>
  <h1>小肥鱼AI · 菜单与设置预览</h1>
  <p class="lede">
    下面三块由 <code>src/ui/theme.css</code> 实时渲染，DOM 结构与脚本输出一致。<br>
    主导航固定为 AI 聊天、在线搜题、答题结果、设置，其他工具默认收起。<br>
    第二块展示当前页面的平台功能与高级设置，第三块是深色模式。
  </p>
  <div class="grid">
    ${frame('浅色 · 高级工具展开', 'light', { menuOpen: true })}
    ${frame('浅色 · 当前页面功能', 'light', { advancedOpen: true, changed: true, platform: true })}
    ${frame('深色 · 设置面板', 'dark', {})}
  </div>
  <script>
    const css = ${JSON.stringify(theme + PREVIEW_OVERRIDES)};
    for (const host of document.querySelectorAll('.host')) {
      const template = host.parentElement.querySelector('template.src');
      const shadow = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = css;
      shadow.append(style, template.content.cloneNode(true));
    }
  </script>
</body>
</html>
`;
  await mkdir(path.join(ROOT, 'preview'), { recursive: true });
  await writeFile(path.join(ROOT, 'preview/index.html'), html.replace(/[ \t]+$/gm, ''));
  console.log('✓ 已生成 preview/index.html');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
