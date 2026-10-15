const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// AI 客户端已经是独立模块，直接整文件加载；不再从单文件产物里按标记字符串切片。
const clientCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'kernel', '12-ai-client.js'), 'utf8');
const defaults = { baseUrl: 'https://example.invalid/v1', apiKey: 'test-only-key', model: 'test-model', timeout: 60, systemPrompt: '' };
const reply = (content) => ({ status: 200, responseText: JSON.stringify({ choices: [{ message: { content } }] }) });
function fixture({ settings = {}, transport } = {}) {
  const calls = [];
  const timers = new Map();
  let abortCount = 0;
  const cfg = { ...defaults, ...settings };
  const context = {
    URL, JSON, Event, console,
    CommonProject: { scripts: { ai: { cfg } } },
    GM_xmlhttpRequest(details) {
      calls.push(details);
      queueMicrotask(() => transport ? transport(details) : details.onload(reply('OK')));
      return { abort() { abortCount++; details.onabort(); } };
    },
    setTimeout(fn) { const id = {}; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  vm.runInNewContext(clientCode + '\nthis.Client = OpenAIClient; this.search = searchQuestionAnswers;', context);
  return { ...context, runtime: context, cfg, calls, timers, get abortCount() { return abortCount; } };
}
const userMessage = [{ role: 'user', content: '你好' }];

test('normalizes root, base paths and complete URLs without duplicating the endpoint', () => {
  const f = fixture();
  for (const [input, output] of [
    ['https://example.invalid', 'https://example.invalid/v1/chat/completions'],
    ['https://example.invalid/v1/', 'https://example.invalid/v1/chat/completions'],
    ['https://example.invalid/api/v1', 'https://example.invalid/api/v1/chat/completions'],
    ['http://localhost:11434/v1', 'http://localhost:11434/v1/chat/completions'],
    ['https://example.invalid/v1/chat/completions/', 'https://example.invalid/v1/chat/completions'],
    ['https://example.invalid/v1/chat/completions?api-version=test', 'https://example.invalid/v1/chat/completions?api-version=test']
  ]) assert.equal(f.Client.endpoint(input), output);
  for (const url of ['javascript:alert(1)', 'file:///tmp/key', 'not-a-url', 'https://name:password@example.invalid', 'https://example.invalid/#key']) {
    assert.throws(() => f.Client.endpoint(url));
  }
});

test('sends a minimal compatible payload and the configured bearer key', async () => {
  const f = fixture();
  assert.equal(await f.Client.chat(userMessage), 'OK');
  const request = f.calls[0];
  assert.equal(request.url, 'https://example.invalid/v1/chat/completions');
  assert.equal(request.headers.Authorization, 'Bearer test-only-key');
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.equal(request.anonymous, true);
  assert.equal(request.timeout, 60000);
  assert.deepEqual(JSON.parse(request.data), { model: 'test-model', messages: userMessage, stream: false });
  assert.equal(f.timers.size, 0);
});

test('supports local APIs without an Authorization header', async () => {
  const f = fixture({ settings: { apiKey: '' } });
  await f.Client.chat(userMessage);
  assert.equal(Object.hasOwn(f.calls[0].headers, 'Authorization'), false);
});

test('validates model and timeout before transmitting', async () => {
  for (const settings of [{ model: '' }, { timeout: 0 }, { timeout: NaN }, { timeout: 301 }]) {
    const f = fixture({ settings });
    await assert.rejects(f.Client.chat(userMessage));
    assert.equal(f.calls.length, 0);
  }
});

test('reports HTTP errors while removing any echoed credential', async () => {
  const f = fixture({ transport: (d) => d.onload({ status: 401, responseText: JSON.stringify({ error: { message: 'invalid test-only-key' } }) }) });
  await assert.rejects(f.Client.chat(userMessage), (error) => /401/.test(error.message) && !error.message.includes('test-only-key'));
  assert.equal(f.timers.size, 0);
});

test('handles HTML, null JSON, empty content, network errors and refusals', async () => {
  for (const transport of [
    (d) => d.onload({ status: 502, responseText: '<html>Bad gateway</html>' }),
    (d) => d.onload({ status: 200, responseText: 'null' }),
    (d) => d.onload(reply('')),
    (d) => d.onerror(),
    (d) => d.onload({ status: 200, responseText: JSON.stringify({ choices: [{ message: { content: null, refusal: '无法回答' } }] }) })
  ]) {
    const f = fixture({ transport });
    await assert.rejects(f.Client.chat(userMessage));
    assert.equal(f.timers.size, 0);
  }
});

test('times out and aborts exactly once, ignoring a late response', async () => {
  const f = fixture({ transport: (d) => { d.ontimeout(); d.onload(reply('late')); } });
  await assert.rejects(f.Client.chat(userMessage), /超时/);
  assert.equal(f.abortCount, 1);
  assert.equal(f.timers.size, 0);
});

test('keeps using its private transport after the shared logger is installed', async () => {
  const f = fixture();
  let logged = false;
  f.runtime.GM_xmlhttpRequest = () => { logged = true; };
  await f.Client.chat(userMessage);
  assert.equal(logged, false);
  assert.equal(f.calls.length, 1);
});

test('reads text content blocks and ignores other content parts', async () => {
  const f = fixture({ transport: (d) => d.onload(reply([null, { type: 'text', text: '答' }, { type: 'image_url' }, { type: 'text', text: '案' }])) });
  assert.equal(await f.Client.chat(userMessage), '答案');
});

test('turns structured multiple answers into the existing result format', async () => {
  const f = fixture({ transport: (d) => d.onload(reply('```json\n{"answers":["选项一","选项三"]}\n```')) });
  const info = await f.Client.answer({ title: '题目', type: 'multiple', options: '选项一\n选项二\n选项三' });
  assert.deepEqual(JSON.parse(info.results[0].answer), ['选项一', '选项三']);
  assert.equal(info.results[0].question, '题目');
  assert.equal(info.name, 'AI · test-model');
  const sent = JSON.parse(f.calls[0].data);
  assert.deepEqual(JSON.parse(sent.messages[1].content), { title: '题目', type: 'multiple', options: '选项一\n选项二\n选项三' });
});

test('rejects unstructured answers and respects an uncertain empty answer', async () => {
  for (const content of ['我认为选 A', '{"answers":[{"answer":"A"}]}']) {
    const f = fixture({ transport: (d) => d.onload(reply(content)) });
    await assert.rejects(f.Client.answer({ title: '题目' }));
  }
  const f = fixture({ transport: (d) => d.onload(reply('{"answers":[]}')) });
  assert.equal((await f.Client.answer({ title: '题目' })).results.length, 0);
});

test('search always calls the configured AI API', async () => {
  const f = fixture({ transport: (d) => d.onload(reply('{"answers":["正确"]}')) });
  assert.equal(f.Client.isConfigured(), true);
  const infos = await f.search({ title: '题目' });
  assert.equal(infos[0].results[0].answer, '正确');
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, 'https://example.invalid/v1/chat/completions');
});

test('legacy source modes cannot disable or redirect AI requests', async () => {
  for (const mode of ['disabled', 'fallback']) {
    const f = fixture({ settings: { searchMode: mode }, transport: (d) => d.onload(reply('{"answers":["AI答案"]}')) });
    assert.equal(Object.hasOwn(f.Client.settings(), 'searchMode'), false);
    assert.equal((await f.search({ title: '题目' }))[0].results[0].answer, 'AI答案');
    assert.equal(f.calls.length, 1);
  }
});

test('missing AI configuration returns a setup error before sending a request', async () => {
  const f = fixture({ settings: { model: '' } });
  assert.equal(f.Client.isConfigured(), false);
  const infos = await f.search({ title: '题目' });
  assert.equal(infos[0].results.length, 0);
  assert.match(infos[0].error, /模型/);
  assert.equal(f.calls.length, 0);
});

test('AI failures are returned to the search UI as an error result', async () => {
  const f = fixture({ transport: (d) => d.onerror() });
  const infos = await f.search({ title: '题目' });
  assert.equal(infos[0].results.length, 0);
  assert.match(infos[0].error, /网络/);
});

test('repeated questions use fresh AI responses without an answer cache', async () => {
  let count = 0;
  const f = fixture({ transport: (d) => d.onload(reply(JSON.stringify({ answers: ['AI答案' + ++count] }))) });
  const first = await f.search({ title: '题目' });
  const second = await f.search({ title: '题目' });
  assert.equal(first[0].results[0].answer, 'AI答案1');
  assert.equal(second[0].results[0].answer, 'AI答案2');
  assert.equal(f.calls.length, 2);
});
