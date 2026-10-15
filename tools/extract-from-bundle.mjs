#!/usr/bin/env node
/**
 * 一次性归档工具：按 tools/module-map.mjs 把**原始单文件**脚本切分到 src/ 源码树。
 *
 *   node tools/extract-from-bundle.mjs [原始文件路径] [--force]
 *
 * 默认读取 .backup/20261015-original/xxx.js。切分完成后会立刻做一次内存拼装校验，
 * 确认「src/ 源码树重新拼装」与原始文件 sha256 一致；不一致则删除本次产出并报错，
 * 避免留下半截源码树。
 *
 * ⚠️ 本工具产出的是**重构前**的原始内容。src/ 已经过后续修改，重新运行会把这些修改
 * 覆盖掉，因此默认拒绝在 src/ 已存在时执行，确需重来请显式加 --force（建议先备份）。
 * 日常维护不需要本脚本，它只用于溯源和从原版重新派生。
 */
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { PARTS, renderPart, stripTemplateWrap } from './module-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SOURCE = '.backup/20261015-original/xxx.js';

const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--force');
  const force = process.argv.includes('--force');
  const sourcePath = path.resolve(ROOT, args[0] || DEFAULT_SOURCE);

  if (!force) {
    const existing = await access(path.join(ROOT, 'src/kernel/00-prelude.js')).then(() => true, () => false);
    if (existing) {
      throw new Error('src/ 已存在，重新派生会覆盖现有改动。确认要重来请加 --force（建议先备份 src/）。');
    }
  }

  const original = await readFile(sourcePath, 'utf8');
  const lines = original.split('\n');
  if (lines[lines.length - 1] !== '') throw new Error('原始文件结尾缺少换行，无法按行切分');
  lines.pop(); // 去掉结尾换行产生的空元素，使 lines[i] 对应第 i+1 行

  const written = [];
  const staged = new Map();

  for (const part of PARTS) {
    if (typeof part.text === 'string') continue;
    if (!Number.isInteger(part.start) || !Number.isInteger(part.end)) {
      throw new Error(`部件 ${part.file} 缺少行号范围`);
    }
    const slice = lines.slice(part.start - 1, part.end);
    const payload = part.wrap === 'js-template' ? stripTemplateWrap(slice) : slice.join('\n') + '\n';
    staged.set(part.file, payload);
  }

  // 先在内存里还原一次，确认切分无损，再落盘。渲染复用构建脚本的同一实现，避免两处逻辑漂移。
  const rebuilt = PARTS
    .map((part) => renderPart(part, staged.has(part.file) ? staged.get(part.file) : part.text))
    .join('');

  if (rebuilt !== original) {
    const a = sha256(rebuilt);
    const b = sha256(original);
    throw new Error(`切分校验失败：拼装结果 ${a} ≠ 原始文件 ${b}`);
  }

  for (const [file, content] of staged) {
    const target = path.join(ROOT, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    written.push(file);
  }

  console.log(`✓ 已从 ${path.relative(ROOT, sourcePath)} 切出 ${written.length} 个源码文件`);
  console.log(`✓ 内存拼装校验通过，sha256 ${sha256(rebuilt)}`);
}

main().catch((error) => {
  // 不自动删除任何东西：校验失败发生在写盘之前，写盘中途失败时宁可留下半截树，
  // 也不要让用户在被覆盖的 src/ 上再承受一次删除。
  console.error(`✗ ${error.message}`);
  console.error('  src/ 未被自动删除。若已用 --force 覆盖，请从你自己的备份恢复。');
  process.exit(1);
});
