#!/usr/bin/env node
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../dist/site/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(new URL('../docs/tutorial.html', import.meta.url), new URL('index.html', output));
await copyFile(new URL('../docs/tutorial.html', import.meta.url), new URL('tutorial.html', output));
await copyFile(new URL('../site/_headers', import.meta.url), new URL('_headers', output));
console.log(`教程网站已生成：${fileURLToPath(output)}`);
