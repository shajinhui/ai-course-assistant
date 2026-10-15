  const work_pages = [
    ["\u8D44\u6E90\u5E93\u4F5C\u4E1A\u9875\u9762", "study/spockeepTest"],
    ["\u4F5C\u4E1A\u9875\u9762", "icve-study/coursePreview/jobTes"],
    ["\u8003\u8BD5\u9875\u9762", "icve-study/coursePreview/test"]
  ];
  const isWork = window.location.href.includes("icve-study/coursePreview/jobTes") || window.location.href.includes("study/spockeepTest");
  const isExam = window.location.href.includes("icve-study/coursePreview/test");
  const ZJYProject = Project.create({
    name: "\u804C\u6559\u4E91",
    domains: ["icve.com.cn", "zjy2.icve.com.cn", "zyk.icve.com.cn"],
    scripts: {
      guide: new Script({
        name: "\u4F7F\u7528\u63D0\u793A",
        url: [
          ["\u5B66\u4E60\u9875\u9762", "zjy2.icve.com.cn/study"],
          ["\u8D44\u6E90\u5E93", "zyk.icve.com.cn/icve-study/"]
        ],
        namespace: "zjy.study.guide",
        configs: {
          notes: {
            defaultValue: "\u8BF7\u70B9\u51FB\u4EFB\u610F\u7AE0\u8282\uFF0C\u8FDB\u5165\u5B66\u4E60\u3002"
          }
        }
      }),
      dispatcher: new Script({
        name: "\u8C03\u5EA6\u5668",
        url: [
          ["\u5B66\u4E60\u9875\u9762", "zjy2.icve.com.cn/study"],
          ["\u8D44\u6E90\u5E93", "zyk.icve.com.cn/icve-study/"]
        ],
        hideInPanel: true,
        methods() {
          return {
            dispatch: () => {
              if ([
                "zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware",
                "zyk.icve.com.cn/icve-study/coursePreview/courseware"
              ].some((i) => window.location.href.includes(i))) {
                ZJYProject.scripts.study.methods.main();
              } else if (work_pages.map(([_, p]) => p).some((i) => window.location.href.includes(i))) {
                ZJYProject.scripts.work.methods.main();
              }
            }
          };
        },
        onhistorychange(type) {
          if (type === "push") {
            this.methods.dispatch();
          }
        },
        oncomplete() {
          this.methods.dispatch();
        }
      }),
      study: new Script({
        url: [
          ["\u5B66\u4E60\u9875\u9762", "zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware"],
          ["\u8D44\u6E90\u5E93\u5B66\u4E60\u9875\u9762", "zyk.icve.com.cn/icve-study/coursePreview/courseware"]
        ],
        name: "\u8BFE\u7A0B\u5B66\u4E60",
        namespace: "zjy.study.main",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              ["\u5982\u679C\u811A\u672C\u5361\u6B7B\u6216\u8005\u60A8\u4E0D\u60F3\u5B66\u4E60\uFF0C", "\u53EF\u4EE5\u70B9\u51FB\u5176\u4ED6\u4EFB\u610F\u7AE0\u8282\u7EE7\u7EED\u8FDB\u884C\u5B66\u4E60\u3002"],
              "\u63D0\u793A\uFF1A\u804C\u6559\u4E91\u65E0\u6CD5\u4F7F\u7528\u500D\u901F\u3002"
            ]).outerHTML
          },
          volume
        },
        methods() {
          return {
            main: async () => {
              var _a;
              const id = new URL(window.location.href).searchParams.get("id");
              if (!id) {
                return;
              }
              if (state$1.studying && id === state$1.studyingId) {
                return;
              }
              state$1.studyingId = id;
              state$1.studying = true;
              await waitForLoad();
              setTimeout(() => {
                var _a2, _b;
                (_a2 = $el(".el-message-box__wrapper")) == null ? void 0 : _a2.remove();
                (_b = $el(".v-modal")) == null ? void 0 : _b.remove();
              }, 3e3);
              await waitForLoad();
              const courseInfo = await start();
              if (!courseInfo) {
                $console.error("\u83B7\u53D6\u8BFE\u7A0B\u4FE1\u606F\u5931\u8D25\uFF0C\u8BF7\u8DDF\u4F5C\u8005\u53CD\u9988\u3002");
                return;
              }
              $message("success", { content: "\u5F00\u59CB\u5B66\u4E60\uFF1A" + courseInfo.fileType + "-" + courseInfo.name });
              $console.info("\u5F00\u59CB\u5B66\u4E60\uFF1A" + +courseInfo.fileType + "-" + courseInfo.name);
              if (["ppt", "doc", "pptx", "docx", "pdf", "txt"].some((i) => courseInfo.fileType === i)) {
                await watchFile();
              } else if (["video", "audio", "mp4", "mp3", "flv"].some((i) => courseInfo.fileType === i)) {
                if ((_a = $el(".guide")) == null ? void 0 : _a.innerHTML.includes("\u5F88\u62B1\u6B49\uFF0C\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u64AD\u653E\u6B64\u7C7B\u6587\u4EF6")) {
                  $console.error(`\u4EFB\u52A1\u70B9 ${courseInfo.name}\uFF0C\u4E0D\u652F\u6301\u64AD\u653E\u3002`);
                } else {
                  await watchMedia$1(this.cfg.volume);
                }
              } else if (["png", "jpg"].some((i) => courseInfo.fileType === i)) {
                $console.info(`\u5DF2\u67E5\u770B\u56FE\u7247\u4EFB\u52A1\u70B9 ${courseInfo.name}\uFF0C\u5373\u5C06\u8DF3\u8FC7\u3002`);
              } else {
                $console.error(`\u672A\u77E5\u7684\u4EFB\u52A1\u70B9 ${courseInfo.name}\uFF0C\u7C7B\u578B ${courseInfo.fileType}\uFF0C\u8BF7\u8DDF\u4F5C\u8005\u8FDB\u884C\u53CD\u9988\u3002`);
              }
              $console.info("\u4EFB\u52A1\u70B9\u7ED3\u675F\uFF0C\u4E09\u79D2\u540E\u4E0B\u4E00\u7AE0");
              await $.sleep(3e3);
              await next();
            }
          };
        }
      }),
      work: new Script({
        url: work_pages,
        name: "\u4F5C\u4E1A\u8003\u8BD5",
        namespace: "zjy.work.main",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "自动答题前请在「AI 聊天」配置 AI 接口。",
              "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002",
              "\u8BF7\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A\u8003\u8BD5\u9875\u9762\u624D\u80FD\u4F7F\u7528\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          }
        },
        methods() {
          return {
            main: async () => {
              if (isWork || isExam) {
                await waitForQuestions();
                commonWork(this, {
                  workerProvider: (opt) => workOrExam(isWork ? "work" : "exam", opt)
                });
              }
            }
          };
        }
      })
    }
  });
  async function watchMedia$1(volume2) {
    const media = await waitForMedia();
    media.volume = volume2;
    const success = await playMedia(() => media.play());
    if (!success) {
      return;
    }
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (media.ended) {
          clearInterval(interval);
          resolve();
        } else if (media.paused) {
          media.play();
        }
      }, 1e3);
    });
  }
  async function watchFile() {
    var _a;
    const vue = (_a = $el(".el-carousel")) == null ? void 0 : _a.__vue__;
    if (!vue) {
      return;
    }
    for (let index = 0; index < vue.items.length; index++) {
      await $.sleep(3e3);
      vue.next();
    }
  }
  async function start() {
    var _a, _b;
    const vue = (_a = $el(".guide")) == null ? void 0 : _a.__vue__;
    const info = ((_b = vue == null ? void 0 : vue.courseList) == null ? void 0 : _b.id) ? vue == null ? void 0 : vue.courseList : vue == null ? void 0 : vue.designData;
    if ((info == null ? void 0 : info.id) !== void 0) {
      return info;
    } else {
      return void 0;
    }
  }
  function getNextObject() {
    var _a, _b;
    return (_b = (_a = $el(".guide")) == null ? void 0 : _a.__vue__) == null ? void 0 : _b.nextObj;
  }
  async function next() {
    var _a;
    const nextObject = getNextObject();
    const id = new URL(window.location.href).searchParams.get("id");
    console.log(nextObject);
    if (id && (nextObject == null ? void 0 : nextObject.id) !== void 0) {
      if (["\u6D4B\u9A8C", "\u8BA8\u8BBA"].some((i) => nextObject.fileType === i)) {
        const res = await getCourseInfo(nextObject.id);
        $console.info(`\u4E0B\u4E2A\u4EFB\u52A1\u70B9\u4E3A${nextObject.fileType}\uFF0C\u5373\u5C06\u8DF3\u8FC7`);
        await $.sleep(3e3);
        window.location.href = window.location.href.replace(id, res.data.next.id);
      } else {
        (_a = $el(".preOrNext .next .el-link")) == null ? void 0 : _a.click();
      }
    } else {
      $message("success", {
        duration: 0,
        content: "\u5168\u90E8\u4EFB\u52A1\u5DF2\u5B8C\u6210\u3002"
      });
      $console.info("\u5168\u90E8\u4EFB\u52A1\u5DF2\u5B8C\u6210\u3002");
      CommonProject.scripts.settings.methods.notificationBySetting("\u5168\u90E8\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF01", {
        duration: 0,
        extraTitle: "\u804C\u6559\u4E91\u5B66\u4E60\u811A\u672C"
      });
      state$1.studying = false;
    }
  }
  async function waitForLoad() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        var _a;
        if (((_a = $el(".guide")) == null ? void 0 : _a.__vue__) !== void 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
  }
  async function waitForQuestions() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if ($el(".subjectList") !== void 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
  }
  function workOrExam(type, { period, thread, answerSeparators, answerMatchMode }) {
    $message("info", { content: "\u5F00\u59CB\u4F5C\u4E1A" });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zjy"
    });
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 == null ? void 0 : t2.innerText).join(",");
    };
    const worker = new OCSWorker({
      root: ".subjectDet",
      elements: {
        title: type === "work" ? "h2,h3,h4,h5,h6" : ".titleTest span:not(.xvhao)",
        options: ".optionList div , .tkInput .el-input, .tkInput .el-textarea"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerMatchMode,
      answerer: async (elements, ctx) => {
        const title = titleTransform(elements.title);
        if (title) {
          await $.sleep((period != null ? period : 3) * 1e3);
          return searchQuestionAnswers({
            type: ctx.type || "unknown",
            title,
            options: ctx.elements.options.map((o) => o.innerText).join("\n")
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: {
        type(ctx) {
          const options = ctx.elements.options;
          const radio_len = options.map((o) => o.querySelector('[type="radio"]')).reduce((a, b) => {
            return a + (b ? 1 : 0);
          }, 0);
          return radio_len > 0 ? radio_len === 2 ? "judgement" : "single" : options.some((o) => o.querySelector('[type="checkbox"]')) ? "multiple" : options.some((o) => o.querySelector('[type="text"]')) || options.some((o) => o.querySelector("textarea")) ? "completion" : void 0;
        },
        handler(type2, answer, option, ctx) {
          var _a, _b;
          if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
            if (((_a = option.querySelector("input")) == null ? void 0 : _a.checked) !== true) {
              (_b = option.querySelector("label")) == null ? void 0 : _b.click();
            }
          } else if (type2 === "completion" && answer.trim()) {
            const text = option.querySelector('input[type="text"]');
            const textarea = option.querySelector("textarea");
            if (text) {
              text.value = answer;
              text.dispatchEvent(new Event("input", { bubbles: true }));
            } else if (textarea) {
              textarea.value = answer;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        }
      },
      onResultsUpdate(curr, _, res) {
        var _a;
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
        CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
      }
    });
    worker.doWork({ enable_debug: true }).then(() => {
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      $message("error", { content: `\u4F5C\u4E1A/\u8003\u8BD5\u5931\u8D25: ${err}`, duration: 0 });
    });
    return worker;
  }
  function getCourseInfo(id) {
    var _a;

  }
