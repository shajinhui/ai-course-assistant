const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '..', 'xxx.js'), 'utf8');
const tick = () => new Promise((resolve) => setTimeout(resolve, 30));
const response = (content) => ({ status: 200, responseText: JSON.stringify({ choices: [{ message: { content } }] }) });
async function boot({ store = new Map(), complete = false } = {}) {
  store.set('background.app.closeSync', true);
  store.set('background.update.autoNotify', false);
  const errors = [];
  const calls = [];
  const listeners = new Map();
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(String(error)));
  virtualConsole.on('error', (...args) => errors.push(args.map(String).join(' ')));
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://school.edu.cn/test', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole
  });
  const w = dom.window;
  // jsdom does not implement layout-derived innerText; these fixtures contain
  // plain text, so textContent provides the same option text as a browser.
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', {
    configurable: true,
    get() { return this.textContent; },
    set(value) { this.textContent = value; }
  });
  let nextId = 0;
  let tab = {};
  const state = { reply: response('测试回答 <img src=x onerror=alert(1)>'), delay: 0 };
  Object.assign(w, {
    unsafeWindow: w,
    fetch: async () => { throw new Error('Unexpected fetch in DOM test'); },
    GM_info: { script: { name: '测试脚本', version: '2.43.0' }, scriptHandler: 'Tampermonkey', scriptMetaStr: source.slice(0, source.indexOf('// ==/UserScript==') + 21) },
    GM_getValue: (key, fallback) => store.has(key) ? store.get(key) : fallback,
    GM_setValue: (key, value) => {
      const old = store.get(key);
      store.set(key, value);
      if (old !== value) for (const item of listeners.values()) if (item.key === key) queueMicrotask(() => item.fn(key, old, value, false));
    },
    GM_listValues: () => [...store.keys()], GM_deleteValue: (key) => store.delete(key),
    GM_getTab: (callback) => queueMicrotask(() => callback(tab)), GM_saveTab: (value) => { tab = value; },
    GM_addValueChangeListener: (key, fn) => { const id = ++nextId; listeners.set(id, { key, fn }); return id; },
    GM_removeValueChangeListener: (id) => listeners.delete(id), GM_notification() {}, GM_addStyle() {},
    GM_xmlhttpRequest(details) {
      calls.push(details);
      if (state.delay) w.setTimeout(() => details.onload(state.reply), state.delay);
      else queueMicrotask(() => details.onload(state.reply));
      return { abort() {} };
    }
  });
  if (complete) await tick();
  w.eval(source);
  await tick();
  const root = w.OCS.$elements.root;
  const getPanel = () => root.querySelector('script-panel-element');
  const setConfig = (name, value) => {
    const field = [...getPanel().querySelectorAll('config-element')].find((el) => el.key === 'common.ai.' + name).provider;
    field.value = value;
    field.dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  const click = (text) => [...getPanel().querySelectorAll('button')].find((button) => button.textContent === text).click();
  return { w, store, state, errors, calls, root, getPanel, setConfig, click, close: () => w.close() };
}
function configure(f) {
  f.setConfig('baseUrl', 'https://example.invalid/v1');
  f.setConfig('apiKey', 'test-only-key');
  f.setConfig('model', 'test-model');
}

test('full script starts on an empty page; configuration, chat and private logging work', async (t) => {
  const f = await boot(); t.after(f.close);
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
  assert.ok(f.w.document.getElementById('ocs-ai-entry'));
  assert.equal(f.getPanel().querySelectorAll('config-element').length, 5);
  configure(f);
  const key = [...f.getPanel().querySelectorAll('config-element')].find((el) => el.key === 'common.ai.apiKey').provider;
  assert.equal(key.type, 'password');
  assert.equal(key.hasAttribute('value'), false);
  f.w.OCS.BackgroundProject.scripts.requestList.cfg.enable = true;
  f.click('测试连接'); await tick();
  assert.match(f.getPanel().querySelector('.ai-status').textContent, /连接成功/);
  assert.equal(f.calls[0].headers.Authorization, 'Bearer test-only-key');
  for (const question of ['第一问', '第二问']) {
    const input = f.getPanel().querySelector('.ai-chat-input');
    input.value = question; input.dispatchEvent(new f.w.Event('input'));
    const event = new f.w.KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true, cancelable: true });
    input.dispatchEvent(event); await tick();
    assert.equal(event.defaultPrevented, true, 'shortcut prevents an extra newline even with the copy hook installed');
    assert.equal(input.value, '');
  }
  const transcript = f.getPanel().querySelector('.ai-transcript');
  assert.match(transcript.textContent, /第一问/);
  assert.match(transcript.textContent, /第二问/);
  assert.equal(transcript.querySelector('img'), null);
  const second = JSON.parse(f.calls.at(-1).data).messages;
  assert.equal(second[1].content, '第一问');
  assert.equal(second[2].role, 'assistant');
  assert.equal(second[3].content, '第二问');
  assert.equal(f.w.OCS.BackgroundProject.scripts.requestList.cfg.list.length, 0);
  f.click('清空对话');
  assert.equal(transcript.textContent, '');
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});

test('configuration survives page reload and complete-state startup', async (t) => {
  const first = await boot(); configure(first);
  const store = first.store; first.close();
  const next = await boot({ store, complete: true }); t.after(next.close);
  const cfg = next.w.OCS.CommonProject.scripts.ai.cfg;
  assert.equal(cfg.baseUrl, 'https://example.invalid/v1');
  assert.equal(cfg.model, 'test-model');
  assert.equal(cfg.apiKey, 'test-only-key');
  assert.equal(next.w.OCS.CommonProject.scripts.ai.aiHistory.length, 0);
  assert.equal(next.errors.length, 0, next.errors.join('\n'));
});

test('online search uses the configured AI and shows API errors', async (t) => {
  const f = await boot(); t.after(f.close); configure(f);
  const script = f.w.OCS.CommonProject.scripts.onlineSearch;
  script.cfg.searchValue = '测试题目';
  await f.w.OCS.CommonProject.scripts.render.methods.pin(script); await tick();
  f.state.reply = response('{"answers":["正确"]}');
  f.click('搜索'); await tick();
  assert.match(f.getPanel().textContent, /正确/);
  f.state.reply = { status: 401, responseText: '{"error":{"message":"invalid key"}}' };
  f.click('搜索'); await tick();
  assert.match(f.getPanel().textContent, /401/);
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});

test('real OCSWorker fills an option and preserves API errors in work results', async (t) => {
  const f = await boot(); t.after(f.close); configure(f);
  f.w.document.body.insertAdjacentHTML('beforeend', '<div class="test-question"><h3>选择正确选项</h3>' + ['选项一', '选项二', '选项三', '选项四'].map((option) => `<label><input type="radio" name="q">${option}</label>`).join('') + '</div>');
  const create = () => new f.w.OCS.OCSWorker({
    root: '.test-question', elements: { title: 'h3', options: 'label' },
    answerer: (elements, ctx) => f.w.OCS.searchQuestionAnswers({ title: elements.title[0].textContent, type: ctx.type, options: elements.options.map((option) => option.textContent).join('\n') }),
    work: { type: 'single', handler: (_, answer, option) => option.querySelector('input').click() }
  });
  f.state.reply = response('{"answers":["选项二"]}');
  const result = await create().doWork();
  assert.equal(result[0].result.finish, true);
  assert.equal(f.w.document.querySelectorAll('.test-question input')[1].checked, true);
  f.state.reply = { status: 429, responseText: '{"error":{"message":"rate limited"}}' };
  const failure = await create().doWork();
  assert.equal(failure[0].result.finish, false);
  assert.match(failure[0].error, /429/);
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});

test('legacy bank settings and saved answers cannot override the AI-only flow', async (t) => {
  const store = new Map([
    ['common.ai.baseUrl', 'https://example.invalid/v1'],
    ['common.ai.model', 'test-model'],
    ['common.ai.apiKey', 'test-only-key'],
    ['common.ai.searchMode', 'disabled'],
    ['common.settings.answererWrappers', [{ name: '旧题库', url: 'https://old-bank.invalid/search', handler: 'return () => ["题目", "旧答案"]' }]],
    ['common.settings.enableQuestionCaches', true],
    ['common.apps.localQuestionCaches', [{ title: '题目', answer: '旧答案', from: '旧题库', homepage: 'https://old-bank.invalid' }]]
  ]);
  const f = await boot({ store }); t.after(f.close);
  assert.equal(f.w.OCS.AnswerWrapperParser, undefined);
  assert.equal(f.w.OCS.defaultAnswerWrapperHandler, undefined);
  assert.equal(f.w.OCS.CommonProject.scripts.apps, undefined);
  assert.equal(Object.hasOwn(f.w.OCS.CommonProject.scripts.settings.methods.getWorkOptions(), 'answererWrappers'), false);
  assert.equal(f.getPanel().querySelector('select'), null);
  const script = f.w.OCS.CommonProject.scripts.onlineSearch;
  script.cfg.searchValue = '题目';
  await f.w.OCS.CommonProject.scripts.render.methods.pin(script); await tick();
  f.state.reply = response('{"answers":["新的 AI 答案"]}');
  f.click('搜索'); await tick();
  assert.match(f.getPanel().textContent, /新的 AI 答案/);
  assert.doesNotMatch(f.getPanel().textContent, /旧答案|题库/);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, 'https://example.invalid/v1/chat/completions');
  await f.w.OCS.CommonProject.scripts.render.methods.pin(f.w.OCS.CommonProject.scripts.settings); await tick();
  assert.doesNotMatch(f.getPanel().textContent, /题库|缓存/);
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});

test('work engine waits for an AI response that exceeds the old 60-second limit', async (t) => {
  const f = await boot(); t.after(f.close); configure(f);
  f.w.OCS.CommonProject.scripts.ai.cfg.timeout = 90;
  f.w.document.body.insertAdjacentHTML('beforeend', '<div class="test-question"><h3>测试题目</h3><label><input type="radio">正确</label><label><input type="radio">错误</label></div>');
  const timers = new Map();
  let clock = 0;
  let id = 0;
  const schedule = (fn, ms, interval = false) => {
    const timerId = ++id;
    timers.set(timerId, { fn, due: clock + ms, ms, interval });
    return timerId;
  };
  f.w.setTimeout = (fn, ms) => schedule(fn, ms);
  f.w.setInterval = (fn, ms) => schedule(fn, ms, true);
  f.w.clearTimeout = f.w.clearInterval = (timerId) => timers.delete(timerId);
  f.state.delay = 80000;
  f.state.reply = response('{"answers":["正确"]}');
  const worker = new f.w.OCS.OCSWorker({
    root: '.test-question', elements: { title: 'h3', options: 'label' },
    answerer: () => f.w.OCS.searchQuestionAnswers({ title: '测试题目', type: 'judgement', options: '正确\n错误' }),
    work: { type: 'judgement', handler: (_, answer, option) => option.querySelector('input').click() }
  });
  let result;
  const task = worker.doWork().then((value) => result = value);
  await new Promise(setImmediate);
  for (;;) {
    const entry = [...timers.entries()].filter(([, timer]) => timer.due <= 82000).sort((a, b) => a[1].due - b[1].due)[0];
    if (!entry) break;
    const [timerId, timer] = entry;
    clock = timer.due;
    if (timer.interval) timer.due += timer.ms;
    else timers.delete(timerId);
    timer.fn();
    await new Promise(setImmediate);
  }
  assert.ok(result, 'delayed request completes within the configured timeout');
  assert.equal(result[0].result.finish, true);
  assert.equal(result[0].error, undefined);
  await task;
});

test('video popup choices are selected from AI answers for single, multiple and judgement questions', async (t) => {
  const f = await boot(); t.after(f.close); configure(f);
  for (const fixture of [
    { options: ['选项一', '选项二', '选项三', '选项四'], inputType: 'radio', answers: ['选项二'], selected: [1], type: 'single' },
    { options: ['选项一', '选项二', '选项三'], inputType: 'checkbox', answers: ['选项一', '选项三'], selected: [0, 2], type: 'multiple' },
    { options: ['正确', '错误'], inputType: 'radio', answers: ['正确'], selected: [0], type: 'judgement' }
  ]) {
    const root = f.w.document.createElement('div');
    root.innerHTML = '<h3>视频弹题</h3>' + fixture.options.map((text) => `<label><input type="${fixture.inputType}" name="popup">${text}</label>`).join('');
    const options = Array.from(root.querySelectorAll('label'));
    f.state.reply = response(JSON.stringify({ answers: fixture.answers }));
    assert.equal(await f.w.OCS.answerPopupWithAI(root, options, (option) => option.click()), true);
    assert.deepEqual(options.map((option, index) => option.querySelector('input').checked ? index : -1).filter((index) => index !== -1), fixture.selected);
    const request = JSON.parse(f.calls.at(-1).data);
    assert.equal(JSON.parse(request.messages[1].content).type, fixture.type);
  }
  assert.equal(f.calls.length, 3);
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});

test('video popups remain unanswered when AI is unconfigured, uncertain or fails', async (t) => {
  const f = await boot(); t.after(f.close); configure(f);
  const root = f.w.document.createElement('div');
  root.innerHTML = '<h3>视频弹题</h3><label><input type="radio" name="popup">选项一</label><label><input type="radio" name="popup">选项二</label>';
  const options = Array.from(root.querySelectorAll('label'));
  let clicks = 0;
  const click = (option) => { clicks++; option.click(); };
  f.w.OCS.CommonProject.scripts.ai.cfg.model = '';
  assert.equal(await f.w.OCS.answerPopupWithAI(root, options, click), false);
  assert.equal(f.calls.length, 0);
  f.w.OCS.CommonProject.scripts.ai.cfg.model = 'test-model';
  for (const reply of [
    response('{"answers":[]}'),
    response('{"answers":["无法匹配的答案"]}'),
    { status: 401, responseText: '{"error":{"message":"invalid key"}}' }
  ]) {
    f.state.reply = reply;
    assert.equal(await f.w.OCS.answerPopupWithAI(root, options, click), false);
  }
  assert.equal(clicks, 0);
  assert.equal(root.querySelectorAll('input:checked').length, 0);
});

test('settings panel collapses advanced options behind a closed group', async (t) => {
  const f = await boot(); t.after(f.close);
  await f.w.OCS.CommonProject.scripts.render.methods.pin(f.w.OCS.CommonProject.scripts.settings); await tick();
  const panel = f.getPanel();

  assert.equal(panel.querySelector('.separator').textContent, '设置', '菜单名已去掉 emoji');
  assert.deepEqual(
    [...panel.querySelectorAll('.configs-group-title')].map((el) => el.textContent),
    ['常用'],
    '常驻分组只有「常用」'
  );
  const common = [...panel.querySelectorAll('.configs-group-title + .configs.card config-element')];
  assert.deepEqual(common.map((el) => el.label.textContent), ['搜题间隔（秒）', '答题后操作', '保存或提交前等待（秒）']);

  const groups = [...panel.querySelectorAll('details.configs-group')];
  assert.equal(groups.length, 1, '高级设置收成一个折叠分组');
  assert.equal(groups[0].open, false, '高级设置默认收起');
  assert.equal(groups[0].querySelector('summary').textContent, '高级设置');
  const advanced = [...groups[0].querySelectorAll('config-element')].map((el) => el.label.textContent);
  assert.deepEqual(advanced, ['系统通知', '搜题并发数', '答案分隔符（逗号分隔）', '题干需移除的文字（每行一个）', '对非任务点题目答题', '答案匹配模式']);
  assert.equal(advanced.length + common.length, panel.querySelectorAll('config-element').length, '没有配置项被丢弃');

  // 收起只是视觉收纳，展开后仍可正常读写。
  groups[0].open = true;
  const thread = [...groups[0].querySelectorAll('config-element')].find((el) => el.label.textContent === '搜题并发数');
  thread.provider.value = '3';
  thread.provider.dispatchEvent(new f.w.Event('change', { bubbles: true }));
  assert.equal(f.store.get('common.settings.thread'), 3);
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});

test('advanced group flags itself when a hidden value differs from its default', async (t) => {
  const f = await boot(); t.after(f.close);
  const summary = () => f.getPanel().querySelector('details.configs-group > summary');
  const open = async () => {
    await f.w.OCS.CommonProject.scripts.render.methods.pin(f.w.OCS.CommonProject.scripts.settings); await tick();
  };
  await open();
  assert.doesNotMatch(summary().textContent, /已修改/, '默认值不应提示已修改');

  f.store.set('common.settings.answerMatchMode', 'exact');
  await f.w.OCS.CommonProject.scripts.render.methods.pin(f.w.OCS.CommonProject.scripts.onlineSearch); await tick();
  await open();
  assert.match(summary().textContent, /已修改/, '改动高级项后应在折叠标题上提示');
  assert.equal(f.errors.length, 0, f.errors.join('\n'));
});
