  const $console = new Proxy({}, {
    get(target, key) {
      return (...msg) => {
        var _a;
        let logs = BackgroundProject.scripts.console.cfg.logs;
        if (logs.length > 50) {
          logs = logs.slice(-50);
        }
        const stack_str = Error().stack || "";
        const stacks = (_a = stack_str.replace("Error", "").match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/g)) == null ? void 0 : _a.map((s) => {
          const match = s.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/) || [];
          return [match[1], match[2], match[3]];
        });
        logs = logs.concat({
          type: key.toString(),
          content: msg.join(" "),
          time: Date.now(),
          stack: JSON.stringify([stack_str.split("\n")[0], ...stacks || []])
        });
        BackgroundProject.scripts.console.cfg.logs = logs;
      };
    }
  });
  function workPreCheckMessage(options) {
    const { onrun, onAIConfigMissing, onclose, ...opts } = options;
    if (!OpenAIClient.isConfigured()) {
      onAIConfigMissing == null ? void 0 : onAIConfigMissing(opts);
      return $message("warn", {
        content: "AI 接口尚未配置。请在「AI 聊天」填写 API 地址和模型名称。",
        duration: 0
      });
    } else {
      return $message("info", {
        duration: 5,
        content: el("span", [
          "5\u79D2\u540E\u81EA\u52A8\u7B54\u9898\uFF0C",
          $creator.preventText({
            name: "\u70B9\u51FB\u53D6\u6D88",
            delay: 5,
            ondefault: (span) => {
              onrun(opts);
            },
            onprevent(span) {
              const closedMessage = $message("warn", {
                content: "\u5DF2\u5173\u95ED\u6B64\u6B21\u7684\u81EA\u52A8\u7B54\u9898\uFF0C\u8BF7\u624B\u52A8\u5F00\u542F\u6216\u8005\u5FFD\u7565\u6B64\u8B66\u544A\u3002",
                duration: 0
              });
              if (closedMessage) {
                onclose == null ? void 0 : onclose(opts, closedMessage);
              }
            }
          })
        ])
      });
    }
  }
  function createRangeTooltip(input, defaultValue, transform) {
    input.addEventListener("change", () => {
      input.setAttribute("data-title", transform(input.value || input.getAttribute("value") || defaultValue));
    });
    input.setAttribute("data-title", transform(input.value || input.getAttribute("value") || defaultValue));
  }
  async function playMedia(playFunction) {
    const tryPlayMedia = () => {
      return new Promise((resolve, reject) => {
        try {
          const playRes = playFunction();
          if (playRes) {
            playRes.then(resolve).catch(reject);
          } else {
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    };
    try {
      await tryPlayMedia();
      return true;
    } catch (err) {
      console.error(err);
      if (String(err).includes(`failed because the user didn't interact with the document first`)) {
        $modal("alert", {
          content: "\u64AD\u653E\u97F3\u89C6\u9891\u5931\u8D25\uFF0C\u7531\u4E8E\u6D4F\u89C8\u5668\u7684\u7528\u6237\u9690\u79C1\u4FDD\u62A4\u63AA\u65BD\uFF0C\u5982\u679C\u8981\u64AD\u653E\u5E26\u6709\u97F3\u91CF\u7684\u89C6\u9891\uFF0C\u6216\u8005\u67D0\u4E9B\u65E0\u6CD5\u81EA\u52A8\u64AD\u653E\u97F3\u89C6\u9891\u7684\u7F51\u7AD9\uFF0C\u60A8\u5FC5\u987B\u5148\u70B9\u51FB\u4E00\u6B21\u9875\u9762\u4E0A\u7684\u4EFB\u610F\u4F4D\u7F6E\u811A\u672C\u624D\u80FD\u8FDB\u884C\u97F3\u89C6\u9891\u7684\u64AD\u653E\uFF0C\u540E\u7EED\u65E0\u9700\u91CD\u65B0\u70B9\u51FB\u3002",
          onClose: async () => {
            await tryPlayMedia();
          }
        });
        return true;
      } else if (String(err).includes("The element has no supported sources")) {
        $console.error("\u5F53\u524D\u89C6\u9891\u65E0\u6CD5\u64AD\u653E\u3002");
      } else {
        $console.error("\u64AD\u653E\u89C6\u9891\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF\uFF1A" + String(err));
      }
      return false;
    }
  }
  function insertCopyableStyle() {
    if (document.getElementById("ocs-copyable-style")) return;
    const style = el("style", { id: "ocs-copyable-style", textContent: "html, body, * { user-select: text !important; -webkit-user-select: text !important; }" });
    (document.head || document.documentElement).append(style);
  }
  function enableCopy(elements) {
    function hackSelect(target) {
      if (target) {
        const _original_select = target.onselectstart;
        const _original_oncopy = target.oncopy;
        const _original_onpaste = target.onpaste;
        const _original_onkeydown = target.onkeydown;
        target.onselectstart = (e) => {
          _original_select == null ? void 0 : _original_select.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
        target.oncopy = (e) => {
          _original_oncopy == null ? void 0 : _original_oncopy.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
        target.onpaste = (e) => {
          _original_onpaste == null ? void 0 : _original_onpaste.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
        target.onkeydown = (e) => {
          _original_onkeydown == null ? void 0 : _original_onkeydown.apply(target, [e]);
          e.stopPropagation();
          e.returnValue = true;
          return true;
        };
      }
    }
    for (const el2 of elements) {
      hackSelect(el2);
    }
  }
  const TAB_WORK_RESULTS_KEY = "common.work-results.results";

  const state$5 = {
    workResult: {
      questionPositionSyncHandler: {
        cx: (index) => {
          var _a;
          const el2 = (_a = document.querySelectorAll('[id*="sigleQuestionDiv"], .questionLi')) == null ? void 0 : _a.item(index);
          if (el2) {
            window.scrollTo({
              top: el2.getBoundingClientRect().top + window.pageYOffset - 50,
              behavior: "smooth"
            });
          }
        },
        "zhs-gxk": (index) => {
          var _a;
          (_a = document.querySelectorAll(".answerCard_list ul li").item(index)) == null ? void 0 : _a.click();
        },
        "zhs-xnk": (index) => {
          var _a;
          (_a = document.querySelectorAll(".jobclassallnumber-div li[questionid]").item(index)) == null ? void 0 : _a.click();
        },
        icve: (index) => {
          var _a;
          (_a = document.querySelectorAll(`.sheet_nums [id*="sheetSeq"]`).item(index)) == null ? void 0 : _a.click();
        },
        zjy: (index) => {
          var _a;
          (_a = document.querySelectorAll(".subjectDet").item(index)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        },
        icourse: (index) => {
          var _a;
          (_a = document.querySelectorAll(".u-questionItem").item(index)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };
