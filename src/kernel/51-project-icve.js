  const state$2 = {
    study: {
      currentMedia: void 0,
      currentStudyLockId: 0,
      playbackRateWarningListenerId: 0,
      courseLengthListenerId: 0
    }
  };
  const _StudyLock = class {
    constructor() {
      _StudyLock.auto_inc++;
      this.id = _StudyLock.auto_inc;
      state$2.study.currentStudyLockId = this.id;
    }
    canStudy() {
      return this.id === state$2.study.currentStudyLockId;
    }
    static getLock() {
      return new _StudyLock();
    }
  };
  let StudyLock = _StudyLock;
  StudyLock.auto_inc = 0;
  const IcveMoocProject = Project.create({
    name: "\u667A\u6167\u804C\u6559",
    domains: [
      "icve.com.cn",
      "course.icve.com.cn",
      "courshare.cn"
    ],
    scripts: {
      guide: new Script({
        name: "\u4F7F\u7528\u63D0\u793A",
        url: [
          ["\u4E2A\u4EBA\u9996\u9875", "icve.com.cn/studycenter"],
          ["\u5B66\u4E60\u9875\u9762", "icve.com.cn/study/directory"],
          ["MOOC\u5B66\u9662-\u4E2A\u4EBA\u9996\u9875", "user.icve.com.cn"],
          ["MOOC\u5B66\u9662-\u9996\u9875", "mooc.icve.com.cn"]
        ],
        namespace: "icve.guide",
        configs: {
          notes: {
            defaultValue: $creator.notes(["\u8BF7\u70B9\u51FB\u4EFB\u610F\u8BFE\u7A0B\u8FDB\u5165", "\u8FDB\u5165\u8BFE\u7A0B\u540E\u70B9\u51FB\u4EFB\u610F\u7AE0\u8282\u8FDB\u5165\uFF0C\u5373\u53EF\u81EA\u52A8\u5B66\u4E60"]).outerHTML
          }
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
        }
      }),
      studyCenter: new Script({
        name: "\u667A\u6167\u804C\u6559 \u00B7 \u5B66\u4E60\u4E2D\u5FC3",
        namespace: "icve.study.center",
        url: [
          ["\u5B66\u4E60\u4E2D\u5FC3\u9875\u9762", "/study/directory/dir_course.html"],
          ["\u8BFE\u7A0B\u5217\u8868", "icve.com.cn/study/directory/directory_list.html"]
        ],
        configs: {
          playbackRate,
          volume,
          currentCourseUrlList: {
            defaultValue: []
          }
        },
        async oncomplete() {
          if (location.href.includes("icve.com.cn/study/directory/directory_list.html")) {
            await waitForElement(".h_cells a");
            this.cfg.currentCourseUrlList = Array.from(document.querySelectorAll(".h_cells a")).map(
              (a) => a.href
            );
            return;
          }
          if (this.cfg.currentCourseUrlList.length === 0) {
            try {

              const res = await fetch(url).then((res2) => res2.text());
              const doc = new DOMParser().parseFromString(res, "text/html");
              this.cfg.currentCourseUrlList = Array.from(doc.querySelectorAll(".h_cells a")).map(
                (a) => a.href
              );
            } catch (e) {
              console.error(e);
              $message("error", { content: "\u8BFE\u7A0B\u5217\u8868\u83B7\u53D6\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002" });
              return;
            }
          }
          CommonProject.scripts.render.methods.pin(this);
          this.onConfigChange("playbackRate", (playbackRate2) => {
            state$2.study.currentMedia && (state$2.study.currentMedia.playbackRate = parseFloat(playbackRate2.toString()));
          });
          this.onConfigChange("volume", (v) => state$2.study.currentMedia && (state$2.study.currentMedia.volume = v));
          const study2 = async () => {
            var _a;
            const res = await Promise.race([waitForElement("video, audio"), waitForElement(".docBox")]);
            if (res) {
              const jobName = ((_a = document.querySelector(".tabsel.seled")) == null ? void 0 : _a.getAttribute("title")) || "-";
              $message("info", { content: "\u5F00\u59CB\u4EFB\u52A1\uFF1A" + jobName });
              $console.log(`\u4EFB\u52A1 ${jobName} \u5F00\u59CB\u3002`);
              if (document.querySelector("video, audio")) {
                const media = await waitForMedia();
                state$2.study.currentMedia = media;
                media.volume = this.cfg.volume;
                await new Promise((resolve, reject) => {
                  try {
                    console.log(document.hasFocus());
                    window.focus();
                    $gm.unsafeWindow.jwplayer().onComplete(async () => {
                      $console.log("\u89C6\u9891/\u97F3\u9891\u64AD\u653E\u5B8C\u6210\u3002");
                      await $.sleep(3e3);
                      resolve();
                    });
                    const play = () => {
                      $gm.unsafeWindow.jwplayer().play();
                      $gm.unsafeWindow.jwplayer().play();
                      media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                    };
                    media.addEventListener("pause", async () => {
                      if (!media.ended) {
                        await $.sleep(1e3);
                        playMedia(play);
                      }
                    });
                    playMedia(play);
                  } catch (err) {
                    reject(err);
                  }
                });
              }
              $message("success", { content: `\u4EFB\u52A1 ${jobName} \u5B8C\u6210\uFF0C\u4E09\u79D2\u540E\u4E0B\u4E00\u7AE0` });
              $console.log(`\u4EFB\u52A1 ${jobName} \u5B8C\u6210\uFF0C\u4E09\u79D2\u540E\u4E0B\u4E00\u7AE0`);
            } else {
              $console.error(`\u4E0D\u652F\u6301\u7684\u4EFB\u52A1\u9875\u9762\uFF0C\u8BF7\u8DDF\u4F5C\u8005\u8FDB\u884C\u53CD\u9988\u3002\u4E09\u79D2\u540E\u4E0B\u4E00\u7AE0`);
            }
            await $.sleep(3e3);
            next2();
          };
          const next2 = () => {
            for (let index = 0; index < this.cfg.currentCourseUrlList.length; index++) {
              const url = this.cfg.currentCourseUrlList[index];
              const nextUrl = this.cfg.currentCourseUrlList[index + 1];
              if (new URL(url).hash === new URL(location.href).hash) {
                if (!nextUrl) {
                  $modal("alert", { content: "\u5168\u90E8\u4EFB\u52A1\u5DF2\u5B8C\u6210" });
                  CommonProject.scripts.settings.methods.notificationBySetting("\u5168\u90E8\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF01", {
                    duration: 0,
                    extraTitle: "\u667A\u6167\u804C\u6559\u5B66\u4E60\u811A\u672C"
                  });
                  return;
                } else {
                  window.location.href = this.cfg.currentCourseUrlList[index + 1];
                }
              }
            }
          };
          study2();
        }
      }),
      study: new Script({
        name: "MOOC \u5B66\u9662 \u00B7 \u8BFE\u7A0B\u5B66\u4E60",
        namespace: "icve.study.main",
        url: [["\u8BFE\u7A0B\u5B66\u4E60\u9875\u9762", "/learnspace/learn/learn/templateeight/index.action"]],
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u5982\u679C\u89C6\u9891\u65E0\u6CD5\u64AD\u653E\uFF0C\u53EF\u4EE5\u624B\u52A8\u70B9\u51FB\u5176\u4ED6\u4EFB\u52A1\u8DF3\u8FC7\u89C6\u9891\u3002",
              "\u7ECF\u8FC7\u6D4B\u8BD5\u89C6\u9891\u500D\u901F\u6700\u591A\u4E8C\u500D\uFF0C\u5426\u5219\u4F1A\u5224\u5B9A\u65E0\u6548\u3002",
              "\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A\u9875\u9762\u624D\u80FD\u4F7F\u7528\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          },
          playbackRate,
          volume,
          restudy,
          showScrollBar: {
            label: "\u663E\u793A\u53F3\u4FA7\u6EDA\u52A8\u6761",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          expandAll: {
            label: "\u5C55\u5F00\u6240\u6709\u7AE0\u8282",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          switchPeriod: {
            label: "\u4E0B\u4E00\u7AE0\u8282\u5207\u6362\u95F4\u9694\uFF08\u79D2\uFF09",
            defaultValue: 10,
            attrs: {
              type: "number",
              min: 0,
              max: 999,
              step: 1
            }
          }
        },
        onrender() {
          this.offConfigChange(state$2.study.playbackRateWarningListenerId);
          state$2.study.playbackRateWarningListenerId = this.onConfigChange("playbackRate", (playbackRate2) => {
            if (playbackRate2 > 4) {
              $modal("alert", {
                title: "\u26A0\uFE0F\u9AD8\u500D\u901F\u8B66\u544A",
                content: $creator.notes(["\u9AD8\u500D\u901F\u53EF\u80FD\u5BFC\u81F4\u89C6\u9891\u65E0\u6CD5\u5B8C\u6210\uFF01"])
              });
            }
          }) || 0;
        },
        async oncomplete() {
          var _a;
          CommonProject.scripts.render.methods.pin(this);
          await $.sleep(3e3);
          this.onConfigChange("volume", (v) => state$2.study.currentMedia && (state$2.study.currentMedia.volume = v));
          this.onConfigChange(
            "playbackRate",
            (r) => state$2.study.currentMedia && (state$2.study.currentMedia.playbackRate = parseFloat(r.toString()))
          );
          const mainContentWin = (_a = $el("#mainContent")) == null ? void 0 : _a.contentWindow;
          if (mainContentWin) {
            $modal("confirm", {
              content: el("div", [
                "\u662F\u5426\u5F00\u59CB\u81EA\u52A8\u5B66\u4E60\u5F53\u524D\u7AE0\u8282\uFF1F",
                el("br"),
                "\u4F60\u4E5F\u53EF\u4EE5\u9009\u62E9\u4EFB\u610F\u7684\u7AE0\u8282\u8FDB\u884C\u70B9\u51FB\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u5B66\u4E60\uFF0C\u5E76\u4E00\u76F4\u5F80\u4E0B\u5BFB\u627E\u7AE0\u8282\u3002"
              ]),
              cancelButtonText: "\u6211\u60F3\u624B\u52A8\u9009\u62E9\u7AE0\u8282",
              confirmButtonText: "\u5F00\u59CB\u5B66\u4E60",
              async onConfirm() {
                study2(StudyLock.getLock());
                scrollToJob();
              }
            });
          }
          if (this.cfg.showScrollBar) {
            const bar = $el(".dumascroll_area", mainContentWin.document);
            bar && (bar.style.overflow = "auto");
          }
          if (this.cfg.expandAll) {
            $$el(".s_sectionlist,.s_sectionwrap", mainContentWin.document).forEach((el2) => el2.style.display = "block");
          }
          for (const job of $$el(".s_point[itemtype]", mainContentWin.document)) {
            job.addEventListener("click", (e) => {
              const lock = StudyLock.getLock();
              if (e.isTrusted) {
                if (job.getAttribute("itemtype") === "exam") {
                  return $message("info", {
                    duration: 60,
                    content: "\u68C0\u6D4B\u5230\u60A8\u624B\u52A8\u9009\u62E9\u4E86\u4F5C\u4E1A/\u8003\u8BD5\u7AE0\u8282\uFF0C\u5C06\u4E0D\u4F1A\u81EA\u52A8\u8DF3\u8F6C\uFF0C\u8BF7\u5B8C\u6210\u540E\u624B\u52A8\u9009\u62E9\u5176\u4ED6\u7AE0\u8282\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u5B66\u4E60\u3002"
                  });
                } else {
                  $message("info", { content: "\u68C0\u6D4B\u5230\u7AE0\u8282\u5207\u6362\uFF0C\u5373\u5C06\u81EA\u52A8\u5B66\u4E60..." });
                }
              }
              setTimeout(() => {
                study2(lock);
              }, 3e3);
            });
          }
          const scrollToJob = () => {
            var _a2;
            return (_a2 = $el(".s_pointerct", mainContentWin.document)) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "center" });
          };
          const study2 = async (studyLock) => {
            var _a2;
            const iframe = $el("iframe", mainContentWin.document);
            const win = iframe == null ? void 0 : iframe.contentWindow;
            if (win) {
              const doc = win.document;
              if (iframe.src.includes("content_video.action") || iframe.src.includes("content_audio.action")) {
                $console.log("\u89C6\u9891/\u97F3\u9891\u64AD\u653E\u4E2D...");
                try {
                  const media = await waitForMedia({ root: doc });
                  state$2.study.currentMedia = media;
                  media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                  media.volume = this.cfg.volume;
                  media.currentTime = 0;
                  await new Promise((resolve, reject) => {
                    try {
                      win.jwplayer().onComplete(async () => {
                        $console.log("\u89C6\u9891/\u97F3\u9891\u64AD\u653E\u5B8C\u6210\u3002");
                        await $.sleep(3e3);
                        resolve();
                      });
                      media.addEventListener("pause", async () => {
                        if (!media.ended) {
                          await waitForPopupQuestion(doc);
                          await $.sleep(1e3);
                          playMedia(() => media.play());
                        }
                      });
                      playMedia(() => media.play());
                    } catch (err) {
                      reject(err);
                    }
                  });
                } catch (err) {
                  $message("error", { content: String(err) });
                }
              } else if (iframe.src.includes("content_doc.action")) {
                await $.sleep(5e3);
              }
            }
            $console.log(this.cfg.switchPeriod + " \u79D2\u540E\u5207\u6362\u4E0B\u4E00\u7AE0\u8282\u3002");
            await $.sleep(this.cfg.switchPeriod * 1e3);
            if (studyLock.canStudy()) {
              let nextEl;
              let isBellowCurrentJob = false;
              const jobs = $$el(".s_point[itemtype]", mainContentWin.document);
              for (let index = 0; index < jobs.length; index++) {
                const job = jobs[index];
                if (job.classList.contains("s_pointerct")) {
                  isBellowCurrentJob = true;
                } else if (isBellowCurrentJob) {
                  if (job.querySelector(".done_icon_show") === null || this.cfg.restudy) {
                    $console.log("\u4E0B\u4E00\u7AE0\uFF1A", job.title || ((_a2 = $el(".s_pointti", job)) == null ? void 0 : _a2.title) || "\u672A\u77E5");
                    nextEl = job;
                    break;
                  }
                }
              }
              if (nextEl) {
                nextEl.click();
                scrollToJob();
              } else {
                $modal("alert", { content: "\u5168\u90E8\u4EFB\u52A1\u5DF2\u5B8C\u6210" });
                CommonProject.scripts.settings.methods.notificationBySetting("\u5168\u90E8\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF01", {
                  duration: 0,
                  extraTitle: "\u667A\u6167\u804C\u6559\u5B66\u4E60\u811A\u672C"
                });
              }
            }
          };
        }
      }),
      work: new Script({
        name: "\u4F5C\u4E1A\u8003\u8BD5",
        url: [["\u4F5C\u4E1A\u8003\u8BD5\u9875\u9762", "/exam"]],
        namespace: "icve.work",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "自动答题前请在「AI 聊天」配置 AI 接口。",
              "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002",
              "\u8BF7\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A\u8003\u8BD5\u9875\u9762\u624D\u80FD\u4F7F\u7528\u81EA\u52A8\u7B54\u9898\u3002"
            ]).outerHTML
          }
        },
        async oncomplete() {
          $message("info", { content: "\u81EA\u52A8\u7B54\u9898\u65F6\u8BF7\u52FF\u5207\u6362\u9898\u76EE\uFF0C\u5426\u5219\u53EF\u80FD\u5BFC\u81F4\u91CD\u590D\u641C\u9898\u6216\u8005\u811A\u672C\u5361\u4E3B\u3002" });
          const resetToBegin = () => {
            var _a;
            (_a = document.querySelectorAll(`.sheet_nums [id*="sheetSeq"]`).item(0)) == null ? void 0 : _a.click();
          };
          commonWork(this, {
            workerProvider: work,
            beforeRunning: async () => {
              resetToBegin();
              await $.sleep(1e3);
            },
            onRestart: () => resetToBegin()
          });
        }
      }),
      workDispatcher: new Script({
        name: "\u4F5C\u4E1A\u8C03\u5EA6\u811A\u672C",
        url: [
          ["\u4F5C\u4E1A\u8FDB\u5165\u9875\u9762", "/platformwebapi/student/exam/"],
          ["\u786E\u8BA4\u4F5C\u4E1A\u9875\u9762", "/student/exam/studentExam_studentInfo.action"]
        ],
        hideInPanel: true,
        oncomplete() {
          if (/\/platformwebapi\/student\/exam/.test(window.location.href)) {
            cors.on("icve-work-start", () => {
              setTimeout(() => {
                $gm.unsafeWindow.openExamInfo();
              }, 3e3);
            });
          }
          if (/\/student\/exam\/studentExam_studentInfo.action/.test(window.location.href)) {
            setTimeout(() => {
              $gm.unsafeWindow.enterExamPage();
            }, 3e3);
          }
        }
      })
    }
  });
  function work({ period, thread, answerSeparators, answerMatchMode }) {
    $message("info", { content: "\u5F00\u59CB\u4F5C\u4E1A" });
    CommonProject.scripts.workResults.methods.init();
    console.log({ period, thread });
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => {
        var _a, _b;
        if (t2) {
          const title = t2.cloneNode(true);
          (_a = title.querySelector('[name*="questionIndex"]')) == null ? void 0 : _a.remove();
          (_b = title.querySelector(".q_score")) == null ? void 0 : _b.remove();
          return title.innerText.trim().replace(/^、/, "") || "";
        }
        return "";
      }).join(",");
    };
    const workResults = [];
    let totalQuestionCount = 0;
    let requestedCount = 0;
    let resolvedCount = 0;
    function getType(options) {
      const radio_len = options.map((o) => o.querySelector('[type="radio"]')).reduce((a, b) => {
        return a + (b ? 1 : 0);
      }, 0);
      return radio_len > 0 ? radio_len === 2 ? "judgement" : "single" : options.some((o) => o.querySelector('[type="checkbox"]')) ? "multiple" : options.some((o) => o.querySelector("textarea")) ? "completion" : options.some((o) => o.querySelector(".fillblank_input input")) ? "fill-blank" : void 0;
    }
    const worker = new OCSWorker({
      root: ".q_content",
      elements: {
        title: '.divQuestionTitle, [name="fillblankTitle"]',
        options: ".questionOptions .q_option, .questionOptions.divTextarea, .answerOption"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerMatchMode,
      answerer: async (elements, ctx) => {
        const title = titleTransform(elements.title);
        if (title) {
          await $.sleep((period != null ? period : 3) * 1e3);
          return searchQuestionAnswers({
            type: getType(ctx.elements.options) || "unknown",
            title,
            options: ctx.elements.options.map((o) => o.innerText).join("\n")
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      async work(ctx) {
        const options = ctx.elements.options;
        const type = getType(options);
        if (!type) {
          throw new Error("\u65E0\u6CD5\u83B7\u53D6\u9898\u76EE\u7C7B\u578B\uFF01");
        }
        if (type === "fill-blank") {
          const inputs = options.map((o) => Array.from(o.querySelectorAll(".fillblank_input input"))).flat();
          for (const searchInfo of ctx.searchInfos) {
            for (const result of searchInfo.results) {
              const answers = splitAnswer(result.answer);
              if (answers.length === inputs.length) {
                for (let index = 0; index < inputs.length; index++) {
                  inputs[index].value = answers[index];
                }
                return { finish: true };
              }
            }
          }
        } else {
          const resolver = defaultQuestionResolve(ctx)[type];
          const res = await resolver(ctx.searchInfos, ctx.elements.options, (type2, answer, option) => {
            var _a, _b;
            if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
              if (option.querySelector(".checkbox_on") === null) {
                (_a = $el("div", option)) == null ? void 0 : _a.click();
              }
            } else if (type2 === "completion" && answer.trim()) {
              const text = option.querySelector("textarea");
              const textIframe = option.querySelector('iframe[id*="ueditor"]');
              if (text) {
                text.value = answer;
              }
              if (textIframe) {
                const view = (_b = textIframe.contentWindow) == null ? void 0 : _b.document.querySelector("body.view > p");
                if (view) {
                  view.innerText = answer;
                }
              }
            }
          });
          return res;
        }
        return { finish: false };
      },
      onElementSearched(elements, root2) {
        console.log("elements", elements);
      },
      onResultsUpdate(currentResult) {
        var _a;
        if (currentResult.resolved) {
          workResults.push(...simplifyWorkResult([currentResult], titleTransform));
          CommonProject.scripts.workResults.methods.setResults(workResults);
          totalQuestionCount++;
          requestedCount++;
          resolvedCount++;
          CommonProject.scripts.workResults.methods.updateWorkState({
            totalQuestionCount,
            requestedCount,
            resolvedCount
          });
        }
      }
    });
    const getNextBtn = () => document.querySelector(".paging_next");
    let next2 = getNextBtn();
    (async () => {
      while (next2 && worker.isClose === false) {
        await worker.doWork({ enable_debug: true });
        await $.sleep(1e3);
        next2 = getNextBtn();
        if (next2.style.display === "none") {
          break;
        } else {
          next2 == null ? void 0 : next2.click();
          await $.sleep(1e3);
        }
      }
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "icve";
    })();
    return worker;
  }
  function waitForPopupQuestion(dom) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        var _a, _b;
        const el2 = $el(".popup-test", dom);
        if (el2) {
          clearInterval(interval);
          const right_answer = ((_a = $el("#right_answer", el2)) == null ? void 0 : _a.value) || "A";
          for (const answer of right_answer.split("")) {
            const item = $el(`li.test-item-cell[curval="${answer}"]`, el2);
            item == null ? void 0 : item.click();
          }
          (_b = $el('[name="save_btn"]', el2)) == null ? void 0 : _b.click();
          setTimeout(() => {
            var _a2;
            (_a2 = $el('[name="continue_btn"]', el2)) == null ? void 0 : _a2.click();
            resolve();
          }, 3e3);
        }
      }, 1e3);
    });
  }
  const state$1 = {
    studying: false,
    studyingId: ""
  };
