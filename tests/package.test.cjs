const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { mkdtemp, readFile, readdir, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const load = (name) => import(pathToFileURL(path.join(ROOT, 'tools', name)).href);

test('发布包可安装、元数据可更新，校验和对应实际文件', async (t) => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'ai-course-package-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { packageUserscript } = await load('package.mjs');
  const result = await packageUserscript({ outDir });
  const script = await readFile(path.join(outDir, 'ai-course-assistant.user.js'), 'utf8');
  const meta = await readFile(path.join(outDir, 'ai-course-assistant.meta.js'), 'utf8');
  assert.equal(script, await (await load('build.mjs')).build());
  assert.ok(script.startsWith(meta));
  assert.match(meta, /\/\/ ==\/UserScript==\n$/);
  assert.match(meta, /@updateURL\s+https:\/\/github.com\/shajinhui\/ai-course-assistant\/releases\/latest\/download\/ai-course-assistant.meta.js/);
  assert.match(meta, /@downloadURL\s+https:\/\/github.com\/shajinhui\/ai-course-assistant\/releases\/latest\/download\/ai-course-assistant.user.js/);
  const sums = await readFile(path.join(outDir, 'SHA256SUMS'), 'utf8');
  for (const line of sums.trim().split('\n')) {
    const [hash, name] = line.split('  ');
    const bytes = await readFile(path.join(outDir, name));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  }
  // 版本标签必须与实际脚本一致，且同一源码重复打包应逐字节一致。
  await packageUserscript({ outDir, tag: `v${result.version}` });
  assert.equal(await readFile(path.join(outDir, 'SHA256SUMS'), 'utf8'), sums);
});

test('标签版本不匹配时，在生成发布文件前失败', async (t) => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'ai-course-package-invalid-'));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const { packageUserscript } = await load('package.mjs');
  await assert.rejects(packageUserscript({ outDir, tag: 'v0.0.0' }), /与脚本 @version .* 不一致/);
  assert.deepEqual(await readdir(outDir), []);
});
