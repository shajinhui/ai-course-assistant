  const ZHSProject = Project.create({
    name: "\u77E5\u5230\u667A\u6167\u6811",
    domains: ["zhihuishu.com"],
    scripts: {
      guide: new Script({
        name: "\u4F7F\u7528\u63D0\u793A",
        url: [


        ],
        namespace: "zhs.guide",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u8BF7\u624B\u52A8\u8FDB\u5165\u89C6\u9891\u3001\u4F5C\u4E1A\u3001\u8003\u8BD5\u9875\u9762\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u8FD0\u884C\u3002",
              "\u5174\u8DA3\u8BFE\u4F1A\u81EA\u52A8\u4E0B\u4E00\u4E2A\uFF0C\u6240\u4EE5\u4E0D\u63D0\u4F9B\u811A\u672C\u3002"
            ]).outerHTML
          }
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
        }
      }),
      "gxk-study": new Script({
        name: "\u5171\u4EAB\u8BFE \u00B7 \u5B66\u4E60",
        url: [["\u5171\u4EAB\u8BFE\u5B66\u4E60\u9875\u9762", "studyvideoh5.zhihuishu.com"]],
        namespace: "zhs.gxk.study",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u7AE0\u8282\u6D4B\u8BD5\u8BF7\u5927\u5BB6\u89C2\u770B\u5B8C\u89C6\u9891\u540E\u624B\u52A8\u6253\u5F00\u3002",
              [
                "\u8BF7\u5927\u5BB6\u4ED4\u7EC6\u6253\u5F00\u89C6\u9891\u4E0A\u65B9\u7684\u201D\u5B66\u524D\u5FC5\u8BFB\u201C\uFF0C\u67E5\u770B\u6210\u7EE9\u5206\u5E03\u3002",
                "\u5982\u679C \u201C\u5E73\u65F6\u6210\u7EE9-\u5B66\u4E60\u4E60\u60EF\u6210\u7EE9\u201D \u5360\u6BD4\u591A\u7684\u8BDD\uFF0C\u5C31\u9700\u8981\u89C4\u5F8B\u5B66\u4E60\u3002",
                "\u6BCF\u5929\u5B9A\u65F6\u534A\u5C0F\u65F6\u53EF\u83B7\u5F97\u4E00\u5206\u4E60\u60EF\u5206\u3002",
                "\u5982\u679C\u4E0D\u60F3\u8981\u4E60\u60EF\u5206\u53EF\u5FFD\u7565\u3002"
              ],
              "\u4E0D\u8981\u6700\u5C0F\u5316\u6D4F\u89C8\u5668\uFF0C\u53EF\u80FD\u5BFC\u81F4\u811A\u672C\u6682\u505C\u3002",
              "\u8FD0\u884C\u4E2D\u8BF7\u5C06\u6D4F\u89C8\u5668\u7F29\u653E\u8C03\u6574\u81F3\u9002\u5408\u7684\u5927\u5C0F\uFF0C\u907F\u514D\u5143\u7D20\u906E\u6321\uFF0C\u65E0\u6CD5\u70B9\u51FB"
            ]).outerHTML
          },
          studyRecord: {
            defaultValue: [],
            extra: {
              appConfigSync: false
            }
          },
          stopTime: {
            label: "\u5B9A\u65F6\u505C\u6B62",
            tag: "select",
            attrs: { title: "\u5230\u65F6\u95F4\u540E\u81EA\u52A8\u6682\u505C\u811A\u672C" },
            defaultValue: "0",
            options: [
              ["0", "\u5173\u95ED"],
              ["0.5", "\u534A\u5C0F\u65F6\u540E"],
              ["1", "\u4E00\u5C0F\u65F6\u540E"],
              ["2", "\u4E24\u5C0F\u65F6\u540E"]
            ]
          },
          restudy,
          volume,
          definition,
          playbackRate: {
            label: "\u89C6\u9891\u500D\u901F",
            tag: "select",
            defaultValue: 1,
            options: [
              ["1", "1 x"],
              ["1.25", "1.25 x"],
              ["1.5", "1.5 x"]
            ]
          }
        },
        methods() {
          return {
            increaseStudyTime: (courseName, val) => {
              const records = this.cfg.studyRecord;
              const record = records.find(
                (r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
              );
              let courses = [];
              if (record) {
                courses = record.courses;
              } else {
                records.push({ date: Date.now(), courses });
              }
              const course = courses.find((c) => c.name === courseName);
              if (course) {
                course.time = course.time + val;
                if (typeof course.time === "string") {
                  course.time = parseFloat(course.time);
                }
              } else {
                courses.push({ name: courseName, time: 0 });
              }
              this.cfg.studyRecord = records;
            }
          };
        },
        onrender({ panel: panel2 }) {
          panel2.body.replaceChildren(
            el("hr"),
            $creator.button("\u23F0\u68C0\u6D4B\u662F\u5426\u9700\u8981\u89C4\u5F8B\u5B66\u4E60", {}, (btn) => {
              btn.style.marginRight = "12px";
              btn.onclick = () => {
                var _a;
                (_a = $el(".iconbaizhoumoshi-xueqianbidu")) == null ? void 0 : _a.click();
                setTimeout(() => {
                  var _a2;
                  const pmd = $el(".preschool-Mustread-div");
                  if (pmd) {
                    const div = document.querySelector(".dialog-read");
                    if (div) {
                      div.style.display = "block";
                    }
                    const num = parseInt(((_a2 = pmd.innerText.match(/学习习惯成绩（(\d+)分）/)) == null ? void 0 : _a2[1]) || "0");
                    $modal("alert", {
                      content: `\u5F53\u524D\u8BFE\u7A0B\u4E60\u60EF\u5206\u5360\u6BD4\u4E3A${num}\u5206\uFF0C` + (num ? `\u9700\u8981\u89C4\u5F8B\u5B66\u4E60${num}\u5929, \u6BCF\u5929\u5B9A\u65F6\u89C2\u770B\u534A\u5C0F\u65F6\u5373\u53EF\u3002\uFF08\u5982\u679C\u4E0D\u60F3\u62FF\u4E60\u60EF\u5206\u53EF\u4EE5\u5FFD\u7565\uFF09` : "\u53EF\u4E00\u76F4\u89C2\u770B\u5B66\u4E60\uFF0C\u65E0\u9700\u5B9A\u65F6\u505C\u6B62\u3002")
                    });
                  } else {
                    $modal("alert", { content: "\u68C0\u6D4B\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u5728\u89C6\u9891\u5B66\u4E60\u9875\u9762\u4F7F\u7528\u6B64\u6309\u94AE\u3002" });
                  }
                }, 100);
              };
            }),
            $creator.button("\u{1F4D8}\u67E5\u770B\u5B66\u4E60\u8BB0\u5F55", {}, (btn) => {
              btn.onclick = () => {
                $modal("alert", {
                  title: "\u5B66\u4E60\u8BB0\u5F55",
                  content: $creator.notes(
                    this.cfg.studyRecord.map((r) => {
                      const date = new Date(r.date);
                      return [
                        `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`,
                        $creator.notes(r.courses.map((course) => `${course.name} - ${optimizeSecond(course.time)}`))
                      ];
                    })
                  )
                });
              };
            })
          );
        },
        onactive() {
          this.cfg.stopTime = "0";
          if (this.cfg.playbackRate) {
            this.cfg.playbackRate = parseFloat(this.cfg.playbackRate.toString());
          }
        },
        async oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
          setTimeout(() => {
            if ($$el(".clearfix.video").length === 0) {
              finish();
            }
          }, 10 * 1e3);
          const waitForVideoList = () => {
            return new Promise((resolve, reject) => {
              if ($$el(".clearfix.video").length > 1) {
                resolve();
              } else {
                setTimeout(() => {
                  resolve(waitForVideoList());
                }, 1e3);
              }
            });
          };
          await waitForVideoList();
          const remotePage = await RemotePlaywright.getCurrentPage();
          if (!remotePage) {
            return $playwright.showError();
          }
          this.onConfigChange("stopTime", (stopTime) => {
            if (stopTime === "0") {
              $message("info", { content: "\u5B9A\u65F6\u505C\u6B62\u5DF2\u5173\u95ED" });
            } else {
              autoStop(stopTime);
            }
          });
          this.onConfigChange("volume", (curr) => {
            state$4.study.currentMedia && (state$4.study.currentMedia.volume = curr);
          });
          this.onConfigChange("playbackRate", (curr) => {
            if (typeof curr === "string") {
              this.cfg.playbackRate = parseFloat(curr);
            }
            switchPlaybackRate(remotePage, this.cfg.playbackRate);
          });
          this.onConfigChange("definition", (curr) => {
            switchLine(remotePage, curr);
          });
          const hideDialog = () => {
            $$el(".el-dialog__wrapper").forEach((dialog) => {
              dialog.remove();
            });
          };
          const closeTestDialog = async () => {
            var _a, _b;
            const tip = $el('[role="dialog"][aria-label="\u63D0\u793A"]');
            if ((_b = (_a = tip == null ? void 0 : tip.querySelector(".el-message-box__message")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.includes("\u672A\u505A\u7B54\u7684\u5F39\u9898\u4E0D\u80FD\u5173\u95ED")) {
              const close = tip.querySelector('[aria-label="Close"]');
              if (close) {
                await remotePage.click('[role="dialog"][aria-label="\u63D0\u793A"] [aria-label="Close"]');
                await $.sleep(1e3);
              }
            }
            const items = $$el("#playTopic-dialog .topic .el-pager .number");
            if (items.length) {
              for (const item of items) {
                if (item.classList.contains("active") === false) {
                  item.click();
                  await $.sleep(500);
                }
                const options = $$el("#playTopic-dialog ul .topic-item");
                if (options.length !== 0) {
                  await waitForCaptcha();
                  CommonProject.scripts.render.methods.moveToEdge();
                  await $.sleep(1e3);
                  const answered = await answerPopupWithAI($el("#playTopic-dialog .topic"), options, (option) => remotePage.click(option));
                  if (!answered) {
                    $message("warn", { content: "AI 未完成视频弹题，请手动处理后刷新页面恢复自动学习。", duration: 0 });
                    return;
                  }
                  await $.sleep(1e3);
                }
              }
              await $.sleep(1e3);
              await remotePage.click("#playTopic-dialog .dialog-footer .btn");
            }
            await $.sleep(3e3);
            await closeTestDialog();
          };
          const finish = () => {
            $modal("alert", {
              content: "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002"
            });
          };
          const recordStudyTimeLoop = () => {
            var _a;
            this.methods.increaseStudyTime(((_a = $el(".source-name")) == null ? void 0 : _a.innerText) || "\u65E0\u540D\u79F0", this.cfg.playbackRate);
            setTimeout(recordStudyTimeLoop, 1e3);
          };
          const findVideoItem = (opts) => {
            let videoItems = Array.from(document.querySelectorAll(".clearfix.video"));
            if (!this.cfg.restudy) {
              videoItems = videoItems.filter((el2) => el2.querySelector(".time_icofinish") === null);
            }
            for (let i = 0; i < videoItems.length; i++) {
              const item = videoItems[i];
              if (item.classList.contains("current_play")) {
                return videoItems[i + (opts.next ? 1 : 0)];
              }
            }
            return videoItems[0];
          };
          closeDialogRead();
          recordStudyTimeLoop();
          hideDialog();
          autoStop(this.cfg.stopTime);
          closeTestDialog();
          setInterval(async () => {
            $$el(".v-modal,.mask").forEach((modal) => {
              modal.remove();
            });
            fixProcessBar();
          }, 3e3);
          $message("info", { content: "3\u79D2\u540E\u5F00\u59CB\u5B66\u4E60", duration: 3 });
          const study2 = async (opts) => {
            if (state$4.study.stop === false) {
              const item = findVideoItem(opts);
              if (item) {
                await $.sleep(3e3);
                CommonProject.scripts.render.methods.moveToEdge();
                await remotePage.click(item);
                watch(
                  remotePage,
                  { volume: this.cfg.volume, playbackRate: this.cfg.playbackRate, definition: this.cfg.definition },
                  ({ next: next2 }) => study2({ next: next2 })
                );
              } else {
                finish();
              }
            } else {
              $message("warn", {
                content: "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002"
              });
              CommonProject.scripts.settings.methods.notificationBySetting(
                "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002",
                { duration: 0, extraTitle: "\u77E5\u9053\u667A\u6167\u6811\u5B66\u4E60\u811A\u672C" }
              );
            }
          };
          study2({ next: false });
        }
      }),
      "gxk-work": new Script({
        name: "\u5171\u4EAB\u8BFE \u00B7 \u4F5C\u4E1A\u8003\u8BD5",
        url: [
          ["\u5171\u4EAB\u8BFE\u4F5C\u4E1A\u9875\u9762", "zhihuishu.com/stuExamWeb.html#/webExamList/dohomework"],
          ["\u5171\u4EAB\u8BFE\u8003\u8BD5\u9875\u9762", "zhihuishu.com/stuExamWeb.html#/webExamList/doexamination"],
          ["\u4F5C\u4E1A\u8003\u8BD5\u5217\u8868", "zhihuishu.com/stuExamWeb.html#/webExamList\\?"]
        ],
        namespace: "zhs.gxk.work",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u{1F4E2} \u5982\u679C\u672A\u5F00\u59CB\u7B54\u9898\uFF0C\u8BF7\u5C1D\u8BD5\u5237\u65B0\u9875\u9762\u3002",
              "自动答题前请在「通用 → AI 接口与聊天」配置 AI 接口。",
              "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002"
            ]).outerHTML
          }
        },
        methods() {
          async function getWorkInfo(remotePage) {
            const isExam2 = location.href.includes("doexamination");
            let url = "";
            if (isExam2) {
              url = "/taurusExam/gateway/t/v1/student/doExam";
            } else {
              url = "/studentExam/gateway/t/v1/student/doHomework";
            }
            return JSON.parse((await remotePage.waitForResponse(url)).body);
          }
          return {
            getWorkInfo,
            work: async () => {
              const remotePage = await RemotePlaywright.getCurrentPage();
              if (!remotePage) {
                return $playwright.showError();
              }
              const isExam2 = location.href.includes("doexamination");
              const isWork2 = location.href.includes("dohomework");
              if (isExam2 || isWork2) {
                const workInfo = await getWorkInfo(remotePage);
                setTimeout(() => {
                  $message("info", { content: `\u5F00\u59CB${isExam2 ? "\u8003\u8BD5" : "\u4F5C\u4E1A"}` });
                  commonWork(this, {
                    workerProvider: (opts) => gxkWorkAndExam(workInfo, opts)
                  });
                }, 1e3);
              } else {
                $message("info", { content: "\u{1F4E2} \u8BF7\u624B\u52A8\u8FDB\u5165\u4F5C\u4E1A/\u8003\u8BD5\uFF0C\u5982\u679C\u672A\u5F00\u59CB\u7B54\u9898\uFF0C\u8BF7\u5C1D\u8BD5\u5237\u65B0\u9875\u9762\u3002", duration: 0 });
                CommonProject.scripts.render.methods.pin(this);
              }
            }
          };
        },
        async onactive() {
          this.methods.work();
          this.on("historychange", () => {
            this.methods.work();
          });
        }
      }),
      "xnk-study": new Script({
        name: "\u6821\u5185\u8BFE \u00B7 \u5B66\u4E60",
        url: [["\u6821\u5185\u8BFE\u5B66\u4E60\u9875\u9762", "zhihuishu.com/aidedteaching/sourceLearning"]],
        namespace: "zhs.xnk.study",
        configs: {
          notes: {
            defaultValue: $creator.notes(["\u7AE0\u8282\u6D4B\u8BD5\u8BF7\u5927\u5BB6\u89C2\u770B\u5B8C\u89C6\u9891\u540E\u624B\u52A8\u6253\u5F00\u3002", "\u6B64\u8BFE\u7A0B\u4E0D\u80FD\u4F7F\u7528\u500D\u901F\u3002"]).outerHTML
          },
          restudy,
          volume
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
          const finish = () => {
            $modal("alert", {
              content: "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002"
            });
            CommonProject.scripts.settings.methods.notificationBySetting(
              "\u68C0\u6D4B\u5230\u5F53\u524D\u89C6\u9891\u5168\u90E8\u64AD\u653E\u5B8C\u6BD5\uFF0C\u5982\u679C\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u89C6\u9891\u8BF7\u5237\u65B0\u91CD\u8BD5\uFF0C\u6216\u8005\u6253\u5F00\u590D\u4E60\u6A21\u5F0F\u3002",
              { duration: 0, extraTitle: "\u77E5\u9053\u667A\u6167\u6811\u5B66\u4E60\u811A\u672C" }
            );
          };
          this.onConfigChange("volume", (curr) => {
            state$4.study.currentMedia && (state$4.study.currentMedia.volume = curr);
          });
          const nextElement = () => {
            const list = document.querySelectorAll(".file-item");
            let passActive = false;
            for (let index = 0; index < list.length; index++) {
              const item = list[index];
              const finish2 = !!item.querySelector(".icon-finish");
              const needsStudy = !finish2 || finish2 && this.cfg.restudy;
              if (item.classList.contains("active")) {
                if (needsStudy) {
                  return item;
                } else {
                  passActive = true;
                }
              }
              if (passActive && needsStudy) {
                return item;
              }
            }
          };
          const interval = setInterval(async () => {
            const next2 = nextElement();
            if (next2) {
              clearInterval(interval);
              if (document.querySelector("#mediaPlayer")) {
                watchXnk({ volume: this.cfg.volume }, () => {
                  setTimeout(() => {
                    const next22 = nextElement();
                    if (next22)
                      next22.click();
                  }, 3e3);
                });
              } else {
                setTimeout(() => {
                  $console.log("\u4E0D\u662F\u89C6\u9891\u4EFB\u52A1\uFF0C\u5373\u5C06\u5207\u6362\u4E0B\u4E00\u7AE0\u3002");
                  const next22 = nextElement();
                  if (next22)
                    next22.click();
                }, 3e3);
              }
            }
          }, 1e3);
          setTimeout(() => {
            if (!nextElement()) {
              finish();
              clearInterval(interval);
            }
          }, 10 * 1e3);
        }
      }),
      "xnk-work": new Script({
        name: "\u6821\u5185\u8BFE \u00B7 \u4F5C\u4E1A\u8003\u8BD5",
        url: [
          ["\u6821\u5185\u8BFE\u4F5C\u4E1A\u9875\u9762", "zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList"],
          ["\u6821\u5185\u8BFE\u8003\u8BD5\u9875\u9762", "zhihuishu.com/atHomeworkExam/stu/examQ/examexercise"]
        ],
        namespace: "zhs.xnk.work",
        configs: { notes: workNotes },
        async oncomplete() {
          commonWork(this, {
            workerProvider: xnkWork
          });
        }
      })
    }
  });
  async function watch(remotePage, options, onended) {
    await waitForMedia();
    const set = async () => {
      await switchLine(remotePage, options.definition);
      await $.sleep(1e3);
      await switchPlaybackRate(remotePage, options.playbackRate);
      const video2 = await waitForMedia();
      state$4.study.currentMedia = video2;
      if (video2) {
        video2.currentTime = 1;
        video2.volume = options.volume;
      }
      return video2;
    };
    const video = await set();
    const videoCheckInterval = setInterval(async () => {
      if ((video == null ? void 0 : video.isConnected) === false) {
        clearInterval(videoCheckInterval);
        $message("info", { content: "\u68C0\u6D4B\u5230\u89C6\u9891\u5207\u6362\u4E2D..." });
        onended({ next: false });
      }
    }, 3e3);
    playMedia(() => video == null ? void 0 : video.play());
    video.onpause = async () => {
      if (!(video == null ? void 0 : video.ended) && state$4.study.stop === false) {
        await waitForCaptcha();
        await $.sleep(1e3);
        video == null ? void 0 : video.play();
      }
    };
    video.onended = () => {
      clearInterval(videoCheckInterval);
      onended({ next: true });
    };
  }
  async function watchXnk(options, onended) {
    const media = await waitForMedia();
    media.volume = options.volume;
    media.currentTime = 1;
    state$4.study.currentMedia = media;
    playMedia(() => media == null ? void 0 : media.play());
    media.onpause = async () => {
      if (!(media == null ? void 0 : media.ended)) {
        await $.sleep(1e3);
        media == null ? void 0 : media.play();
      }
    };
    media.onended = () => {
      onended();
    };
  }
  async function switchLine(remotePage, definition2 = "line1bq") {
    const controlsBar = $el(".controlsBar");
    const dl = $el(".definiLines");
    if (controlsBar && dl) {
      controlsBar.style.display = "block";
      dl.style.display = "block";
      await remotePage.click(`.definiLines .${definition2}`);
    }
  }
  async function switchPlaybackRate(remotePage, playbackRate2) {
    const controlsBar = $el(".controlsBar");
    const sl = $el(".speedList");
    if (controlsBar && sl) {
      controlsBar.style.display = "block";
      sl.style.display = "block";
      await remotePage.click(`.speedList [rate="${playbackRate2 === 1 ? "1.0" : playbackRate2}"]`);
    }
  }
  function checkForCaptcha(update) {
    let modal;
    let notified = false;
    return setInterval(() => {
      if ($el(".yidun_popup")) {
        update(true);
        if (modal === void 0) {
          modal = $modal("alert", { content: "\u5F53\u524D\u68C0\u6D4B\u5230\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u8F93\u5165\u540E\u65B9\u53EF\u7EE7\u7EED\u8FD0\u884C\u3002" });
        }
        if (!notified) {
          notified = true;
          CommonProject.scripts.settings.methods.notificationBySetting(
            "\u667A\u6167\u6811\u811A\u672C\uFF1A\u5F53\u524D\u68C0\u6D4B\u5230\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u8F93\u5165\u540E\u65B9\u53EF\u7EE7\u7EED\u8FD0\u884C\u3002",
            { duration: 0 }
          );
        }
      } else {
        if (modal) {
          update(false);
          modal.remove();
          modal = void 0;
        }
      }
    }, 1e3);
  }
  function waitForCaptcha() {
    const popup = getPopupCaptcha();
    if (popup) {
      $message("warn", { content: "\u5F53\u524D\u68C0\u6D4B\u5230\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u8F93\u5165\u540E\u65B9\u53EF\u7EE7\u7EED\u8FD0\u884C\u3002" });
      CommonProject.scripts.settings.methods.notificationBySetting(
        "\u667A\u6167\u6811\u811A\u672C\uFF1A\u5F53\u524D\u68C0\u6D4B\u5230\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u8F93\u5165\u540E\u65B9\u53EF\u7EE7\u7EED\u8FD0\u884C\u3002",
        { duration: 0 }
      );
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const popup2 = getPopupCaptcha();
          if (popup2 === null) {
            clearInterval(interval);
            resolve();
          }
        }, 1e3);
      });
    }
  }
  function getPopupCaptcha() {
    return document.querySelector(".yidun_popup");
  }
  function gxkWorkAndExam(workInfo, {
    period,
    thread,
    stopSecondWhenFinish,
    redundanceWordsText,
    answerSeparators,
    answerMatchMode
  }) {
    var _a, _b, _c;
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "zhs-gxk"
    });
    const allExamParts = ((_c = ((_b = (_a = workInfo == null ? void 0 : workInfo.rt) == null ? void 0 : _a.examBase) == null ? void 0 : _b.workExamParts) || []) == null ? void 0 : _c.map((p) => p.questionDtos).flat()) || [];
    const titleTransform = (_, index) => {
      var _a2;
      const div = el("div");
      div.innerHTML = ((_a2 = allExamParts[index]) == null ? void 0 : _a2.name) || "\u9898\u76EE\u8BFB\u53D6\u5931\u8D25";
      return removeRedundantWords(optimizationElementWithImage(div).innerText || "", redundanceWordsText.split("\n"));
    };
    let request_index = 0;
    const worker = new OCSWorker({
      root: ".examPaper_subject",
      elements: {
        title: ".subject_describe > div,.smallStem_describe > div:nth-child(2)",
        options: (root2) => $$el(".subject_node .nodeLab", root2).map((t2) => {
          for (const img of Array.from(t2.querySelectorAll(".node_detail img"))) {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            createUnVisibleTextOfImage(img);
          }
          return t2;
        })
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerMatchMode,
      answerer: async (elements, ctx) => {
        const title = titleTransform(void 0, request_index++);
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
          var _a2, _b2, _c2, _d;
          const type = (_d = (_c2 = (_b2 = (_a2 = ctx.elements.title[0].parentElement) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b2.querySelector(".subject_type")) == null ? void 0 : _c2.textContent) == null ? void 0 : _d.trim();
          if (type == null ? void 0 : type.includes("\u5355\u9009\u9898")) {
            return "single";
          } else if (type == null ? void 0 : type.includes("\u591A\u9009\u9898")) {
            return "multiple";
          } else if (type == null ? void 0 : type.includes("\u5224\u65AD\u9898")) {
            return "judgement";
          } else if (type == null ? void 0 : type.includes("\u586B\u7A7A\u9898")) {
            return "completion";
          } else {
            return void 0;
          }
        },
        async handler(type, answer, option) {
          var _a2;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (!((_a2 = option.querySelector("input")) == null ? void 0 : _a2.checked)) {
              option.click();
              await $.sleep(200);
            }
          } else if (type === "completion" && answer.trim()) {
            const text = option.querySelector("textarea");
            if (text) {
              text.value = answer;
              await $.sleep(200);
            }
          }
        }
      },
      onResultsUpdate(curr, index, res) {
        var _a2, _b2;
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
        CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
      }
    });
    checkForCaptcha((hasCaptcha) => {
      if (hasCaptcha) {
        worker.emit("stop");
      } else {
        worker.emit("continuate");
      }
    });
    worker.doWork().then(async (res) => {
      var _a2;
      if (worker.isClose === true) {
        return;
      }
      $message("success", { content: `\u7B54\u9898\u5B8C\u6210\uFF0C\u5C06\u7B49\u5F85 ${stopSecondWhenFinish} \u79D2\u540E\u8FDB\u884C\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002` });
      await $.sleep(stopSecondWhenFinish * 1e3);
      if (worker.isClose === true) {
        return;
      }
      for (let index = 0; index < worker.totalQuestionCount; index++) {
        if (worker.isClose === true) {
          return;
        }
        const modal = $modal("alert", {
          content: "\u6B63\u5728\u4FDD\u5B58\u9898\u76EE\u4E2D\uFF08\u5FC5\u987B\u4FDD\u5B58\uFF0C\u5426\u5219\u586B\u5199\u7684\u7B54\u6848\u65E0\u6548\uFF09\uFF0C<br>\u8BF7\u52FF\u64CD\u4F5C...",
          confirmButton: null
        });
        await waitForCaptcha();
        await $.sleep(2e3);
        (_a2 = document.querySelectorAll(".answerCard_list ul li").item(index)) == null ? void 0 : _a2.click();
        await $.sleep(200);
        const next2 = $el("div.examPaper_box > div.switch-btn-box > button:nth-child(2)");
        if (next2) {
          next2.click();
        } else {
          $console.error("\u672A\u627E\u5230\u4E0B\u4E00\u9875\u6309\u94AE\u3002");
        }
        modal == null ? void 0 : modal.remove();
      }
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      $message("error", { content: "\u7B54\u9898\u7A0B\u5E8F\u53D1\u751F\u9519\u8BEF : " + err.message, duration: 0 });
    });
    return worker;
  }
  function xnkWork({ period, thread, answerSeparators, answerMatchMode }) {
    $message("info", { content: "\u5F00\u59CB\u4F5C\u4E1A" });
    CommonProject.scripts.workResults.methods.init();
    const titleTransform = (titles) => {
      return titles.filter((t2) => t2 == null ? void 0 : t2.innerText).map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").join(",");
    };
    const workResults = [];
    let totalQuestionCount = 0;
    let requestedCount = 0;
    let resolvedCount = 0;
    const worker = new OCSWorker({
      root: ".questionBox",
      elements: {
        title: ".questionContent",
        options: ".optionUl label",
        questionTit: ".questionTit"
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
        async handler(type, answer, option, ctx) {
          var _a;
          if (type === "judgement" || type === "single" || type === "multiple") {
            if (((_a = option.querySelector("input")) == null ? void 0 : _a.checked) === false) {
              option.click();
              await $.sleep(200);
            }
          } else if (type === "completion" && answer.trim()) {
            const text = option.querySelector("textarea");
            if (text) {
              text.value = answer;
              await $.sleep(200);
            }
          }
        }
      },
      onResultsUpdate(current, _, res) {
        var _a;
        if (current.result) {
          workResults.push(...simplifyWorkResult([current], titleTransform));
          CommonProject.scripts.workResults.methods.setResults(workResults);
          totalQuestionCount++;
          requestedCount++;
          resolvedCount++;
        }
        CommonProject.scripts.workResults.methods.updateWorkState({
          totalQuestionCount,
          requestedCount,
          resolvedCount
        });
      }
    });
    const getBtn = () => document.querySelector("span.Topicswitchingbtn:nth-child(2)");
    let next2 = getBtn();
    (async () => {
      while (next2 && worker.isClose === false) {
        await worker.doWork();
        await $.sleep(1e3);
        next2 = getBtn();
        next2 == null ? void 0 : next2.click();
        await $.sleep(1e3);
      }
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
      CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = "zhs-xnk";
    })();
    return worker;
  }
  function optimizeSecond(second) {
    if (second > 3600) {
      return `${Math.floor(second / 3600)}\u5C0F\u65F6${Math.floor(second % 3600 / 60)}\u5206\u949F`;
    } else if (second > 60) {
      return `${Math.floor(second / 60)}\u5206\u949F${second % 60}\u79D2`;
    } else {
      return `${second}\u79D2`;
    }
  }
  function autoStop(stopTime) {
    var _a, _b;
    clearInterval(state$4.study.stopInterval);
    (_a = state$4.study.stopMessage) == null ? void 0 : _a.remove();
    if (stopTime !== "0") {
      let stopCount = parseFloat(stopTime) * 60 * 60;
      state$4.study.stopInterval = setInterval(() => {
        var _a2;
        if (stopCount > 0) {
          if (getPopupCaptcha() === null) {
            stopCount--;
          }
        } else {
          clearInterval(state$4.study.stopInterval);
          state$4.study.stop = true;
          (_a2 = $el("video")) == null ? void 0 : _a2.pause();
          $modal("alert", { content: "\u811A\u672C\u6682\u505C\uFF0C\u5DF2\u83B7\u5F97\u4ECA\u65E5\u5E73\u65F6\u5206\uFF0C\u5982\u9700\u7EE7\u7EED\u89C2\u770B\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u3002" });
        }
      }, 1e3);
      const val = ((_b = ZHSProject.scripts["gxk-study"].configs.stopTime.options.find((t2) => t2[0] === stopTime)) == null ? void 0 : _b[0]) || "0";
      const date = new Date();
      date.setMinutes(date.getMinutes() + parseFloat(val) * 60);
      state$4.study.stopMessage = $message("info", {
        duration: 0,
        content: `\u5728 ${date.toLocaleTimeString()} \u811A\u672C\u5C06\u81EA\u52A8\u6682\u505C`
      });
    }
  }
  function fixProcessBar() {
    const bar = document.querySelector(".controlsBar");
    if (bar) {
      bar.style.display = "block";
    }
  }
  function closeDialogRead() {
    const div = document.querySelector(".dialog-read");
    if (div) {
      div.style.display = "none";
    }
  }
