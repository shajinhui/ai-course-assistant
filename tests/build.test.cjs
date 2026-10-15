const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('xxx.js 与 xxx.user.js 与 src/ 源码树完全一致', async () => {
  const { build } = await import(path.join('file://', ROOT, 'tools/build.mjs'));
  const output = await build();
  assert.equal(read('xxx.js'), output, 'xxx.js 已过期，请运行 npm run build');
  assert.equal(read('xxx.user.js'), output, 'xxx.user.js 已过期，请运行 npm run build');
});

test('构建产物是合法的用户脚本，元数据完整', async () => {
  const output = await (await import(path.join('file://', ROOT, 'tools', 'build.mjs'))).build();
  const metadata = output.slice(0, output.indexOf('// ==/UserScript==') + 21);
  assert.match(metadata, /^\/\/ ==UserScript==/);
  for (const key of ['@name', '@version', '@match', '@grant', '@connect']) {
    assert.match(metadata, new RegExp(`^//\\s+${key}\\s`, 'm'), `元数据缺少 ${key}`);
  }
  assert.match(metadata, /@version\s+\d+\.\d+\.\d+\s*$/m, '@version 应使用三段数字版本号');
  // 自定义 AI 接入依赖这几个权限，缺失会导致运行期直接抛错。
  for (const grant of ['GM_xmlhttpRequest', 'GM_setValue', 'GM_getValue', 'unsafeWindow']) {
    assert.match(metadata, new RegExp(`^//\\s+@grant\\s+${grant}\\s*$`, 'm'), `缺少权限 ${grant}`);
  }
  assert.match(metadata, /^\/\/\s+@connect\s+\*\s*$/m, '需要 @connect * 才能访问用户自填的接口地址');
});

test('源码树结构完整，模块职责文件均存在', () => {
  const modules = [
    'src/meta/userscript-header.txt',
    'src/kernel/00-prelude.js',
    'src/kernel/12-ai-client.js',
    'src/kernel/14-ui-elements.js',
    'src/kernel/21-answer-resolve.js',
    'src/kernel/22-core-worker.js',
    'src/kernel/32-project-common.js',
    'src/kernel/99-exports.js',
    'src/kernel/zz-epilogue.js',
    'src/ui/theme.css',
    'src/entries/bootstrap.js',
    'src/entries/ai-entry.js',
    'src/entries/anti-copy-hook.js'
  ];
  for (const module of modules) {
    assert.ok(fs.existsSync(path.join(ROOT, module)), `缺少模块 ${module}`);
  }
  // 主题样式落盘时只保存 CSS，包裹用的 `const STYLE = ` 由构建脚本补回。
  assert.doesNotMatch(read('src/ui/theme.css'), /const STYLE =/);
  assert.match(read('src/ui/theme.css'), /^:host \{/m);
});

// 配色是硬要求：整套主题与悬浮按钮不得再出现蓝紫（靛蓝 / 紫罗兰 / 青蓝）系颜色。
const BLUE_PURPLE = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#818cf8', '#a78bfa', '#22d3ee',
  '99, 102, 241', '139, 92, 246', '6, 182, 212', '129, 140, 248',
  '165, 172, 255', '52, 46, 120', '120, 125, 190', '24, 26, 45',
  '1d2136', '6b7390', 'f3f5fb', '1c1f33', '252a45', 'e9ebfa', '9aa2c4', 'f1f2ff'
];

test('主题与悬浮入口不再使用蓝紫配色', () => {
  for (const file of ['src/ui/theme.css', 'src/entries/ai-entry.js']) {
    const text = read(file).toLowerCase();
    for (const color of BLUE_PURPLE) {
      assert.equal(text.includes(color), false, `${file} 仍残留蓝紫配色 ${color}`);
    }
  }
});

// ---- 对比度：确认换上石墨灰后文字依然可读（WCAG 相对亮度） ----
const channel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  const value = hex.trim().replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(full.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function parseTokens(css) {
  const out = {};
  for (const m of css.matchAll(/--ocs-([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
/** 抽出亮色令牌块与暗色覆盖块；暗色没写的项沿用亮色。 */
function tokenSets() {
  const css = read('src/ui/theme.css');
  const block = (pattern) => (css.match(pattern) || [])[1] || '';
  const light = parseTokens(block(/:host \{([\s\S]*?)\n\}/));
  const dark = parseTokens(block(/:host\(\[data-theme="dark"\]\) \{([\s\S]*?)\n\}/));
  assert.ok(light.a1 && light.text, '应能解析出亮色令牌');
  assert.ok(dark.a1 && dark.text, '应能解析出暗色令牌');
  return { light, dark: { ...light, ...dark } };
}
const hexesIn = (value) => value.match(/#[0-9a-fA-F]{3,8}/g) || [];

test('亮色与暗色下正文、标签和强调块文字都有足够对比度', () => {
  for (const [name, tokens] of Object.entries(tokenSets())) {
    const value = (key) => {
      assert.ok(tokens[key], `${name}模式缺少令牌 --ocs-${key}`);
      return tokens[key];
    };
    const pairs = [
      ['正文', 'text', 'surface', 7],
      ['次级文字', 'muted', 'surface', 4.5],
      ['次级文字（浅底输入框）', 'muted', 'surface-2', 4.5],
      ['强调文字', 'a1', 'surface', 4.5]
    ];
    for (const [label, fg, bg, min] of pairs) {
      const ratio = contrast(value(fg), value(bg));
      assert.ok(ratio >= min, `${name}模式 ${label}（${value(fg)} on ${value(bg)}）对比度 ${ratio.toFixed(2)} < ${min}`);
    }
    // 强调块上的文字要同时扛住渐变两端。
    for (const stop of hexesIn(value('grad'))) {
      const ratio = contrast(value('on-accent'), stop);
      assert.ok(ratio >= 4.5, `${name}模式强调块文字（${value('on-accent')} on ${stop}）对比度 ${ratio.toFixed(2)} < 4.5`);
    }
  }
});
