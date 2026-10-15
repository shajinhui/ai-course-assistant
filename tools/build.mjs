#!/usr/bin/env node
/**
 * 构建脚本：把 src/ 源码树拼装成单文件油猴脚本。
 *
 *   node tools/build.mjs              构建并写入 xxx.js / xxx.user.js
 *   node tools/build.mjs --check      只校验（不写盘），产物与现文件不一致时以非零码退出
 *   node tools/build.mjs --verify <参考文件>   额外与参考文件比对 sha256
 *
 * 产物是「按 tools/module-map.mjs 拼接」的纯文本，没有做压缩或代码转换，
 * 因此源码与产物可以逐行对应，便于调试。
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { PARTS, renderPart } from './module-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUTS = ['xxx.js', 'xxx.user.js'];

const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
const kb = (text) => `${Buffer.byteLength(text, 'utf8').toLocaleString('en-US')} 字节`;

/** 按模块映射表拼装完整脚本文本。 */
export async function build() {
  const chunks = [];
  for (const part of PARTS) {
    if (typeof part.text === 'string') {
      chunks.push(renderPart(part, part.text));
      continue;
    }
    const payload = await readFile(path.join(ROOT, part.file), 'utf8');
    chunks.push(renderPart(part, payload));
  }
  return chunks.join('');
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const verifyAt = args.indexOf('--verify');
  const reference = verifyAt >= 0 ? args[verifyAt + 1] : null;

  const output = await build();
  const hash = sha256(output);
  console.log(`模块数 ${PARTS.filter((p) => p.file).length} · 产物 ${kb(output)} · sha256 ${hash}`);

  if (reference) {
    const expected = sha256(await readFile(path.resolve(ROOT, reference), 'utf8'));
    if (expected !== hash) {
      console.error(`✗ 与参考文件 ${reference} 不一致（期望 ${expected}）`);
      process.exit(1);
    }
    console.log(`✓ 与参考文件 ${reference} 逐字节一致`);
  }

  if (checkOnly) {
    for (const name of OUTPUTS) {
      const current = await readFile(path.join(ROOT, name), 'utf8').catch(() => null);
      if (current !== output) {
        console.error(`✗ ${name} 与 src/ 源码树不一致，请运行 npm run build`);
        process.exit(1);
      }
    }
    console.log(`✓ ${OUTPUTS.join(' / ')} 与 src/ 源码树一致`);
    return;
  }

  for (const name of OUTPUTS) await writeFile(path.join(ROOT, name), output);
  console.log(`✓ 已写入 ${OUTPUTS.join(' / ')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
