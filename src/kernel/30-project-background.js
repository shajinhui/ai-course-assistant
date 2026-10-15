  const BackgroundProject = Project.create({
    name: "\u540E\u53F0",
    domains: [],
    scripts: {
      console: new Script({
        name: "\u65E5\u5FD7",
        url: [["\u6240\u6709", /.*/]],
        namespace: "render.console",
        configs: {
          logs: {
            defaultValue: []
          }
        },
        onrender({ panel: panel2 }) {
          const getTypeDesc = (type) => type === "info" ? "\u4FE1\u606F" : type === "error" ? "\u9519\u8BEF" : type === "warn" ? "\u8B66\u544A" : type === "debug" ? "\u8C03\u8BD5" : "\u65E5\u5FD7";
          const createLog = (log) => {
            const date = new Date(log.time);
            const item = el(
              "div",
              {
                title: "\u53CC\u51FB\u590D\u5236\u65E5\u5FD7\u4FE1\u606F",
                className: "item"
              },
              [
                el(
                  "span",
                  { className: "time" },
                  `${date.getHours().toFixed(0).padStart(2, "0")}:${date.getMinutes().toFixed(0).padStart(2, "0")} `
                ),
                el("span", { className: log.type }, `[${getTypeDesc(log.type)}]`),
                el("span", ":" + log.content)
              ]
            );
            item.addEventListener("dblclick", () => {
              navigator.clipboard.writeText(
                Object.keys(log).map((k) => `${k}: ${log[k]}`).join("\n")
              );
            });
            return item;
          };
          const showLogs = () => {
            const div2 = el("div", { className: "card console" });
            const logs2 = this.cfg.logs.map((log) => createLog(log));
            if (logs2.length) {
              div2.replaceChildren(...logs2);
            } else {
              div2.replaceChildren(
                el("div", "\u6682\u65E0\u4EFB\u4F55\u65E5\u5FD7", (div3) => {
                  div3.style.textAlign = "center";
                })
              );
            }
            return { div: div2, logs: logs2 };
          };
          const isScrollBottom = (div2) => {
            const { scrollHeight, scrollTop, clientHeight } = div2;
            return scrollTop + clientHeight + 50 > scrollHeight;
          };
          const { div, logs } = showLogs();
          this.offConfigChange(state$6.console.listenerIds.logs);
          state$6.console.listenerIds.logs = this.onConfigChange("logs", (logs2) => {
            const log = createLog(logs2[logs2.length - 1]);
            div.append(log);
            setTimeout(() => {
              if (isScrollBottom(div)) {
                log.scrollIntoView();
              }
            }, 10);
          });
          const show = () => {
            panel2.body.replaceChildren(div);
            setTimeout(() => {
              var _a;
              (_a = logs[logs.length - 1]) == null ? void 0 : _a.scrollIntoView();
            }, 10);
          };
          show();
        }
      }),
      appConfigSync: new Script({
        name: "\u914D\u7F6E\u540C\u6B65",
        namespace: "background.app",
        url: [["\u6240\u6709\u9875\u9762", /./]],
        hideInPanel: $gm.getInfos() === void 0,
        configs: {
          notes: {

          },
          sync: {
            defaultValue: false
          },
          connected: {
            defaultValue: false
          },
          closeSync: {
            defaultValue: false,
            label: "\u5173\u95ED\u540C\u6B65",
            attrs: {
              type: "checkbox"
            }
          }
        },

        async onactive() {
          var _a;
          if ($.isInTopWindow() && this.cfg.closeSync === false) {
            this.cfg.sync = false;
            try {
              const res = await request("http://localhost:15319/browser", {
                type: "GM_xmlhttpRequest",
                method: "get",
                responseType: "json"
              });
              this.cfg.connected = true;
              if (res && Object.keys(res).length) {
                for (const key in res) {
                  if (Object.prototype.hasOwnProperty.call(res, key)) {
                    if (RenderScript.namespace && key.startsWith(RenderScript.namespace)) {
                      Reflect.deleteProperty(res, key);
                    }
                    for (const scriptKey in BackgroundProject.scripts) {
                      if (Object.prototype.hasOwnProperty.call(BackgroundProject.scripts, scriptKey)) {
                        const script = Reflect.get(BackgroundProject.scripts, scriptKey);
                        if (script.namespace && key.startsWith(script.namespace)) {
                          Reflect.deleteProperty(res, key);
                        }
                      }
                    }
                  }
                }
                for (const project of definedProjects()) {
                  for (const key in project.scripts) {
                    if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
                      const script = project.scripts[key];
                      for (const ck in script.configs) {
                        if (Object.prototype.hasOwnProperty.call(script.configs, ck)) {
                          if (((_a = script.configs[ck].extra) == null ? void 0 : _a.appConfigSync) === false) {
                            Reflect.deleteProperty(res, $.namespaceKey(script.namespace, ck));
                          }
                        }
                      }
                    }
                  }
                }
                for (const key in res) {
                  if (Object.prototype.hasOwnProperty.call(res, key)) {
                    $store.set(key, res[key]);
                  }
                }
                for (const project of definedProjects()) {
                  if (project.name === BackgroundProject.name) {
                    continue;
                  }
                  for (const key in project.scripts) {
                    if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
                      const script = project.scripts[key];
                      if (script.namespace === "common.ai") continue;
                      const originalRender = script.onrender;
                      script.onrender = ({ panel: panel2, header }) => {
                        var _a2, _b;
                        originalRender == null ? void 0 : originalRender({ panel: panel2, header });
                        if (panel2.configsContainer.children.length) {
                          panel2.configsContainer.classList.add("lock");
                          panel2.lockWrapper.style.width = ((_a2 = panel2.configsContainer.clientWidth) != null ? _a2 : panel2.clientWidth) + "px";
                          panel2.lockWrapper.style.height = ((_b = panel2.configsContainer.clientHeight) != null ? _b : panel2.clientHeight) + "px";
                          panel2.configsContainer.prepend(panel2.lockWrapper);
                          panel2.lockWrapper.title = "\u{1F6AB}\u5DF2\u540C\u6B65木金\u684C\u9762\u7248\u8F6F\u4EF6\u914D\u7F6E\uFF0C\u5982\u9700\u4FEE\u6539\u8BF7\u5728\u684C\u9762\u7248\u8F6F\u4EF6\u7684\u5DE6\u4FA7\u680F\u8BBE\u7F6E-\u901A\u7528\u8BBE\u7F6E-木金\u914D\u7F6E\uFF0C\u4E2D\u8FDB\u884C\u4FEE\u6539\u3002\u6216\u8005\u524D\u5F80\u811A\u672C\u60AC\u6D6E\u7A97:\u540E\u53F0-\u8F6F\u4EF6\u914D\u7F6E\u540C\u6B65 \u5173\u95ED\u914D\u7F6E\u540C\u6B65\u529F\u80FD\u3002";
                          panel2.lockWrapper = $creator.tooltip(panel2.lockWrapper);
                        }
                      };
                      if (script.panel && script.header) {
                        script.onrender({ panel: script.panel, header: script.header });
                      }
                    }
                  }
                }
                this.cfg.sync = true;
              }
            } catch (e) {
              console.error(e);
              this.cfg.sync = false;
              this.cfg.connected = false;
            }
          }
        }
      }),
      update: new Script({
        name: "\u68C0\u67E5\u66F4\u65B0",
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        namespace: "background.update",
        configs: {
          notes: {
            defaultValue: "\u811A\u672C\u81EA\u52A8\u66F4\u65B0\u6A21\u5757\uFF0C\u5982\u679C\u6709\u65B0\u7684\u7248\u672C\u4F1A\u81EA\u52A8\u901A\u77E5\u3002"
          },
          autoNotify: {
            defaultValue: true,
            label: "\u5F00\u542F\u66F4\u65B0\u901A\u77E5",
            attrs: { type: "checkbox", title: "\u5F53\u6709\u6700\u65B0\u7684\u7248\u672C\u65F6\u81EA\u52A8\u5F39\u7A97\u901A\u77E5\uFF0C\u9ED8\u8BA4\u5F00\u542F" }
          },
          notToday: {
            defaultValue: -1
          },
          ignoreVersions: {
            defaultValue: []
          }
        },
        methods() {

        },
        async onrender({ panel: panel2 }) {
          var _a;
          if (typeof this.methods.getLastVersion !== "function") {
            panel2.body.replaceChildren(el("div", "这是自定义 API 版本，请使用修改后的脚本文件更新。"));
            return;
          }
          const version = await this.methods.getLastVersion();
          const infos = $gm.getInfos();
          if (!infos) {
            return;
          }
          const changeLog = el("button", { className: "base-style-button-secondary" }, "\u{1F4C4}\u67E5\u770B\u66F4\u65B0\u65E5\u5FD7");
          changeLog.onclick = () => CommonProject.scripts.render.methods.pin(CommonProject.scripts.ai);
          const updatePage = ((_a = this.startConfig) == null ? void 0 : _a.updatePage) || "";
          panel2.body.replaceChildren(
            el("div", { className: "card" }, [
              el("hr"),
              el("div", ["\u6700\u65B0\u7248\u672C\uFF1A" + version["last-version"] + " - ", changeLog]),
              el("hr"),
              el("div", "\u5F53\u524D\u7248\u672C\uFF1A" + infos.script.version),
              el("div", "\u811A\u672C\u7BA1\u7406\u5668\uFF1A" + infos.scriptHandler),
              el("div", ["\u811A\u672C\u66F4\u65B0\u94FE\u63A5\uFF1A", el("a", { target: "_blank", href: updatePage }, [updatePage || "\u65E0"])])
            ])
          );
          console.log("versions", {
            notToday: this.cfg.notToday,
            ignoreVersions: this.cfg.ignoreVersions,
            version
          });
        },
        oncomplete() {
          if (typeof this.methods.getLastVersion !== "function") return;
          if (this.cfg.autoNotify && $.isInTopWindow()) {
            if (this.cfg.notToday === -1 || this.cfg.notToday !== new Date().getDate()) {
              const infos = $gm.getInfos();
              if (infos) {
                setTimeout(async () => {
                  var _a;
                  const version = await this.methods.getLastVersion();
                  const last = version["last-version"];
                  if (this.cfg.ignoreVersions.includes(last) === false && gt_1(last, infos.script.version)) {
                    const updatePage = ((_a = this.startConfig) == null ? void 0 : _a.updatePage) || "";
                    const modal = $modal("confirm", {
                      maskCloseable: false,
                      width: 600,
                      content: $creator.notes([`\u68C0\u6D4B\u5230\u65B0\u7248\u672C\u53D1\u5E03 ${last} \uFF1A`, [...version.notes || []]]),
                      footer: el("div", [
                        el("button", { className: "base-style-button-secondary", innerText: "\u8DF3\u8FC7\u6B64\u7248\u672C" }, (btn) => {
                          btn.onclick = () => {
                            this.cfg.ignoreVersions = [...this.cfg.ignoreVersions, last];
                            modal == null ? void 0 : modal.remove();
                          };
                        }),
                        el("button", { className: "base-style-button-secondary", innerText: "\u4ECA\u65E5\u4E0D\u518D\u63D0\u793A" }, (btn) => {
                          btn.onclick = () => {
                            this.cfg.notToday = new Date().getDate();
                            modal == null ? void 0 : modal.remove();
                          };
                        }),
                        el("button", { className: "base-style-button", innerText: "\u524D\u5F80\u66F4\u65B0" }, (btn) => {
                          btn.onclick = () => {
                            if (updatePage) {
                              window.open(updatePage, "_blank");
                              modal == null ? void 0 : modal.remove();
                            } else {
                              $message("error", { content: "\u65E0\u6CD5\u524D\u5F80\u66F4\u65B0\u9875\u9762\uFF0C\u66F4\u65B0\u94FE\u63A5\u4E3A\u7A7A" });
                            }
                          };
                        })
                      ])
                    });
                  }
                }, 5 * 1e3);
              }
            }
          }
        }
      }),
      dev: new Script({
        name: "\u5F00\u53D1\u8005\u8C03\u8BD5",
        namespace: "background.dev",
        url: [["\u6240\u6709\u9875\u9762", /./]],
        configs: {
          notes: {
            defaultValue: "\u5F00\u53D1\u4EBA\u5458\u8C03\u8BD5\u7528\u3002<br>\u6CE8\u5165OCS_CONTEXT\u5168\u5C40\u53D8\u91CF\u3002\u7528\u6237\u53EF\u5FFD\u7565\u6B64\u9875\u9762\u3002"
          }
        },
        onrender({ panel: panel2 }) {
          const injectBtn = el("button", { className: "base-style-button" }, "\u70B9\u51FB\u6CE8\u5165\u5168\u5C40\u53D8\u91CF");
          injectBtn.addEventListener("click", () => {
            $gm.unsafeWindow.OCS_CONTEXT = self;
          });
          const showTabDataBtn = el("button", { className: "base-style-button" }, "\u663E\u793ATab\u5B58\u50A8");
          $gm.getTab((tab) => {
            const els = [];
            for (const key in tab) {
              if (Object.prototype.hasOwnProperty.call(tab, key)) {
                els.push(el("div", [el("b", key + " : "), el("code", JSON.stringify(tab[key]))]));
              }
            }
            showTabDataBtn.addEventListener("click", () => {
              $modal("simple", {
                content: el("div", els),
                width: window.document.documentElement.clientWidth / 2
              });
            });
          });
          panel2.body.replaceChildren(el("div", { className: "card" }, [injectBtn, showTabDataBtn]));
        }
      }),
      appLoginHelper: new Script({
        name: "\u8F6F\u4EF6\u767B\u5F55\u8F85\u52A9",
        url: [
          ["\u8D85\u661F\u767B\u5F55", "passport2.chaoxing.com/login"],
          ["\u667A\u6167\u6811\u767B\u5F55", "passport.zhihuishu.com/login"],
          ["\u804C\u6559\u4E91\u767B\u5F55", "zjy2.icve.com.cn/portal/login.html"],
          ["\u667A\u6167\u804C\u6559\u767B\u5F55", "sso.icve.com.cn/sso/auth"]
        ],
        hideInPanel: true,
        oncomplete() {
          if ($.isInTopWindow()) {
            CommonProject.scripts.render.methods.moveToEdge();
          }
        }
      }),
      errorHandle: new Script({
        name: "\u5168\u5C40\u9519\u8BEF\u6355\u83B7",
        url: [["", /.*/]],
        hideInPanel: true,
        onstart() {
          const projects = definedProjects();
          for (const project of projects) {
            for (const key in project.scripts) {
              if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
                const script = project.scripts[key];
                script.on("scripterror", (err) => {
                  const msg = `[${project.name} - ${script.name}] : ${err}`;
                  console.error(msg);
                  $console.error(msg);
                });
              }
            }
          }
        }
      }),
      requestList: new Script({
        name: "\u8BF7\u6C42\u8BB0\u5F55",
        url: [["", /.*/]],
        priority: 99,
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "\u5F00\u53D1\u4EBA\u5458\u8BF7\u6C42\u8C03\u8BD5\u8BB0\u5F55\u9875\u9762\uFF0C\u5C0F\u767D\u52FF\u5165\uFF0C\u6700\u591A\u53EA\u8BB0\u5F55\u6700\u8FD1\u7684100\u4E2A\u8BF7\u6C42\u6570\u636E",
              "\u53EF\u6253\u5F00F12\u63A7\u5236\u53F0\u67E5\u770B\u8BF7\u6C42\u65E5\u5FD7\uFF0C\u6216\u8005\u4E0B\u65B9\u7684\u8BF7\u6C42\u5217\u8868"
            ]).outerHTML
          },
          enable: {
            label: "\u5F00\u542F\u8BF7\u6C42\u8BB0\u5F55",
            attrs: { type: "checkbox" },
            defaultValue: false
          },
          methodFilter: {
            label: "\u65B9\u6CD5\u8FC7\u6EE4",
            tag: "select",
            attrs: { placeholder: "\u9009\u62E9\u9009\u9879" },
            options: [["none", "\u65E0"], ["GET"], ["POST"], ["OPTIONS"], ["HEAD"]],
            defaultValue: "none"
          },
          typeFilter: {
            label: "\u7C7B\u578B\u8FC7\u6EE4",
            tag: "select",
            attrs: { placeholder: "\u9009\u62E9\u9009\u9879" },
            options: [
              ["none", "\u65E0"],
              ["gmxhr", "\u6CB9\u7334API\u8BF7\u6C42\uFF08gmxhr\uFF09"],
              ["fetch", "\u666E\u901A\u8BF7\u6C42\uFF08fetch\uFF09"]
            ],
            defaultValue: "none"
          },
          searchValue: {
            label: "\u5185\u5BB9\u641C\u7D22",
            attrs: { placeholder: "\u641C\u7D22 URL/\u8BF7\u6C42\u4F53/\u54CD\u5E94" },
            defaultValue: ""
          },
          list: {
            defaultValue: []
          }
        },
        methods() {
          const render = (list) => {
            var _a, _b;
            (_a = this.panel) == null ? void 0 : _a.body.replaceChildren();
            (_b = this.panel) == null ? void 0 : _b.body.append(
              el("div", { className: "card" }, [
                el("div", { style: { padding: "8px 0px", textAlign: "end" } }, [
                  el(
                    "button",
                    {
                      className: "base-style-button-secondary",
                      style: { marginRight: "12px" },
                      innerText: "\u{1F5D1}\uFE0F\u6E05\u7A7A\u8BB0\u5F55"
                    },
                    (btn) => {
                      btn.onclick = () => {
                        this.cfg.list = [];
                        render(this.cfg.list);
                      };
                    }
                  ),
                  el("button", { className: "base-style-button", innerText: "\u{1F50D}\u6267\u884C\u641C\u7D22" }, (btn) => {
                    btn.onclick = () => {
                      if (this.cfg.methodFilter === "none" && this.cfg.typeFilter === "none" && this.cfg.searchValue === "") {
                        render(this.cfg.list);
                      } else {
                        const list2 = this.cfg.list.filter((item) => {
                          if (this.cfg.methodFilter !== "none" && item.method.toLowerCase() !== this.cfg.methodFilter.toLowerCase()) {
                            return false;
                          }
                          return true;
                        }).filter((item) => {
                          if (this.cfg.typeFilter !== "none" && item.type !== this.cfg.typeFilter) {
                            return false;
                          }
                          return true;
                        }).filter((item) => {
                          var _a2, _b2;
                          if (this.cfg.searchValue && item.url.includes(this.cfg.searchValue) || ((_a2 = item.data) == null ? void 0 : _a2.includes(this.cfg.searchValue)) || ((_b2 = item.response) == null ? void 0 : _b2.includes(this.cfg.searchValue))) {
                            return true;
                          }
                          return false;
                        });
                        render(list2);
                      }
                    };
                  })
                ]),
                el(
                  "div",
                  { style: { backgroundColor: "#292929", overflow: "auto", maxHeight: window.innerHeight / 2 + "px" } },
                  [
                    ...list.length === 0 ? [el("div", { style: { color: "white", textAlign: "center" } }, "\u6682\u65E0\u6570\u636E")] : [],
                    ...list.map(
                      (item) => el(
                        "div",
                        {
                          title: Object.entries(item).map(
                            ([key, val]) => key === "time" ? `${key} : ${new Date(val).toLocaleString().replace(/\//g, "-")}` : `${key} : ${val}`
                          ).join("\n"),
                          style: {
                            maxWidth: "800px",
                            padding: "4px 0px",
                            margin: "4px 0px",
                            textWrap: "nowrap"
                          }
                        },
                        [
                          el("div", [
                            el("span", { style: { marginRight: "8px" } }, new Date(item.time).toLocaleTimeString()),
                            el(
                              "span",
                              {
                                style: {
                                  backgroundColor: "#2196f3a3",
                                  color: "#ececec",
                                  marginRight: "8px",
                                  padding: "0px 2px"
                                }
                              },
                              item.method
                            ),
                            el(
                              "span",
                              { style: { color: item.response ? "#4eb74e" : "#eb6262", marginRight: "8px" } },
                              "\u25CF"
                            ),
                            el(
                              "div",
                              { style: { display: "inline-block", color: "#ececec" } },
                              item.url ? item.url.length > 100 ? item.url.slice(0, 100) + "..." : item.url : "-"
                            )
                          ]),
                          el(
                            "div",
                            { style: { overflow: "hidden", fontSize: "12px", color: "#8f8f8f" } },
                            item.data ? "data: " + item.data : ""
                          ),
                          el(
                            "div",
                            { style: { overflow: "hidden", fontSize: "12px", color: "#8f8f8f" } },
                            item.response ? "resp: " + item.response : item.error ? "err : " + item.error : ""
                          )
                        ]
                      )
                    )
                  ]
                )
              ])
            );
          };
          return {
            render
          };
        },
        onrender() {
          this.methods.render(this.cfg.list);
        },
        onstart() {
          const gmRequest = GM_xmlhttpRequest;
          const originalFetch = fetch;
          const getId = () => Math.random().toString(16).slice(2);
          const addRecord = (item) => {
            this.cfg.list = [item, ...this.cfg.list];
            if (this.cfg.list.length > 100) {
              this.cfg.list = this.cfg.list.slice(0, 100);
            }
          };
          const setItem = (id, response, error) => {
            const list = JSON.parse(JSON.stringify(this.cfg.list));
            const index = list.findIndex((item) => item.id === id);
            if (index !== -1) {
              list[index].response = response;
              list[index].error = error;
            }
            this.cfg.list = list;
          };
          GM_xmlhttpRequest = (details) => {
            if (this.cfg.enable) {
              const id = getId();
              const data = {
                id,
                url: details.url,
                method: details.method || "unknown",
                type: "gmxhr",
                data: details.data,
                headers: details.headers,
                response: "",
                error: "",
                time: Date.now()
              };
              addRecord(data);
              const onload = details.onload;
              const onerror = details.onerror;
              details.onload = function(response) {
                setItem(id, response.responseText, "");
                data.response = details.responseType === "json" ? response.response : response.responseText;
                console.log("%c [\u8BF7\u6C42\u6210\u529F]", "color: green; font-weight: bold", data.url, data);
                onload == null ? void 0 : onload.apply(this, [response]);
              };
              details.onerror = function(response) {
                setItem(id, "", response.error);
                data.error = response.error;
                console.log("%c [\u8BF7\u6C42\u5931\u8D25]", "color: red; font-weight: bold", data.url, data);
                onerror == null ? void 0 : onerror.apply(this, [response]);
              };
            }
            return gmRequest.apply(this, [details]);
          };
          fetch = (input, init) => {
            if (this.cfg.enable) {
              const id = getId();
              const data = {
                id,
                url: typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
                method: (init == null ? void 0 : init.method) || "unknown",
                type: "fetch",
                data: init == null ? void 0 : init.body,
                headers: init == null ? void 0 : init.headers,
                response: "",
                error: "",
                time: Date.now()
              };
              addRecord(data);
              const res = originalFetch.apply(this, [input, init]);
              res.then((result) => {
                return result.clone().text();
              }).then((result) => {
                setItem(id, result, "");
                data.response = result;
                console.log("%c [\u8BF7\u6C42\u6210\u529F]", "color: green; font-weight: bold", data.url, data);
              });
              res.catch((err) => {
                setItem(id, "", String(err));
                data.error = String(err);
                console.log("%c [\u8BF7\u6C42\u5931\u8D25]", "color: red; font-weight: bold", data.url, data);
              });
              return res;
            } else {
              return originalFetch.apply(this, [input, init]);
            }
          };
        }
      })
    }
  });
