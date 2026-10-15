  const createGuide = () => {
    const showProjectDetails = (project) => {
      $modal("simple", {
        title: project.name,
        width: 800,
        content: el("div", [
          el("div", [
            "\u8FD0\u884C\u57DF\u540D\uFF1A",
            ...project.domains.map(
              (d) => el(
                "a",

                d
              )
            )
          ]),
          el("div", "\u811A\u672C\u5217\u8868\uFF1A"),
          el(
            "ul",
            Object.keys(project.scripts).sort((a, b) => project.scripts[b].hideInPanel ? -1 : 1).map((key) => {
              const script = project.scripts[key];
              return el(
                "li",
                [
                  el("b", script.name),
                  $creator.notes([
                    el("span", ["\u64CD\u4F5C\u9762\u677F\uFF1A", script.hideInPanel ? "\u9690\u85CF" : "\u663E\u793A"]),
                    [
                      "\u8FD0\u884C\u9875\u9762\uFF1A",
                      el(
                        "ul",
                        script.url.map(
                          (i) => el("li", [
                            i[0],
                            "\uFF1A",
                            i[1] instanceof RegExp ? i[1].toString().replace(/\\/g, "").slice(1, -1) : el("span", i[1])
                          ])
                        )
                      )
                    ]
                  ])
                ],
                (li) => {
                  li.style.marginBottom = "12px";
                }
              );
            }),
            (ul) => {
              ul.style.paddingLeft = "42px";
            }
          )
        ])
      });
    };
    return el("div", { className: "user-guide card" }, [
      el("div", { className: "separator", style: { padding: "12px 0px" } }, "\u2728 \u652F\u6301\u7684\u7F51\u8BFE\u5E73\u53F0"),
      el("div", [
        ...[CXProject, ZHSProject, ZJYProject, IcveMoocProject, ICourseProject].map((project) => {
          const btn = el("button", { className: "base-style-button-secondary", style: { margin: "4px" } }, [
            project.name
          ]);
          btn.onclick = () => {
            showProjectDetails(project);
          };
          return btn;
        })
      ]),
      el("div", { className: "separator", style: { padding: "12px 0px" } }, "\u{1F4D6} \u4F7F\u7528\u6559\u7A0B"),
      $creator.notes(
        [
          "\u6253\u5F00\u4EFB\u610F\u7F51\u8BFE\u5E73\u53F0\uFF0C\u7B49\u5F85\u811A\u672C\u52A0\u8F7D\uFF0C",
          "\u811A\u672C\u52A0\u8F7D\u540E\u67E5\u770B\u6BCF\u4E2A\u7F51\u8BFE\u4E0D\u540C\u7684\u4F7F\u7528\u63D0\u793A\u3002",
          "\u5982\u679C\u4E0D\u652F\u6301\u5F53\u524D\u7F51\u8BFE\uFF0C\u5219\u4E0D\u4F1A\u6709\u76F8\u5E94\u7684\u63D0\u793A\u4EE5\u53CA\u8BBE\u7F6E\u9762\u677F\u3002",
          [
            "\u6700\u540E\u6E29\u99A8\u63D0\u793A: ",
            "- \u7981\u6B62\u4E0E\u5176\u4ED6\u811A\u672C\u4E00\u8D77\u4F7F\u7528\uFF0C\u5426\u5219\u51FA\u73B0\u7B54\u6848\u9009\u4E0D\u4E0A\u6216\u8005\u9875\u9762\u5361\u6B7B\uFF0C\u65E0\u9650\u5237\u65B0\uFF0C\u7B49\u95EE\u9898\u4E00\u5F8B\u540E\u679C\u81EA\u8D1F\u3002",
            "- \u4EFB\u4F55\u7591\u95EE\u8BF7\u524D\u5F80\u5B98\u7F51\u67E5\u770B\u4EA4\u6D41\u7FA4\uFF0C\u8FDB\u5165\u4EA4\u6D41\u7FA4\u540E\u5E26\u622A\u56FE\u8FDB\u884C\u53CD\u9988\u3002",
            "- \u8BF7\u5C06\u6D4F\u89C8\u5668\u9875\u9762\u4FDD\u6301\u6700\u5927\u5316\uFF0C\u6216\u8005\u7F29\u5C0F\u7A97\u53E3\uFF0C\u4E0D\u80FD\u6700\u5C0F\u5316\uFF0C\u5426\u5219\u53EF\u80FD\u5BFC\u81F4\u811A\u672C\u5361\u6B7B\uFF01"
          ]
        ],
        "ol"
      )
    ]);
  };
  const playbackRate = {
    label: "\u89C6\u9891\u500D\u901F",
    tag: "select",
    options: [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 12, 16].map((rate) => [
      rate.toString(),
      rate + " x"
    ]),
    defaultValue: 1
  };
  const volume = {
    label: "\u97F3\u91CF\u8C03\u8282",
    attrs: { type: "range", step: "0.05", min: "0", max: "1" },
    defaultValue: 0,
    onload() {
      createRangeTooltip(this, "0", (val) => `${parseFloat(val) * 100}%`);
    }
  };
  const restudy = {
    label: "\u590D\u4E60\u6A21\u5F0F",
    attrs: { title: "\u5DF2\u7ECF\u5B8C\u6210\u7684\u89C6\u9891\u7EE7\u7EED\u5B66\u4E60", type: "checkbox" },
    defaultValue: false
  };
  const definition = {
    label: "\u6E05\u6670\u5EA6",
    tag: "select",
    defaultValue: "line1bq",
    options: [
      ["line1bq", "\u6D41\u7545"],
      ["line1gq", "\u9AD8\u6E05"]
    ]
  };
  const workNotes = {
    defaultValue: $creator.notes([
      "自动答题前请在「通用 → AI 接口与聊天」配置 AI 接口。",
      "\u53EF\u4EE5\u642D\u914D \u201C\u901A\u7528-\u5728\u7EBF\u641C\u9898\u201D \u4E00\u8D77\u4F7F\u7528\u3002"
    ]).outerHTML
  };
  function commonWork(script, options) {
    CommonProject.scripts.render.methods.pin(script);
    let worker;
    let startBtnPressed = false;
    let checkFailed = false;
    const createControls = () => {
      const { controlBtn, restartBtn, startBtn } = createWorkerControl({
        workerProvider: () => worker,
        onStart: async () => {
          startBtnPressed = true;
          checkMessage == null ? void 0 : checkMessage.remove();
          start2();
        },
        onRestart: async () => {
          var _a;
          worker == null ? void 0 : worker.emit("close");
          await ((_a = options.onRestart) == null ? void 0 : _a.call(options));
          start2();
        }
      });
      startBtn.style.flex = "1";
      startBtn.style.padding = "4px";
      restartBtn.style.flex = "1";
      restartBtn.style.padding = "4px";
      controlBtn.style.flex = "1";
      controlBtn.style.padding = "4px";
      const container = el(
        "div",
        { style: { marginTop: "12px", display: "flex" } },
        (worker == null ? void 0 : worker.isRunning) ? [controlBtn, restartBtn] : [startBtn]
      );
      return { container, startBtn, restartBtn, controlBtn };
    };
    const workResultPanel = () => CommonProject.scripts.workResults.methods.createWorkResultsPanel();
    script.on("render", () => {
      var _a, _b;
      let gotoSettingsBtnContainer = "";
      if (checkFailed) {
        const gotoSettingsBtn = $creator.button("前往设置 AI 接口", {
          className: "base-style-button",
          style: { flex: "1", padding: "4px" }
        });
        gotoSettingsBtn.style.flex = "1";
        gotoSettingsBtn.style.padding = "4px";
        gotoSettingsBtn.onclick = () => {
          CommonProject.scripts.render.methods.pin(CommonProject.scripts.ai);
        };
        gotoSettingsBtnContainer = el("div", { style: { display: "flex" } }, [gotoSettingsBtn]);
      }
      (_b = (_a = script.panel) == null ? void 0 : _a.body) == null ? void 0 : _b.replaceChildren(
        el("div", { style: { marginTop: "12px" } }, [
          gotoSettingsBtnContainer,
          createControls().container,
          workResultPanel()
        ])
      );
    });
    const workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
    let checkMessage = workPreCheckMessage({
      onrun: () => startBtnPressed === false && start2(),
      onclose: (_, closedMsg) => checkMessage = closedMsg,
      onAIConfigMissing: () => {
        checkFailed = true;
      },
      ...workOptions
    });
    const start2 = async () => {
      var _a, _b, _c, _d;
      await ((_a = options.beforeRunning) == null ? void 0 : _a.call(options));
      worker = options.workerProvider(workOptions);
      if (worker) {
        (_b = options.onWorkerCreated) == null ? void 0 : _b.call(options, worker);
      }
      const { container, controlBtn } = createControls();
      (_d = (_c = script.panel) == null ? void 0 : _c.body) == null ? void 0 : _d.replaceChildren(container, workResultPanel());
      worker == null ? void 0 : worker.once("done", () => {
        controlBtn.disabled = true;
      });
    };
  }
  function createWorkerControl(options) {
    let stop = false;
    let stopMessage;
    const startBtn = $creator.button("\u25B6\uFE0F\u5F00\u59CB\u7B54\u9898");
    const restartBtn = $creator.button("\u{1F503}\u91CD\u65B0\u7B54\u9898");
    const controlBtn = $creator.button("\u23F8\u6682\u505C");
    startBtn.onclick = () => {
      startBtn.remove();
      options.onStart();
    };
    restartBtn.onclick = () => {
      stopMessage == null ? void 0 : stopMessage.remove();
      options.onRestart();
    };
    controlBtn.onclick = () => {
      var _a;
      stop = !stop;
      const worker = options.workerProvider();
      (_a = worker == null ? void 0 : worker.emit) == null ? void 0 : _a.call(worker, stop ? "stop" : "continuate");
      controlBtn.value = stop ? "\u25B6\uFE0F\u7EE7\u7EED" : "\u23F8\uFE0F\u6682\u505C";
      if (stop) {
        stopMessage = $message("warn", { duration: 0, content: "\u6682\u505C\u4E2D..." });
      } else {
        stopMessage == null ? void 0 : stopMessage.remove();
      }
    };
    return { startBtn, restartBtn, controlBtn };
  }
  function optimizationElementWithImage(root2) {
    if (root2) {
      for (const img of Array.from(root2.querySelectorAll("img"))) {
        const src2 = document.createElement("span");
        src2.innerText = img.src;
        src2.style.fontSize = "0px";
        img.after(src2);
      }
    }
    return root2;
  }
  function createUnVisibleTextOfImage(img) {
    const src2 = document.createElement("span");
    src2.innerText = img.src;
    src2.style.fontSize = "0px";
    img.after(src2);
  }
  function simplifyWorkResult(results, titleTransform) {
    var _a, _b, _c, _d, _e;
    const res = [];
    let i = 0;
    for (const wr of results) {
      res.push({
        requested: wr.requested,
        resolved: wr.resolved,
        error: wr.error,
        question: (titleTransform == null ? void 0 : titleTransform(((_a = wr.ctx) == null ? void 0 : _a.elements.title) || [], i)) || ((_c = (_b = wr.ctx) == null ? void 0 : _b.elements.title) == null ? void 0 : _c.join(",")) || "",
        finish: (_d = wr.result) == null ? void 0 : _d.finish,
        searchInfos: ((_e = wr.ctx) == null ? void 0 : _e.searchInfos.map((sr) => ({
          error: sr.error,
          name: sr.name,
          homepage: sr.homepage,
          results: sr.results.map((ans) => [ans.question, ans.answer])
        }))) || []
      });
      i++;
    }
    return res;
  }
  function removeRedundantWords(str, words) {
    for (const word of words) {
      str = str.replace(word, "");
    }
    return str;
  }
  async function waitForMedia(options) {
    const res = await Promise.race([
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const video = ((options == null ? void 0 : options.root) || document).querySelector(
            `${(options == null ? void 0 : options.videoSelector) || "video"},${(options == null ? void 0 : options.audioSelector) || "audio"}`
          );
          if (video) {
            clearInterval(interval);
            resolve(video);
          }
        }, 1e3);
      }),
      $.sleep(3 * 60 * 1e3)
    ]);
    if (res) {
      return res;
    } else {
      throw new Error("\u89C6\u9891/\u97F3\u9891\u672A\u627E\u5230\uFF0C\u6216\u8005\u52A0\u8F7D\u8D85\u65F6\u3002");
    }
  }
  function waitForElement(selector) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const el2 = document.querySelector(selector);
        if (el2) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(el2);
        }
      }, 1e3);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        resolve(void 0);
      }, 10 * 1e3);
    });
  }
  const $playwright = {
    showError: () => {

      const errorEl = el("div", [
        "\u8F6F\u4EF6\u8F85\u52A9\u542F\u52A8\u5931\u8D25\uFF0C\u65E0\u6CD5\u6267\u884C\u811A\u672C\u64CD\u4F5C\uFF0C\u8BF7\u5F00\u542F\u8F6F\u4EF6\u8F85\u52A9\uFF0C\u70B9\u51FB\u94FE\u63A5\u67E5\u770B\u5F00\u542F\u6559\u7A0B => ",
        el("a", { href, target: "_blank" }, href)
      ]);
      $modal("alert", {
        maskCloseable: false,
        title: "\u26D4 \u9519\u8BEF",
        confirmButtonText: "\u6211\u5DF2\u77E5\u6653",
        content: errorEl.cloneNode(true)
      });
      $message("error", { content: errorEl.cloneNode(true), duration: 0 });
    }
  };
  const state$4 = {
    study: {
      stop: false,
      currentMedia: void 0,
      stopInterval: 0,
      stopMessage: void 0
    }
  };
