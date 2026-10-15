#!/usr/bin/env node
/** 从模块源码生成可安装脚本、更新元数据和校验和，不依赖 node_modules。 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Script } from 'node:vm';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASENAME = 'ai-course-assistant';
const hash = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

export async function packageUserscript({ outDir = path.join(ROOT, 'dist'), tag } = {}) {
  const script = await build();
  const metadata = script.match(/^\/\/ ==UserScript==\r?\n[\s\S]*?^\/\/ ==\/UserScript==\r?\n/m)?.[0];
  if (!metadata || !script.startsWith(metadata)) throw new Error('脚本必须以完整的油猴元数据头开头');
  const version = metadata.match(/^\/\/\s+@version\s+(\S+)\s*$/m)?.[1];
  if (!/^\d+\.\d+\.\d+$/.test(version || '')) throw new Error('请使用三段数字版本号，例如 2.44.0');
  if (tag !== undefined && tag !== `v${version}`) {
    throw new Error(`版本标签 ${tag} 与脚本 @version ${version} 不一致，应为 v${version}`);
  }
  new Script(script, { filename: `${BASENAME}.user.js` });
  const files = {
    [`${BASENAME}.user.js`]: script,
    [`${BASENAME}.meta.js`]: metadata
  };
  const sums = Object.entries(files).map(([name, content]) => `${hash(content)}  ${name}\n`).join('');
  files.SHA256SUMS = sums;
  await mkdir(outDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(path.join(outDir, name), content);
  return { version, outDir, files: Object.keys(files) };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--tag')) {
    throw new Error('用法：node tools/package.mjs [--tag v2.44.0]');
  }
  const result = await packageUserscript({ tag: args[1] });
  console.log(`已打包 v${result.version}：`);
  for (const name of result.files) console.log(path.join(result.outDir, name));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
