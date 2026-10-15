  const CommonProject = Project.create({
    name: "\u901A\u7528",
    domains: [],
    scripts: {
      guide: new Script({
        name: "\u811A\u672C\u9996\u9875",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.guide",
        onrender({ panel: panel2 }) {
          const guide = createGuide();
          const aiSettings = el("button", { className: "base-style-button" }, "设置我的 AI 接口");
          aiSettings.onclick = () => CommonProject.scripts.render.methods.pin(CommonProject.scripts.ai);
          guide.style.width = "480px";
          panel2.body.replaceChildren(el("div", { className: "card" }, [aiSettings]), guide);
        }
      }),
      ai: new Script({
        name: "AI 接口与聊天",
        url: [["所有页面", /.*/]],
        namespace: "common.ai",
        configs: {
          notes: {
            defaultValue: "填写你的 OpenAI 兼容接口与模型。设置自动保存在本机油猴存储中，聊天记录仅保留在当前页面。API Key 可以留空，用于无需鉴权的本地服务。",
            extra: { appConfigSync: false }
          },
          baseUrl: {
            label: "API 地址",
            defaultValue: "https://api.openai.com/v1",
            attrs: { type: "url", placeholder: "https://服务商域名/v1", title: "支持基础地址、/v1 地址或完整的 /chat/completions 地址", style: { width: "280px" } },
            extra: { appConfigSync: false }
          },
          apiKey: {
            label: "API Key",
            defaultValue: "",
            attrs: { type: "password", autocomplete: "off", placeholder: "你的 API Key（本地服务可留空）", style: { width: "280px" } },
            extra: { appConfigSync: false }
          },
          model: {
            label: "模型名称",
            defaultValue: "",
            attrs: { type: "text", placeholder: "填写服务商提供的准确模型 ID", style: { width: "280px" } },
            extra: { appConfigSync: false }
          },
          timeout: {
            label: "请求超时（秒）",
            defaultValue: 60,
            attrs: { type: "number", min: "5", max: "300", step: "5" },
            extra: { appConfigSync: false }
          },
          systemPrompt: {
            label: "聊天系统提示词",
            tag: "textarea",
            defaultValue: "你是一位耐心的学习助手，请用中文清晰地回答问题。",
            attrs: { style: { width: "280px", minHeight: "50px" } },
            extra: { appConfigSync: false }
          }
        },
        onrender({ panel: panel2 }) {
          this.aiHistory = this.aiHistory || [];
          const transcript = el("div", { className: "ai-transcript" });
          const input = el("textarea", {
            className: "ai-chat-input",
            placeholder: "输入问题；Ctrl / ⌘ + Enter 发送",
            ariaLabel: "AI 聊天消息",
            value: this.aiDraft || ""
          });
          const status = el("div", { className: "ai-status", ariaLive: "polite" });
          const send = el("button", { className: "base-style-button ai-send" }, "发送");
          const test = el("button", { className: "base-style-button-secondary" }, "测试连接");
          const clear = el("button", { className: "base-style-button-secondary" }, "清空对话");
          const badgeText = el("span", { className: "ai-badge-text" });
          const badgeModel = el("span", { className: "ai-model" });
          const badge = el("div", { className: "ai-badge" }, [el("span", { className: "dot" }), badgeText, badgeModel]);
          const updateBadge = () => {
            const ready = OpenAIClient.isConfigured();
            badge.dataset.ready = String(ready);
            badgeText.textContent = ready ? "接口已就绪" : "尚未配置：请在下方填写 API 地址与模型";
            badgeModel.textContent = ready ? OpenAIClient.settings().model : "";
            badgeModel.title = badgeModel.textContent;
          };
          const messageNode = (message) => {
            const isUser = message.role === "user";
            const body = el("div", { className: "ai-body" }, [el("div", { className: "ai-bubble", textContent: message.content })]);
            if (!isUser) {
              const copy = el("button", { className: "ai-copy", type: "button", title: "复制回答", ariaLabel: "复制回答" });
              copy.onclick = async () => {
                try {
                  await navigator.clipboard.writeText(message.content);
                  copy.classList.add("copied");
                  setTimeout(() => copy.classList.remove("copied"), 1400);
                } catch {
                }
              };
              body.append(copy);
            }
            return el("div", { className: "ai-msg " + (isUser ? "user" : "assistant") }, [body]);
          };
          const typingNode = () => el("div", { className: "ai-msg assistant ai-typing", ariaLabel: "AI 正在输入" }, [
            el("div", { className: "ai-body" }, [el("div", { className: "ai-bubble" }, [el("i"), el("i"), el("i")])])
          ]);
          const redraw = () => {
            const nodes = this.aiHistory.map(messageNode);
            if (this.aiBusy && this.aiChatBusy) nodes.push(typingNode());
            transcript.replaceChildren(...nodes);
            status.textContent = this.aiStatus || "";
            status.dataset.state = this.aiError ? "error" : this.aiBusy ? "busy" : /^连接成功/.test(this.aiStatus || "") ? "ok" : "info";
            send.disabled = test.disabled = clear.disabled = input.disabled = !!this.aiBusy;
            send.classList.toggle("loading", !!(this.aiBusy && this.aiChatBusy));
            updateBadge();
            transcript.scrollTop = transcript.scrollHeight;
          };
          this.aiRedraw = redraw;
          input.oninput = () => this.aiDraft = input.value;
          const run = async (testOnly) => {
            if (this.aiBusy) return;
            const question = input.value.trim();
            if (!testOnly && !question) {
              this.aiStatus = "请先输入问题。";
              this.aiError = true;
              redraw();
              return;
            }
            this.aiBusy = true;
            this.aiChatBusy = !testOnly;
            this.aiError = false;
            this.aiStatus = testOnly ? "正在测试连接…" : "AI 正在回答…";
            this.aiRedraw();
            try {
              const cfg = OpenAIClient.settings();
              const messages = testOnly ? [{ role: "user", content: "请只回复 OK。" }] : this.aiHistory.slice(-20).concat({ role: "user", content: question });
              if (!testOnly && cfg.systemPrompt) messages.unshift({ role: "system", content: cfg.systemPrompt });
              const answer = await OpenAIClient.chat(messages, cfg);
              if (testOnly) {
                this.aiStatus = "连接成功：" + answer;
              } else {
                this.aiHistory.push({ role: "user", content: question }, { role: "assistant", content: answer });
                this.aiHistory = this.aiHistory.slice(-40);
                this.aiDraft = "";
                if (this.panel) this.panel.querySelectorAll(".ai-chat-input").forEach((field) => field.value = "");
                this.aiStatus = "";
              }
            } catch (error) {
              this.aiError = true;
              this.aiStatus = error.message;
            } finally {
              this.aiBusy = false;
              this.aiRedraw();
            }
          };
          send.onclick = () => run(false);
          test.onclick = () => run(true);
          clear.onclick = () => {
            this.aiHistory = [];
            this.aiStatus = "";
            this.aiError = false;
            redraw();
          };
          input.onkeydown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.isComposing) {
              openAIPreventDefault.call(event);
              run(false);
            }
          };
          panel2.body.replaceChildren(el("div", { className: "card ai-card" }, [
            badge,
            transcript,
            el("div", { className: "ai-composer" }, [
              input,
              el("div", { className: "ai-actions" }, [clear, test, el("span", { className: "ai-spacer" }), send])
            ]),
            status
          ]));
          panel2.addEventListener("change", updateBadge);
          redraw();
        }
      }),
      settings: new Script({
        name: "\u8BBE\u7F6E",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.settings",
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "搜题与自动答题统一使用你在「AI 接口与聊天」里配置的接口。",
              "\u4E0B\u9762\u53EA\u5217\u51FA\u4E09\u9879\u5E38\u7528\u8BBE\u7F6E\uFF0C\u5176\u4F59\u5728\u300C\u9AD8\u7EA7\u8BBE\u7F6E\u300D\u91CC\uFF0C\u70B9\u5F00\u5373\u53EF\u8C03\u6574\u3002"
            ]).outerHTML
          },
          period: {
            separator: "常用",
            label: "搜题间隔（秒）",
            defaultValue: 3,
            attrs: { type: "number", min: "0", max: "60" }
          },
          upload: {
            label: "答题后操作",
            tag: "select",
            defaultValue: "nomove",
            options: [["nomove", "由我手动保存或提交"], ["save", "只保存"], ["100", "全部完成时提交"], ["force", "直接提交"]]
          },
          stopSecondWhenFinish: {
            label: "保存或提交前等待（秒）",
            defaultValue: 3,
            attrs: { type: "number", min: "0", max: "60" }
          },
          notification: {
            separator: "高级设置",
            collapsed: true,
            label: "\u7CFB\u7EDF\u901A\u77E5",
            attrs: {
              title: "\u5141\u8BB8\u811A\u672C\u53D1\u9001\u7CFB\u7EDF\u901A\u77E5\uFF0C\u53EA\u6709\u91CD\u8981\u4E8B\u60C5\u53D1\u751F\u65F6\u4F1A\u53D1\u9001\u7CFB\u7EDF\u901A\u77E5\uFF0C\u5C3D\u91CF\u907F\u514D\u7528\u6237\u53D7\u5230\u9A9A\u6270\uFF08\u5728\u7535\u8111\u5C4F\u5E55\u53F3\u4FA7\u663E\u793A\u901A\u77E5\u5F39\u7A97\uFF0C\u4F8B\u5982\u811A\u672C\u6267\u884C\u5B8C\u6BD5\uFF0C\u56FE\u5F62\u9A8C\u8BC1\u7801\uFF0C\u7248\u672C\u66F4\u65B0\u7B49\u901A\u77E5\uFF09\u3002"
            },
            tag: "select",
            defaultValue: "only-notify",
            options: [
              ["only-notify", "\u53EA\u663E\u793A\u53F3\u4E0B\u89D2\u901A\u77E5"],
              ["notify-and-voice", "\u901A\u77E5\u4EE5\u53CA\u63D0\u793A\u97F3\uFF08\u53EE\u7684\u4E00\u58F0\uFF09"],
              ["all", "\u901A\u77E5\uFF0C\u63D0\u793A\u97F3\uFF0C\u4EE5\u53CA\u4EFB\u52A1\u680F\u95EA\u70C1\u63D0\u793A"],
              ["no-notify", "\u5173\u95ED\u7CFB\u7EDF\u901A\u77E5"]
            ]
          },
          thread: {
            label: "搜题并发数",
            attrs: {
              type: "number",
              min: "1",
              max: "5",
              step: "1",
              title: "\u540C\u4E00\u65F6\u95F4\u5E76\u884C\u5904\u7406\u7684\u9898\u76EE\u6570\u91CF\uFF0C\u8C03\u5927\u53EF\u4EE5\u52A0\u5FEB\u641C\u9898\uFF0C\u4F46\u66F4\u5BB9\u6613\u89E6\u53D1\u63A5\u53E3\u9650\u6D41\u3002"
            },
            defaultValue: 1
          },
          answerSeparators: {
            label: "答案分隔符（逗号分隔）",
            defaultValue: "===,#,---,###,|,;,；"
          },
          redundanceWordsText: {
            label: "题干需移除的文字（每行一个）",
            tag: "textarea",
            defaultValue: ""
          },
          "work-when-no-job": {
            label: "对非任务点题目答题",
            defaultValue: false,
            attrs: { type: "checkbox" }
          },
          answerMatchMode: {
            label: "\u7B54\u6848\u5339\u914D\u6A21\u5F0F",
            tag: "select",
            defaultValue: "similar",
            options: [
              ["similar", "\u76F8\u4F3C\u5339\u914D", "\u7B54\u6848\u76F8\u4F3C\u5EA6\u8FBE\u523060%\u4EE5\u4E0A\u5C31\u5339\u914D"],
              ["exact", "\u7CBE\u786E\u5339\u914D", "\u7B54\u6848\u5FC5\u987B\u5B8C\u5168\u4E00\u81F4\u624D\u5339\u914D"]
            ]
          }
        },
        methods() {
          return {
            getWorkOptions: () => {
              return JSON.parse(JSON.stringify(this.cfg));
            },
            notificationBySetting: (content, opts) => {
              var _a;
              if (this.cfg.notification !== "no-notify") {
                $gm.notification(content, {
                  extraTitle: opts == null ? void 0 : opts.extraTitle,
                  duration: (_a = opts == null ? void 0 : opts.duration) != null ? _a : 30,
                  important: this.cfg.notification === "all",
                  silent: this.cfg.notification === "only-notify"
                });
              }
            }
          };
        },
        onrender({ panel: panel2 }) {
          const settings = el("button", { className: "base-style-button" }, "设置 AI 接口");
          settings.onclick = () => CommonProject.scripts.render.methods.pin(CommonProject.scripts.ai);
          panel2.body.replaceChildren(el("div", { className: "card" }, [
            el("div", "搜题与自动答题统一使用你配置的 AI 接口。"), settings
          ]));
        }
      }),
      workResults: new Script({
        name: "\u641C\u7D22\u7ED3\u679C",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.work-results",
        configs: {
          notes: {
            defaultValue: $creator.notes(["\u70B9\u51FB\u9898\u76EE\u5E8F\u53F7\uFF0C\u67E5\u770B\u641C\u7D22\u7ED3\u679C", "\u6BCF\u6B21\u81EA\u52A8\u7B54\u9898\u5F00\u59CB\u524D\uFF0C\u90FD\u4F1A\u6E05\u7A7A\u4E0A\u4E00\u6B21\u7684\u641C\u7D22\u7ED3\u679C\u3002"]).outerHTML
          },
          type: {
            label: "\u663E\u793A\u7C7B\u578B",
            tag: "select",
            options: [
              ["numbers", "\u5E8F\u53F7\u5217\u8868"],
              ["questions", "\u9898\u76EE\u5217\u8868"]
            ],
            attrs: {
              title: "\u4F7F\u7528\u9898\u76EE\u5217\u8868\u53EF\u80FD\u4F1A\u9020\u6210\u9875\u9762\u5361\u987F\u3002"
            },
            defaultValue: "numbers"
          },
          totalQuestionCount: {
            defaultValue: 0
          },
          requestedCount: {
            defaultValue: 0
          },
          resolvedCount: {
            defaultValue: 0
          },
          currentResultIndex: {
            defaultValue: 0
          },
          questionPositionSyncHandlerType: {
            defaultValue: void 0
          }
        },
        methods() {
          return {
            updateWorkStateByResults: (results) => {
              this.cfg.totalQuestionCount = results.length;
              this.cfg.requestedCount = results.filter((result) => result.requested).length;
              this.cfg.resolvedCount = results.filter((result) => result.resolved).length;
            },
            updateWorkState: (state2) => {
              this.cfg.totalQuestionCount = state2.totalQuestionCount;
              this.cfg.requestedCount = state2.requestedCount;
              this.cfg.resolvedCount = state2.resolvedCount;
            },
            refreshState: () => {
              this.cfg.totalQuestionCount = 0;
              this.cfg.requestedCount = 0;
              this.cfg.resolvedCount = 0;
            },
            clearResults: () => {
              return $store.setTab(TAB_WORK_RESULTS_KEY, []);
            },
            getResults() {
              return $store.getTab(TAB_WORK_RESULTS_KEY) || void 0;
            },
            setResults(results) {
              return $store.setTab(TAB_WORK_RESULTS_KEY, results);
            },
            init(opts) {
              CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = opts == null ? void 0 : opts.questionPositionSyncHandlerType;
              CommonProject.scripts.workResults.methods.refreshState();
              CommonProject.scripts.workResults.methods.clearResults();
            },
            createWorkResultsPanel: (mount) => {
              const container = mount || el("div");
              let scrollPercent = 0;
              const list = el("div");
              let mouseoverIndex = -1;
              list.onscroll = () => {
                scrollPercent = list.scrollTop / list.scrollHeight;
              };
              const setNumStyle = (result, num, index) => {
                var _a;
                if (result.requested) {
                  num.classList.add("requested");
                }
                if (index === this.cfg.currentResultIndex) {
                  num.classList.add("active");
                }
                if (result.finish) {
                  num.classList.add("finish");
                } else {
                  if (result.requested && result.resolved && (((_a = result.error) == null ? void 0 : _a.trim().length) !== 0 || result.searchInfos.length === 0 || result.finish === false)) {
                    num.classList.add("error");
                  }
                }
              };
              const render = debounce_1(async () => {
                const results = await CommonProject.scripts.workResults.methods.getResults();
                if (results == null ? void 0 : results.length) {
                  if (results[this.cfg.currentResultIndex] === void 0) {
                    this.cfg.currentResultIndex = 0;
                  }
                  if (this.cfg.type === "numbers") {
                    const resultContainer = el("div", {}, (res) => {
                      res.style.width = "400px";
                    });
                    list.style.width = "400px";
                    list.style.marginBottom = "12px";
                    list.style.overflow = "auto";
                    list.style.maxHeight = "200px";
                    const nums = results.map((result, index) => {
                      return el("span", { className: "search-infos-num", innerText: (index + 1).toString() }, (num) => {
                        setNumStyle(result, num, index);
                        num.onclick = () => {
                          var _a, _b;
                          for (const n of nums) {
                            n.classList.remove("active");
                          }
                          num.classList.add("active");
                          this.cfg.currentResultIndex = index;
                          resultContainer.replaceChildren(createResult(result));
                          if (this.cfg.questionPositionSyncHandlerType) {
                            (_b = (_a = state$5.workResult.questionPositionSyncHandler)[this.cfg.questionPositionSyncHandlerType]) == null ? void 0 : _b.call(
                              _a,
                              index
                            );
                          }
                        };
                      });
                    });
                    list.replaceChildren(...nums);
                    resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                    container.replaceChildren(list, resultContainer);
                  } else {
                    list.style.width = "400px";
                    list.style.overflow = "auto";
                    list.style.maxHeight = window.innerHeight / 2 + "px";
                    const resultContainer = el("div", { className: "work-result-question-container" });
                    const nums = [];
                    const questions = results.map((result, index) => {
                      const num = el(
                        "span",
                        {
                          className: "search-infos-num",
                          innerHTML: (index + 1).toString()
                        },
                        (num2) => {
                          num2.style.marginRight = "12px";
                          num2.style.display = "inline-block";
                          setNumStyle(result, num2, index);
                        }
                      );
                      nums.push(num);
                      return el(
                        "div",
                        [num, result.question],
                        (question) => {
                          question.onmouseover = () => {
                            mouseoverIndex = index;
                            resultContainer.replaceChildren(createResult(result));
                          };
                          question.onmouseleave = () => {
                            mouseoverIndex = -1;
                            resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                          };
                          question.onclick = () => {
                            var _a, _b;
                            for (const n of nums) {
                              n.classList.remove("active");
                            }
                            for (const q of questions) {
                              q.classList.remove("active");
                            }
                            nums[index].classList.add("active");
                            question.classList.add("active");
                            this.cfg.currentResultIndex = index;
                            resultContainer.replaceChildren(createResult(result));
                            if (this.cfg.questionPositionSyncHandlerType) {
                              (_b = (_a = state$5.workResult.questionPositionSyncHandler)[this.cfg.questionPositionSyncHandlerType]) == null ? void 0 : _b.call(
                                _a,
                                index
                              );
                            }
                          };
                        }
                      );
                    });
                    list.replaceChildren(...questions);
                    if (mouseoverIndex === -1) {
                      resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
                    } else {
                      resultContainer.replaceChildren(createResult(results[mouseoverIndex]));
                    }
                    container.replaceChildren(
                      el("div", [list, el("div", {}, [resultContainer])], (div) => {
                        div.style.display = "flex";
                      })
                    );
                  }
                } else {
                  container.replaceChildren(
                    el("div", "\u26A0\uFE0F\u6682\u65E0\u4EFB\u4F55\u641C\u7D22\u7ED3\u679C", (div) => {
                      div.style.textAlign = "center";
                    })
                  );
                }
                list.scrollTo({
                  top: scrollPercent * list.scrollHeight,
                  behavior: "auto"
                });
                const tip = el("div", [
                  el("div", { className: "search-infos-num" }, "1"),
                  "\u8868\u793A\u7B49\u5F85\u5904\u7406\u4E2D",
                  el("br"),
                  el("div", { className: "search-infos-num requested" }, "1"),
                  "\u8868\u793A\u5DF2\u5B8C\u6210\u641C\u7D22 ",
                  el("br"),
                  el("div", { className: "search-infos-num finish" }, "1"),
                  "\u8868\u793A\u5DF2\u641C\u7D22\u5DF2\u7B54\u9898 "
                ]);
                container.prepend(
                  el("hr"),
                  el(
                    "div",
                    [
                      $creator.space(
                        [
                          el("span", `\u5DF2\u641C\u9898: ${this.cfg.requestedCount}/${this.cfg.totalQuestionCount}`),
                          el("span", `\u5DF2\u7B54\u9898: ${this.cfg.resolvedCount}/${this.cfg.totalQuestionCount}`),
                          el("a", "\u63D0\u793A", (btn) => {
                            btn.style.cursor = "pointer";
                            btn.onclick = () => {
                              $modal("confirm", { content: tip, footer: void 0 });
                            };
                          })
                        ],
                        { separator: "|" }
                      )
                    ],
                    (div) => {
                      div.style.marginBottom = "12px";
                    }
                  ),
                  el("hr")
                );
              }, 100);
              const createResult = (result) => {
                if (result) {
                  const error = el("span", {}, (el2) => el2.style.color = "red");
                  if (result.requested === false && result.resolved === false) {
                    return el("div", [
                      result.question,
                      $creator.createQuestionTitleExtra(result.question),
                      el("hr"),
                      "\u5F53\u524D\u9898\u76EE\u8FD8\u672A\u5F00\u59CB\u641C\u7D22\uFF0C\u8BF7\u7A0D\u7B49\u3002"
                    ]);
                  } else {
                    if (result.error) {
                      error.innerText = result.error;
                      return el("div", [
                        result.question,
                        $creator.createQuestionTitleExtra(result.question),
                        el("hr"),
                        error
                      ]);
                    } else if (result.searchInfos.length === 0) {
                      error.innerText = "\u6B64\u9898\u672A\u641C\u7D22\u5230\u7B54\u6848";
                      return el("div", [
                        result.question,
                        $creator.createQuestionTitleExtra(result.question),
                        el("hr"),
                        error
                      ]);
                    } else {
                      error.innerText = "\u6B64\u9898\u672A\u5B8C\u6210, \u53EF\u80FD\u662F\u6CA1\u6709\u5339\u914D\u7684\u9009\u9879\u3002";
                      return el("div", [
                        ...result.finish ? [] : [result.resolved === false ? "\u6B63\u5728\u7B49\u5F85\u7B54\u9898\u4E2D\uFF0C\u8BF7\u7A0D\u7B49\u3002" : error],
                        el("search-infos-element", {
                          infos: result.searchInfos,
                          question: result.question
                        })
                      ]);
                    }
                  }
                } else {
                  return el("div", "棚子AI");
                }
              };
              render();
              this.onConfigChange("type", render);
              this.onConfigChange("requestedCount", render);
              this.onConfigChange("resolvedCount", render);
              $store.addChangeListener(TAB_WORK_RESULTS_KEY, render);
              return container;
            }
          };
        },
        onrender({ panel: panel2 }) {
          panel2.body.replaceChildren(this.methods.createWorkResultsPanel());
        }
      }),
      onlineSearch: new Script({
        name: "\u5728\u7EBF\u641C\u9898",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "common.online-search",
        configs: {
          notes: {
            defaultValue: "配置 AI 接口后，输入题目即可由 AI 解答。"
          },
          selectSearch: {
            label: "\u5212\u8BCD\u641C\u7D22",
            defaultValue: true,
            attrs: { type: "checkbox", title: "\u4F7F\u7528\u9F20\u6807\u6ED1\u52A8\u9009\u62E9\u9875\u9762\u4E2D\u7684\u9898\u76EE\u8FDB\u884C\u641C\u7D22\u3002" }
          },
          searchValue: {
            sync: true,
            label: "\u641C\u7D22\u9898\u76EE",
            tag: "textarea",
            attrs: {
              placeholder: "\u8F93\u5165\u9898\u76EE\uFF0C\u8BF7\u5C3D\u91CF\u4FDD\u8BC1\u9898\u76EE\u5B8C\u6574\uFF0C\u4E0D\u8981\u6F0F\u5B57",
              style: {
                minWidth: "300px",
                minHeight: "64px"
              }
            },
            defaultValue: ""
          }
        },
        oncomplete() {
          document.addEventListener(
            "selectionchange",
            debounce_1(() => {
              var _a;
              if (this.cfg.selectSearch) {
                const val = ((_a = document.getSelection()) == null ? void 0 : _a.toString()) || "";
                if (val) {
                  this.cfg.searchValue = val;
                }
              }
            }, 500)
          );
        },
        onrender({ panel: panel2 }) {
          const content = el("div", "", (content2) => {
            content2.style.marginBottom = "12px";
          });
          const search = async (value) => {
            if (!OpenAIClient.isConfigured()) {
              $modal("alert", { content: "请先在「通用 → AI 接口与聊天」配置 API 地址和模型名称。" });
              return;
            }
            content.replaceChildren(el("span", "\u641C\u7D22\u4E2D..."));
            if (value) {
              const t2 = Date.now();
              const infos = await searchQuestionAnswers({
                title: value
              });
              const resume = ((Date.now() - t2) / 1e3).toFixed(2);
              content.replaceChildren(
                el(
                  "div",
                  [
                    el("hr"),
                    el(
                      "div",
                      { style: { color: "#a1a1a1" } },
                      `\u641C\u7D22\u5230 ${infos.map((i) => i.results).flat().length} \u4E2A\u7ED3\u679C\uFF0C\u5171\u8017\u65F6 ${resume} \u79D2`
                    ),
                    el("search-infos-element", {
                      infos: infos.map((info) => ({
                        results: info.results.map((res) => [res.question, res.answer]),
                        homepage: info.homepage,
                        name: info.name,
                        error: info.error
                      })),
                      question: value
                    })
                  ],
                  (div) => {
                    div.classList.add("card");
                    div.style.width = "480px";
                  }
                )
              );
            } else {
              content.replaceChildren(el("span", "\u9898\u76EE\u4E0D\u80FD\u4E3A\u7A7A\uFF01"));
            }
          };
          const button = el("button", "\u641C\u7D22", (button2) => {
            button2.className = "base-style-button";
            button2.style.width = "120px";
            button2.onclick = () => {
              search(this.cfg.searchValue);
            };
          });
          const searchContainer = el("div", { style: { textAlign: "end" } }, [button]);
          panel2.body.append(el("div", [content, searchContainer]));
        }
      }),
      render: RenderScript,
      hack: new Script({
        name: "\u9875\u9762\u590D\u5236\u7C98\u8D34\u9650\u5236\u89E3\u9664",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        hideInPanel: true,
        onactive() {
          enableCopy([document, document.body]);
        },
        oncomplete() {
          enableCopy([document, document.body]);
          insertCopyableStyle();
          setTimeout(() => {
            enableCopy([document, document.body]);
            insertCopyableStyle();
          }, 3e3);
        }
      }),
      disableDialog: new Script({
        name: "\u7981\u6B62\u5F39\u7A97",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        hideInPanel: true,
        priority: 1,
        onstart() {
          function disableDialog(msg) {
            $modal("alert", {
              profile: "\u5F39\u7A97\u6765\u81EA\uFF1A" + location.origin,
              content: msg
            });
          }
          try {
            $gm.unsafeWindow.alert = disableDialog;
            window.alert = disableDialog;
          } catch (e) {
            console.error(e);
          }
        }
      }),
    }
  });

