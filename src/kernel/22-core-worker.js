  class OCSWorker extends CommonEventEmitter {
    constructor(opts) {
      super();
      this.isRunning = false;
      this.isClose = false;
      this.isStop = false;
      this.totalQuestionCount = 0;
      this.opts = opts;
    }
    async doWork(options) {
      var _a, _b, _c, _d;
      this.emit("start");
      this.isRunning = true;
      this.once("close", () => {
        this.isClose = true;
      });
      this.on("stop", () => {
        this.isStop = true;
      });
      this.on("continuate", () => {
        this.isStop = false;
      });
      const questionRoots = typeof this.opts.root === "string" ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;
      this.totalQuestionCount += questionRoots.length;
      if (options == null ? void 0 : options.enable_debug) {
        console.debug("\u5F00\u59CB\u7B54\u9898", this);
        console.debug("\u9898\u76EE\u6570\u91CF: ", questionRoots.length);
        console.debug("\u7236\u8282\u70B9\u5217\u8868: ", questionRoots);
      }
      const results = [];
      if (questionRoots.length === 0) {
        throw new Error("\u672A\u627E\u5230\u4EFB\u4F55\u9898\u76EE\uFF0C\u7B54\u9898\u7ED3\u675F\u3002");
      }
      for (const questionRoot of questionRoots) {
        const ctx = {
          searchInfos: [],
          root: questionRoot,
          elements: domSearchAll(this.opts.elements, questionRoot),
          type: void 0,
          answerSeparators: this.opts.answerSeparators,
          answerMatchMode: this.opts.answerMatchMode || "similar"
        };
        await ((_b = (_a = this.opts).onElementSearched) == null ? void 0 : _b.call(_a, ctx.elements, questionRoot));
        ctx.elements.title = (_c = ctx.elements.title) == null ? void 0 : _c.filter(Boolean);
        ctx.elements.options = (_d = ctx.elements.options) == null ? void 0 : _d.filter(Boolean);
        results.push({
          requested: false,
          resolved: false,
          ctx
        });
      }
      if (options == null ? void 0 : options.enable_debug) {
        console.debug("\u4E0A\u4E0B\u6587\u5DF2\u521D\u59CB\u5316: ", results);
      }
      const requestThread = async (index) => {
        var _a2, _b2;
        let error;
        const result = results[index];
        const ctx = result.ctx || {};
        if (this.isClose === true) {
          this.isRunning = false;
          return;
        }
        if (this.isStop) {
          await waitForContinuate(() => this.isStop);
        }
        if (typeof this.opts.work === "object") {
          ctx.type = this.opts.work.type === void 0 ? defaultWorkTypeResolver(ctx) : typeof this.opts.work.type === "string" ? this.opts.work.type : this.opts.work.type(ctx);
        }
        ctx.searchInfos = [];
        if (options == null ? void 0 : options.enable_debug) {
          console.debug("\u5F00\u59CB\u641C\u9898: ", result.ctx);
        }
        try {
          ctx.searchInfos = await this.opts.answerer(ctx.elements, ctx) || [];
          ctx.searchInfos.forEach((info) => {
            info.results = info.results.map((ans) => {
              ans.answer = ans.answer ? ans.answer.trim() : "";
              return ans;
            });
          });
          if (!ctx.searchInfos.some((info) => info.results.length)) {
            error = ctx.searchInfos.map((info) => info.error).filter(Boolean).join("；") || undefined;
          }
        } catch (err) {
          error = String(err);
        }
        result.ctx = ctx;
        result.requested = true;
        result.error = error;
        if (options == null ? void 0 : options.enable_debug) {
          console.debug("\u641C\u9898\u5B8C\u6210: ", index, result.ctx);
        }
        await ((_b2 = (_a2 = this.opts).onResultsUpdate) == null ? void 0 : _b2.call(_a2, results[index], index, results));
      };
      const resolverThread = async () => {
        var _a2, _b2;
        const ai = OpenAIClient.settings();
        const waitSeconds = Math.max(60, (Number(ai.timeout) || 60) + (Number(CommonProject.scripts.settings.cfg.period) || 0) + 5);
        const waitForRequested = async (result) => {
          return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
              if ((result == null ? void 0 : result.requested) === true) {
                clearInterval(interval);
                clearTimeout(timeout);
                resolve();
              }
            }, 200);
            const timeout = setTimeout(() => {
              clearInterval(interval);
              reject(new Error("\u7B54\u9898\u8D85\u65F6\uFF01"));
            }, waitSeconds * 1e3);
          });
        };
        for (let index = 0; index < results.length; index++) {
          const result = results[index];
          let error = result.error;
          let res;
          try {
            if (this.isClose === true) {
              this.isRunning = false;
              return;
            }
            if (this.isStop) {
              await waitForContinuate(() => this.isStop);
            }
            await waitForRequested(result);
            error = result.error;
            if (result.ctx && result.ctx.searchInfos.length !== 0) {
              if (typeof this.opts.work === "object") {
                if (result.ctx.elements.options) {
                  if (result.ctx.type) {
                    const resolver = defaultQuestionResolve(result.ctx)[result.ctx.type];
                    const handler = this.opts.work.handler;
                    res = await resolver(result.ctx.searchInfos, result.ctx.elements.options, handler);
                  } else {
                    error = "\u9898\u76EE\u7C7B\u578B\u89E3\u6790\u5931\u8D25, \u8BF7\u81EA\u884C\u63D0\u4F9B\u89E3\u6790\u5668, \u6216\u8005\u5FFD\u7565\u6B64\u9898\u3002";
                  }
                } else {
                  error = "elements.options \u4E3A\u7A7A ! \u4F7F\u7528\u9ED8\u8BA4\u5904\u7406\u5668, \u5FC5\u987B\u63D0\u4F9B\u9898\u76EE\u9009\u9879\u7684\u9009\u62E9\u5668\u3002";
                }
              } else {
                const work2 = this.opts.work;
                res = await work2(result.ctx);
              }
            } else {
              error = "\u641C\u7D22\u4E0D\u5230\u7B54\u6848, \u8BF7\u91CD\u65B0\u8FD0\u884C, \u6216\u8005\u5FFD\u7565\u6B64\u9898\u3002";
            }
          } catch (err) {
            error = (err == null ? void 0 : err.message) || err;
          }
          result.error = error;
          result.result = res || { finish: false };
          result.resolved = true;
          if (options == null ? void 0 : options.enable_debug) {
            console.debug("\u7B54\u9898\u5B8C\u6210: ", index, result);
          }
          await ((_b2 = (_a2 = this.opts).onResultsUpdate) == null ? void 0 : _b2.call(_a2, result, index, results));
        }
      };
      const requestThreadHandler = async () => {
        const locks = [];
        const waitForLock = () => {
          return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
              if (locks.length > 0) {
                const lock = locks.shift();
                if (lock) {
                  resolve(lock);
                  clearInterval(interval);
                  clearTimeout(timeout);
                }
              }
            }, 100);
            const timeout = setTimeout(() => {
              clearInterval(interval);
              reject(new Error("\u83B7\u53D6\u7EBF\u7A0B\u9501\u8D85\u65F6\uFF01"));
            }, 3 * 60 * 1e3);
          });
        };
        const requestThreads = [];
        for (let index = 0; index < results.length; index++) {
          requestThreads.push(() => requestThread(index));
        }
        for (let index = 0; index < (this.opts.thread || 1); index++) {
          locks.push(index + 1);
        }
        let requestFinished = 0;
        const promises = [];
        for (let index = 0; index < (this.opts.thread || 1); index++) {
          promises.push(async () => {
            try {
              while (requestFinished < results.length && requestThreads.length > 0 && this.isClose === false) {
                const thread = requestThreads.shift();
                if (thread) {
                  const lock = await waitForLock();
                  await thread();
                  requestFinished++;
                  locks.push(lock);
                }
              }
            } catch (err) {
              console.error(err);
            }
          });
        }
        await Promise.all(promises.map((f) => f()));
      };
      await Promise.all([resolverThread(), requestThreadHandler()]);
      this.isRunning = false;
      return results;
    }
    uploadHandler(options) {
      var _a;
      const { results, type, callback } = options;
      let finished = 0;
      for (const result of results) {
        if ((_a = result.result) == null ? void 0 : _a.finish) {
          finished++;
        }
      }
      const rate = results.length === 0 ? 0 : finished / results.length * 100;
      if (type !== "nomove") {
        if (type === "force") {
          return callback(rate, true);
        } else {
          return callback(rate, type === "save" ? false : rate >= parseFloat(type.toString()));
        }
      }
    }
  }
  async function waitForContinuate(isStopping) {
    if (isStopping()) {
      await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (isStopping() === false) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });
    }
  }
  class Project {
    constructor({ name, domains, scripts }) {
      this.name = name;
      this.domains = domains;
      for (const key in scripts) {
        if (Object.prototype.hasOwnProperty.call(scripts, key)) {
          const element = scripts[key];
          element.projectName = name;
        }
      }
      this.scripts = scripts;
    }
    static create(opts) {
      return new Project(opts);
    }
  }
