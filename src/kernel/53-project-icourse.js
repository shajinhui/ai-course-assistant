  const state = {
    currentMedia: void 0,
    currentUrlHash: "",
    currentRunningScriptName: ""
  };
  const ICourseProject = Project.create({
    name: "\u4E2D\u56FD\u5927\u5B66MOOC",
    domains: ["icourse163.org"],
    scripts: {
      dispatcher: new Script({
        name: "\u8C03\u5EA6\u5668",
        hideInPanel: true,
        url: [["\u6240\u6709\u9875\u9762", "icourse163.org"]],
        oncomplete() {
          setInterval(() => {
            var _a, _b;
            const hash = new URL(window.location.href).hash;
            if (state.currentUrlHash !== hash) {
              state.currentRunningScriptName = "";
            }
            state.currentUrlHash = hash;
            for (const key in ICourseProject.scripts) {
              if (Object.prototype.hasOwnProperty.call(ICourseProject.scripts, key)) {
                const script = ICourseProject.scripts[key];
                const runAtHash = Array.isArray(script.cfg.runAtHash) ? script.cfg.runAtHash : [script.cfg.runAtHash];
                if (runAtHash.length && runAtHash.some((h) => state.currentUrlHash.includes(h))) {
                  if (state.currentRunningScriptName !== script.name) {
                    state.currentRunningScriptName = script.name;
                    (_b = (_a = script.methods) == null ? void 0 : _a.main) == null ? void 0 : _b.call(_a, () => {
                      return state.currentUrlHash && runAtHash.some((h) => state.currentUrlHash.includes(h));
                    });
                  }
                  break;
                }
              }
            }
          }, 1e3);
        }
      }),
      guide: new Script({
        name: "\u4F7F\u7528\u63D0\u793A",
        url: [["", "icourse163.org"]],
        namespace: "icourse.guide-v1",
        configs: {
          notes: {
            defaultValue: $creator.notes(["\u624B\u52A8\u8FDB\u5165\u4EFB\u610F\u8BFE\u7A0B\u91CC\u7684\u8BFE\u4EF6/\u4F5C\u4E1A\uFF0C\u5373\u53EF\u5F00\u59CB\u81EA\u52A8\u5B66\u4E60"]).outerHTML
          },
          runAtHash: {
            defaultValue: ["/home/course"]
          }
        },
        methods() {
          return {
            main: async () => {
              console.log(state, this.cfg.runAtHash);
              CommonProject.scripts.render.methods.pin(this);
            }
          };
        }
      }),
      study: new Script({
        name: "\u8BFE\u7A0B\u5B66\u4E60",
        namespace: "icourse.study-v1",
        url: [
          ["MOOC\u4F5C\u4E1A\u9875\u9762", "icourse163.org/learn"],
          ["SPOC\u4F5C\u4E1A\u9875\u9762", "icourse163.org/spoc/learn"]
        ],
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u8BF7\u52FF\u5728\u4F7F\u7528\u8FC7\u7A0B\u4E2D\u6700\u5C0F\u5316\u6D4F\u89C8\u5668",
              "\u81EA\u52A8\u8BA8\u8BBA\u9ED8\u8BA4\u5173\u95ED\uFF0C\u5982\u9700\u5F00\u542F\u8BF7\u5728\u4E0B\u65B9\u8BBE\u7F6E\u4E2D\u8BBE\u7F6E",
              "\u4F5C\u4E1A\u8BF7\u5B8C\u6210\u8BFE\u7A0B\u540E\u624B\u52A8\u8FDB\u5165"
            ]).outerHTML
          },
          runAtHash: {
            defaultValue: "/learn/content?type=detail"
          },
          playbackRate,
          volume,
          readSpeed: {
            label: "PPT\u7FFB\u9605\u901F\u5EA6\uFF08\u79D2\uFF09",
            attrs: { type: "number", step: "1", min: "1", max: "10" },
            defaultValue: 1
          },
          discussionStrategy: {
            label: "\u8BA8\u8BBA\u81EA\u52A8\u56DE\u590D\u65B9\u5F0F",
            tag: "select",
            defaultValue: "not-reply",
            options: [
              ["not-reply", "\u4E0D\u8BA8\u8BBA\u56DE\u590D"],
              ["max-show-up", "\u83B7\u53D6\u51FA\u73B0\u6700\u591A\u7684\u8BC4\u8BBA\u8FDB\u884C\u56DE\u590D"],
              ["max-fav", "\u83B7\u53D6\u6700\u591A\u70B9\u8D5E\u7684\u8BC4\u8BBA\u8FDB\u884C\u56DE\u590D"],
              ["use-newest", "\u83B7\u53D6\u6700\u65B0\u7684\u8BC4\u8BBA\u8FDB\u884C\u56DE\u590D"]
            ]
          },
          enableChapterTest: {
            label: "\u968F\u5802\u6D4B\u9A8C\u81EA\u52A8\u7B54\u9898",
            attrs: {
              type: "checkbox",
              title: "\u662F\u5426\u5F00\u542F\u968F\u5802\u6D4B\u9A8C\u81EA\u52A8\u7B54\u9898\uFF0C\u9ED8\u8BA4\u5173\u95ED\uFF0C\u6D4B\u8BD5\u65F6\u53EA\u9700\u70B9\u51FB\u5373\u53EF\u5B8C\u6210\u6D4B\u9A8C\uFF0C\u4F46\u8FD9\u91CC\u4FDD\u7559\u9009\u9879\u9632\u6B62\u9700\u8981\u5F00\u542F\u3002"
            },
            defaultValue: false
          }
        },
        oncomplete() {
          this.onConfigChange("playbackRate", (playbackRate2) => {
            state.currentMedia && (state.currentMedia.playbackRate = parseFloat(playbackRate2.toString()));
          });
          this.onConfigChange("volume", (v) => state.currentMedia && (state.currentMedia.volume = v));
        },
        methods() {
          return {
            main: async (canRun) => {
              CommonProject.scripts.render.methods.pin(this);
              const remotePage = await RemotePlaywright.getCurrentPage();
              if (!remotePage) {
                return $playwright.showError();
              }
              CommonProject.scripts.render.methods.moveToEdge();
              const study2 = async () => {
                var _a, _b;
                const lessonName = (_a = document.querySelector(".j-lesson .j-up")) == null ? void 0 : _a.textContent;
                const currentUnitItem = document.querySelector(".j-unitslist  li.current");
                const unitName = (_b = currentUnitItem == null ? void 0 : currentUnitItem.querySelector(".unit-name")) == null ? void 0 : _b.textContent;
                $console.log(`\u6B63\u5728\u5B66\u4E60\uFF1A${lessonName || ""} - ${unitName || ""}`);
                const isJob = (iconName) => currentUnitItem == null ? void 0 : currentUnitItem.querySelector(`[class*=${iconName}]`);
                let hasJob = true;
                if (isJob("u-icon-video")) {
                  await waitForElement("video, audio");
                  await watchMedia(this.cfg.playbackRate, this.cfg.volume);
                  $console.log("\u89C6\u9891\u5B66\u4E60\u5B8C\u6210");
                } else if (isJob("u-icon-doc")) {
                  await waitForElement(".ux-pdf-reader");
                  await readPPT(remotePage, this.cfg.readSpeed);
                  $console.log("PPT\u5B8C\u6210");
                } else if (isJob("u-icon-discuss")) {
                  await waitForElement(".j-reply-all");
                  await discussion(remotePage, this.cfg.discussionStrategy);
                  $console.log("\u8BA8\u8BBA\u5B8C\u6210");
                } else if (isJob("u-icon-test")) {
                  const replay = await waitForElement(".j-replay");
                  if ((replay == null ? void 0 : replay.style.display) === "none") {
                    if (this.cfg.enableChapterTest) {
                      await new Promise((resolve) => {
                        ICourseProject.scripts.work.methods.start("chapter-test", canRun, (worker) => {
                          console.log("worker", worker);
                          worker.once("done", resolve);
                          worker.once("close", resolve);
                        });
                      });
                      $console.log("\u6D4B\u9A8C\u5B8C\u6210");
                    } else {
                      $console.warn("\u968F\u5802\u6D4B\u9A8C\u81EA\u52A8\u7B54\u9898\u529F\u80FD\u5DF2\u5173\u95ED\uFF08\u4E0A\u65B9\u83DC\u5355\u680F-\u4E2D\u56FD\u5927\u5B66MOOC-\u5B66\u4E60\u811A\u672C\u4E2D\u5F00\u542F\uFF09\uFF0C\u5373\u5C06\u8DF3\u8FC7\u3002");
                    }
                  } else {
                    $console.log("\u968F\u5802\u6D4B\u9A8C\u5DF2\u5B8C\u6210\uFF0C\u5373\u5C06\u8DF3\u8FC7\u3002");
                  }
                } else if (isJob("u-icon-text")) {
                  $console.log("\u6587\u6863\u65E0\u9700\u5904\u7406\uFF0C\u5373\u5C06\u8DF3\u8FC7\u3002");
                } else {
                  hasJob = false;
                }
                await $.sleep(3e3);
                if (canRun()) {
                  if (hasJob) {
                    $console.log("\u51C6\u5907\u8DF3\u8F6C\u4E0B\u4E00\u7AE0");
                  } else {
                    $console.warn("\u672A\u627E\u5230\u5B66\u4E60\u5185\u5BB9\uFF0C\u6216\u8005\u6B64\u7AE0\u8282\u4E0D\u652F\u6301\u81EA\u52A8\u5B66\u4E60\uFF01\u5373\u5C06\u8DF3\u8FC7\u672C\u7AE0\u8282");
                  }
                  await gotoNextJob();
                }
              };
              study2();
              async function gotoNextJob() {
                const list = await next2();
                for (const item of list) {
                  const el2 = typeof item === "function" ? item() : item;
                  if (el2) {
                    await (remotePage == null ? void 0 : remotePage.click(el2));
                  }
                }
                if (list.length === 0) {
                  $message("success", { content: "\u6240\u6709\u7AE0\u8282\u5B66\u4E60\u5B8C\u6210\uFF01", duration: 0 });
                  $console.info("\u6240\u6709\u7AE0\u8282\u5B66\u4E60\u5B8C\u6210\uFF01");
                  CommonProject.scripts.settings.methods.notificationBySetting("\u6240\u6709\u7AE0\u8282\u5B66\u4E60\u5B8C\u6210\uFF01", {
                    duration: 0,
                    extraTitle: "\u4E2D\u56FD\u5927\u5B66MOOC\u5B66\u4E60\u811A\u672C"
                  });
                }
              }
              async function next2() {
                var _a;
                const nextEl = (_a = document.querySelector(".unitslist .current")) == null ? void 0 : _a.nextElementSibling;
                if (nextEl) {
                  return [nextEl.querySelector(".unit-name")];
                }
                const getName = (node) => {
                  var _a2;
                  return (_a2 = node == null ? void 0 : node.textContent) == null ? void 0 : _a2.replace(/\s/g, "");
                };
                const lessonName = getName(document.querySelector(".j-lesson .j-up"));
                if (!lessonName) {
                  throw Error("\u65E0\u6CD5\u8BFB\u53D6\u7AE0\u8282\u540D!");
                }
                const lessonList = Array.from(document.querySelectorAll(".j-lesson .j-list .list"));
                let nextLesson = void 0;
                for (const item of lessonList) {
                  const itemName = getName(item);
                  if (itemName === lessonName) {
                    if (item.nextElementSibling) {
                      nextLesson = item.nextElementSibling;
                      break;
                    }
                  }
                }
                if (nextLesson) {
                  return [
                    document.querySelector(".j-lesson"),
                    nextLesson
                  ];
                }
                const chapterName = getName(document.querySelector(".j-chapter .j-up"));
                if (!chapterName) {
                  throw Error("\u65E0\u6CD5\u8BFB\u53D6\u5355\u5143\u540D!");
                }
                const chapterList = Array.from(document.querySelectorAll(".j-chapter .j-list .list"));
                let nextChapter = void 0;
                for (const item of chapterList) {
                  const itemName = getName(item);
                  if (itemName === chapterName) {
                    if (item.nextElementSibling) {
                      nextChapter = item.nextElementSibling;
                      break;
                    }
                  }
                }
                if (nextChapter) {
                  return [
                    () => document.querySelector(".j-chapter"),
                    () => nextChapter,
                    () => document.querySelector(".j-lesson"),
                    () => document.querySelectorAll(".j-lesson .j-list .list")[0]
                  ];
                } else {
                  return [];
                }
              }
            }
          };
        }
      }),
      work: new Script({
        name: "\u4F5C\u4E1A\u8003\u8BD5",
        namespace: "icourse.work-v1",
        url: [
          ["MOOC\u4F5C\u4E1A\u9875\u9762", "icourse163.org/learn"],
          ["SPOC\u4F5C\u4E1A\u9875\u9762", "icourse163.org/spoc/learn"]
        ],
        configs: {
          notes: workNotes,
          runAtHash: {
            defaultValue: "/learn/quiz"
          }
        },
        methods() {
          const start2 = async (type, canRun, onWorkerCreated) => {
            CommonProject.scripts.render.methods.pin(this);
            CommonProject.scripts.render.methods.moveToEdge();
            const remotePage = await RemotePlaywright.getCurrentPage();
            if (!remotePage) {
              return $playwright.showError();
            }
            await waitForQuestion();
            $console.log("\u5F00\u59CB\u7B54\u9898");
            CommonProject.scripts.render.methods.pin(this);
            commonWork(this, {
              workerProvider: (opts) => {
                const worker = workAndExam(remotePage, type, opts);
                worker.once("close", () => {
                  clearInterval(interval);
                });
                const interval = setInterval(() => {
                  if (canRun() === false) {
                    $message("warn", { content: "\u68C0\u6D4B\u5230\u9875\u9762\u5207\u6362\uFF0C\u65E0\u6CD5\u7EE7\u7EED\u7B54\u9898\uFF0C\u5C06\u5173\u95ED\u81EA\u52A8\u7B54\u9898\u3002" });
                    clearInterval(interval);
                    worker.emit("close");
                  }
                }, 1e3);
                return worker;
              },
              onWorkerCreated
            });
          };
          return {
            main: async (canRun) => {
              if (location.hash.includes("learn/quizscore")) {
                $message("success", { content: "\u5F53\u524D\u4F5C\u4E1A\u5DF2\u5B8C\u6210\uFF0C\u81EA\u52A8\u7B54\u9898\u5173\u95ED\u3002" });
                return;
              }
              return start2("work-or-exam", canRun);
            },
            start: start2
          };
        }
      })
    }
  });
  function waitForQuestion() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (document.querySelector(".u-questionItem")) {
          clearInterval(interval);
          resolve();
        }
      }, 1e3);
    });
  }
  function workAndExam(remotePage, type, {
    period,
    thread,
    redundanceWordsText,
    upload,
    stopSecondWhenFinish,
    answerSeparators,
    answerMatchMode
  }) {
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "icourse"
    });
    const titleTransform = (titles) => {
      return removeRedundantWords(
        titles.map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").filter((t2) => t2.trim() !== "").join(",").replace(/[\u200A-\u200F]/g, ""),
        redundanceWordsText.split("\n")
      );
    };
    const worker = new OCSWorker({
      root: ".u-questionItem",
      elements: {
        title: ".j-title .j-richTxt",
        options: ".choices li,.inputArea"
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
        async handler(type2, answer, option) {
          if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
            const text = option.querySelector(".f-richEditorText");
            const input = option.querySelector("input");
            if (input && !(input == null ? void 0 : input.checked) && text) {
              await remotePage.click(text);
            }
          } else if (type2 === "completion" && answer.trim()) {
            const text = option.querySelector("textarea");
            if (text) {
              text.value = answer.trim();
              await remotePage.click(text);
            }
          }
        }
      },
      onElementSearched(elements, root2) {
        elements.options.forEach((el2) => {
          const correct = el2.querySelector(".u-icon-correct");
          const wrong = el2.querySelector(".u-icon-wrong");
          if (correct) {
            correct.replaceWith("\u5BF9");
          }
          if (wrong) {
            wrong.replaceWith("\u9519");
          }
        });
      },
      onResultsUpdate(curr, _, res) {
        var _a;
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
        CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
      }
    });
    worker.doWork().then(async (results) => {
      if (worker.isClose) {
        return;
      }
      if (type === "chapter-test") {
        $message("info", { content: `\u7B54\u9898\u5B8C\u6210\uFF0C\u5C06\u7B49\u5F85 ${stopSecondWhenFinish} \u79D2\u540E\u8FDB\u884C\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002` });
        $console.info(`\u7B54\u9898\u5B8C\u6210\uFF0C\u5C06\u7B49\u5F85 ${stopSecondWhenFinish} \u79D2\u540E\u8FDB\u884C\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002`);
        await $.sleep(stopSecondWhenFinish * 1e3);
        if (worker.isClose) {
          return;
        }
        await worker.uploadHandler({
          type: upload,
          results,
          async callback(finishedRate, uploadable) {
            const content = `\u5B8C\u6210\u7387 ${finishedRate.toFixed(2)} :  ${uploadable ? "3\u79D2\u540E\u5C06\u81EA\u52A8\u63D0\u4EA4" : "3\u79D2\u540E\u5C06\u81EA\u52A8\u8DF3\u8FC7\uFF08\u6CA1\u4FDD\u5B58\u6309\u94AE\uFF09"} `;
            $console.info(content);
            $message("success", { content, duration: 0 });
            await $.sleep(3e3);
            if (worker.isClose) {
              return;
            }
            if (uploadable) {
              const sumbit = document.querySelector(".j-submit");
              if (sumbit) {
                await remotePage.click(sumbit);
              } else {
                $console.warn("\u6CA1\u6709\u627E\u5230\u63D0\u4EA4\u6309\u94AE\uFF0C\u5C06\u8DF3\u8FC7\u63D0\u4EA4\u3002");
              }
            }
          }
        });
      } else {
        $message("success", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      }
      worker.emit("done");
    }).catch((err) => {
      $message("error", { content: "\u7B54\u9898\u7A0B\u5E8F\u53D1\u751F\u9519\u8BEF : " + err.message, duration: 0 });
    });
    return worker;
  }
  async function watchMedia(playbackRate2, volume2) {
    return new Promise((resolve, reject) => {
      waitForMedia().then((video) => {
        video.playbackRate = playbackRate2;
        video.volume = volume2;
        state.currentMedia = video;
        playMedia(() => video == null ? void 0 : video.play());
        video.onpause = async () => {
          if (!(video == null ? void 0 : video.ended)) {
            video == null ? void 0 : video.play();
          }
        };
        video.onended = () => {
          resolve();
        };
      }).catch(reject);
    });
  }
  async function readPPT(remotePage, readSpeed) {
    var _a, _b, _c, _d;
    const reader = document.querySelector(".ux-pdf-reader");
    if (reader) {
      const total = parseInt(
        ((_c = (_b = (_a = document.querySelector(".ux-h5pdfreader_container_footer_pages_total")) == null ? void 0 : _a.childNodes[1]) == null ? void 0 : _b.textContent) == null ? void 0 : _c.replace(/\s/, "")) || "0"
      );
      const start2 = parseInt(
        ((_d = document.querySelector(".ux-h5pdfreader_container_footer_pages_in")) == null ? void 0 : _d.value) || "1"
      );
      for (let index = start2; index < total + 1; index++) {
        const next2 = document.querySelector(".ux-h5pdfreader_container_footer_pages_next");
        if (next2) {
          await remotePage.click(next2);
        } else {
          $console.error("\u672A\u627E\u5230PPT\u7684\u4E0B\u4E00\u9875\u6309\u94AE\uFF01");
        }
        await $.sleep(readSpeed * 1e3);
      }
    }
  }
  async function discussion(remotePage, discussionStrategy) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (discussionStrategy === "not-reply") {
      return $console.warn("\u8BA8\u8BBA\u81EA\u52A8\u56DE\u590D\u529F\u80FD\u5DF2\u5173\u95ED\uFF08\u4E0A\u65B9\u83DC\u5355\u680F-\u4E2D\u56FD\u5927\u5B66MOOC-\u5B66\u4E60\u811A\u672C\u4E2D\u5F00\u542F\uFF09\u3002");
    }
    let res = "";
    if (discussionStrategy === "max-show-up") {
      const list = Array.from(document.querySelectorAll(".j-reply-all .f-pr .j-content"));
      const mapping = /* @__PURE__ */ new Map();
      for (const item of list) {
        mapping.set(item.textContent, (mapping.get(item.textContent) || 0) + 1);
      }
      const content = (_b = (_a = [...mapping.entries()].sort((a, b) => b[1] - a[1])) == null ? void 0 : _a[0]) == null ? void 0 : _b[0];
      if (!content) {
        $console.error("\u8BFB\u53D6\u51FA\u73B0\u6700\u591A\u8BC4\u8BBA\u5931\u8D25\uFF01");
      }
      res = content;
    } else if (discussionStrategy === "max-fav") {
      const list = Array.from(document.querySelectorAll(".j-reply-all .f-pr"));
      let max = 0;
      let maxEl = void 0;
      for (const item of list) {
        const num = parseInt(((_c = item.querySelector(".bar .num")) == null ? void 0 : _c.textContent) || "0");
        if (num > max) {
          max = num;
          maxEl = item;
        }
      }
      const content = ((_d = maxEl == null ? void 0 : maxEl.querySelector(".j-content")) == null ? void 0 : _d.textContent) || "";
      if (!content) {
        $console.error("\u8BFB\u53D6\u6700\u591A\u70B9\u8D5E\u8BC4\u8BBA\u5931\u8D25\uFF01");
      }
      res = content;
    } else if (discussionStrategy === "use-newest") {
      const content = ((_e = document.querySelector(".j-reply-all .f-pr .first .j-content")) == null ? void 0 : _e.textContent) || "";
      if (!content) {
        $console.error("\u8BFB\u53D6\u6700\u65B0\u8BC4\u8BBA\u5931\u8D25\uFF01");
      }
      res = content;
    }
    const p = (_g = (_f = document.querySelector("[id*=ueditor]")) == null ? void 0 : _f.contentDocument) == null ? void 0 : _g.querySelector("body p");
    if (p) {
      p.innerText = res;
      await $.sleep(1e3);
      const submit = document.querySelector(".ui-richEditor .u-btn-sm");
      if (submit) {
        await remotePage.click(submit);
      } else {
        $console.error("\u63D0\u4EA4\u6309\u94AE\u83B7\u53D6\u5931\u8D25\uFF01");
      }
      await $.sleep(2e3);
    } else {
      $console.error("\u83B7\u53D6\u8BC4\u8BBA\u8F93\u5165\u6846\u5931\u8D25\uFF01");
    }
  }
