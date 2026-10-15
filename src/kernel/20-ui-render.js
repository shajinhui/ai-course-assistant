  const RenderScript = new Script({
    name: "\u7A97\u53E3",
    url: [["\u6240\u6709", /.*/]],
    namespace: "render.panel",
    configs: {
      notes: {
        defaultValue: $creator.notes([
          [
            "\u5982\u679C\u9700\u8981\u9690\u85CF\u6574\u4E2A\u7A97\u53E3\uFF0C\u53EF\u4EE5\u70B9\u51FB\u4E0B\u65B9\u9690\u85CF\u6309\u94AE\uFF0C",
            "\u9690\u85CF\u540E\u53EF\u4EE5\u5FEB\u901F\u4E09\u51FB\u5C4F\u5E55\u4E2D\u7684\u4EFB\u610F\u5730\u65B9",
            "\u6765\u91CD\u65B0\u5728\u9F20\u6807\u4F4D\u7F6E\u663E\u793A\u7A97\u53E3\u3002"
          ],
          "\u7A97\u53E3\u8FDE\u7EED\u70B9\u51FB\u663E\u793A\u7684\u6B21\u6570\u53EF\u4EE5\u81EA\u5B9A\u4E49\uFF0C\u9ED8\u8BA4\u4E3A\u4E09\u6B21",
          ["\u7A97\u53E3\u5FEB\u6377\u952E\u5217\u8868\uFF1A", "ctrl + o : \u9690\u85CF/\u6253\u5F00 \u9762\u677F"]
        ]).outerHTML
      },
      x: { defaultValue: window.innerWidth * 0.1 },
      y: { defaultValue: window.innerWidth * 0.1 },
      visual: { defaultValue: "normal" },
      theme: { defaultValue: "auto" },
      firstCloseAlert: {
        defaultValue: true
      },
      fontsize: {
        label: "\u5B57\u4F53\u5927\u5C0F\uFF08\u50CF\u7D20\uFF09",
        attrs: { type: "number", min: 12, max: 24, step: 1 },
        defaultValue: 14
      },
      switchPoint: {
        label: "\u7A97\u53E3\u663E\u793A\u8FDE\u70B9\uFF08\u6B21\u6570\uFF09",
        attrs: {
          type: "number",
          min: 3,
          max: 10,
          step: 1,
          title: "\u8BBE\u7F6E\u5F53\u8FDE\u7EED\u70B9\u51FB\u5C4F\u5E55 N \u6B21\u65F6\uFF0C\u53EF\u4EE5\u8FDB\u884C\u9762\u677F\u7684 \u9690\u85CF/\u663E\u793A \u5207\u6362\uFF0C\u9ED8\u8BA4\u8FDE\u7EED\u70B9\u51FB\u5C4F\u5E55\u4E09\u4E0B"
        },
        defaultValue: 3
      },
      lockConfigs: {
        defaultValue: false
      },
      lockMessage: {
        defaultValue: "\u5F53\u524D\u811A\u672C\u5DF2\u9501\u5B9A\u914D\u7F6E\uFF0C\u65E0\u6CD5\u4FEE\u6539"
      }
    },
    methods() {
      return {
        isPinned: async (script) => {
          const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
          return isCurrentPanel(script.projectName, script, currentPanelName);
        },
        pin: async (script) => {
          if (script.projectName) {
            await $store.setTab($const.TAB_CURRENT_PANEL_NAME, `${script.projectName}-${script.name}`);
          } else if (script.namespace) {
            await $store.setTab($const.TAB_CURRENT_PANEL_NAME, script.namespace);
          } else {
            console.warn("[OCS]", `${script.name} \u65E0\u6CD5\u7F6E\u9876\uFF0C projectName \u4E0E namespace \u90FD\u4E3A pengziAI`);
          }
        },
        minimize: () => {
          this.cfg.visual = "minimize";
        },
        moveToEdge: () => {
          this.cfg.x = 80;
          this.cfg.y = 60;
          this.cfg.visual = "minimize";
        },
        normal: () => {
          this.cfg.visual = "normal";
        }
      };
    },
    onrender({ panel: panel2 }) {
      const closeBtn = el("button", { className: "base-style-button" }, "\u9690\u85CF\u7A97\u53E3");
      closeBtn.onclick = () => {
        if (this.cfg.firstCloseAlert) {
          $modal("confirm", {
            content: $creator.notes([
              "\u9690\u85CF\u811A\u672C\u9875\u9762\u540E\uFF0C\u5FEB\u901F\u70B9\u51FB\u9875\u9762\u4E09\u4E0B\uFF08\u53EF\u4EE5\u5728\u60AC\u6D6E\u7A97\u8BBE\u7F6E\u4E2D\u8C03\u6574\u6B21\u6570\uFF09\u5373\u53EF\u91CD\u65B0\u663E\u793A\u811A\u672C\u3002\u5982\u679C\u4E09\u4E0B\u65E0\u6548\uFF0C\u53EF\u4EE5\u5C1D\u8BD5\u5220\u9664\u811A\u672C\u91CD\u65B0\u5B89\u88C5\u3002",
              "\u8BF7\u786E\u8BA4\u662F\u5426\u5173\u95ED\u3002\uFF08\u6B64\u540E\u4E0D\u518D\u663E\u793A\u6B64\u5F39\u7A97\uFF09"
            ]),
            onConfirm: () => {
              this.cfg.visual = "close";
              this.cfg.firstCloseAlert = false;
            }
          });
        } else {
          this.cfg.visual = "close";
        }
      };
      panel2.body.replaceChildren(el("hr"), closeBtn);
    },
    async onactive({ style, projects, defaultPanelName }) {
      handleLowLevelBrowser();
      $.loadCustomElements(definedCustomElements);
      const defaults2 = {
        urls: (urls) => urls && urls.length ? urls : [location.href],
        panelName: (name) => name || defaultPanelName || ""
      };
      const matchedScripts = $.getMatchedScripts(projects, [location.href]).filter((s) => !s.hideInPanel);
      const container = el("container-element");
      const initHeader = (urls, currentPanelName) => {
        const infos = $gm.getInfos();
        const profile = $creator.tooltip(
          el(
            "div",
            { className: "brand", title: "棚子AI" },
            [el("span", { className: "brand-mark" }), el("span", { className: "brand-name" }, "棚子 AI")]
          )
        );
        const scriptDropdowns = [];
        for (const project of projects) {
          const dropdown = el("dropdown-element");
          let selected = false;
          const options = [];
          const scripts = $.getMatchedScripts([project], urls).filter((s) => !s.hideInPanel);
          if (scripts.length) {
            for (const key in project.scripts) {
              if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
                const script = project.scripts[key];
                if (!script.hideInPanel) {
                  const optionSelected = isCurrentPanel(project.name, script, currentPanelName);
                  const option = el("div", { className: "dropdown-option" }, script.name);
                  if (optionSelected) {
                    option.classList.add("active");
                  }
                  if (selected !== true && optionSelected) {
                    selected = true;
                  }
                  option.onclick = () => {
                    $store.setTab($const.TAB_CURRENT_PANEL_NAME, project.name + "-" + script.name);
                  };
                  options.push(option);
                }
              }
            }
            if (selected) {
              dropdown.classList.add("active");
            }
            dropdown.triggerElement = el("div", { className: "" }, project.name);
            dropdown.triggerElement.style.padding = "0px 8px";
            dropdown.content.append(...options);
            scriptDropdowns.push(dropdown);
          }
        }
        const isMinimize = () => this.cfg.visual === "minimize";
        const visualSwitcher = $creator.tooltip(
          el("div", {
            className: "switch ",
            title: isMinimize() ? "\u70B9\u51FB\u5C55\u5F00\u7A97\u53E3" : "\u70B9\u51FB\u6700\u5C0F\u5316\u7A97\u53E3",
            innerHTML: isMinimize() ? expandSvg : minimizeSvg,
            onclick: () => {
              this.cfg.visual = isMinimize() ? "normal" : "minimize";
              visualSwitcher.title = isMinimize() ? "\u70B9\u51FB\u5C55\u5F00\u7A97\u53E3" : "\u70B9\u51FB\u6700\u5C0F\u5316\u7A97\u53E3";
              visualSwitcher.innerHTML = isMinimize() ? expandSvg : minimizeSvg;
            }
          })
        );
        container.header.visualSwitcher = visualSwitcher;
        const themeGlyph = { auto: "◐", light: "☀", dark: "☾" };
        const themeName = { auto: "跟随系统", light: "浅色", dark: "深色" };
        const themeToggle = $creator.tooltip(
          el("div", {
            className: "theme-toggle",
            title: "主题：" + themeName[this.cfg.theme || "auto"] + "（点击切换）",
            textContent: themeGlyph[this.cfg.theme || "auto"] || themeGlyph.auto,
            onclick: () => {
              const order = ["auto", "light", "dark"];
              const next = order[(order.indexOf(this.cfg.theme || "auto") + 1) % order.length];
              this.cfg.theme = next;
              themeToggle.textContent = themeGlyph[next];
              themeToggle.setAttribute("data-title", "主题：" + themeName[next] + "（点击切换）");
            }
          })
        );
        container.header.replaceChildren();
        container.header.append(
          el("div", { style: { width: "100%" } }, [
            el("div", { style: { display: "flex", alignItems: "center", width: "100%" } }, [
              profile,
              ...scriptDropdowns,
              themeToggle,
              container.header.visualSwitcher || ""
            ]),
            el("div", { style: { display: "flex", width: "100%" } }, [$elements.extraMenuBar])
          ])
        );
      };
      const handlePosition = () => {
        if (this.cfg.x > document.documentElement.clientWidth || this.cfg.x < 0) {
          this.cfg.x = 10;
          this.cfg.y = 10;
        }
        if (this.cfg.y > document.documentElement.clientHeight || this.cfg.y < 0) {
          this.cfg.x = 10;
          this.cfg.y = 10;
        }
        container.style.left = this.cfg.x + "px";
        container.style.top = this.cfg.y + "px";
        const positionHandler = () => {
          this.cfg.x = container.offsetLeft;
          this.cfg.y = container.offsetTop;
        };
        enableElementDraggable(container.header, container, positionHandler);
        this.onConfigChange(
          "x",
          debounce_1((x) => container.style.left = x + "px", 200)
        );
        this.onConfigChange(
          "y",
          debounce_1((y) => container.style.top = y + "px", 200)
        );
      };
      const visual = (value) => {
        container.className = "";
        if (value === "minimize") {
          container.classList.add("minimize");
        } else if (value === "close") {
          container.classList.add("close");
        } else {
          container.classList.add("normal");
        }
      };
      const handleVisible = () => {
        window.addEventListener("click", (e) => {
          if (e.detail === Math.max(this.cfg.switchPoint, 3)) {
            container.style.top = e.y + "px";
            container.style.left = e.x + "px";
            this.cfg.x = e.x;
            this.cfg.y = e.y;
            this.cfg.visual = "normal";
          }
        });
        this.onConfigChange("visual", (curr) => visual(curr));
      };
      const renderBody = async (currentPanelName) => {
        var _a;
        for (const project of projects) {
          for (const key in project.scripts) {
            if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
              const script = project.scripts[key];
              if (isCurrentPanel(project.name, script, currentPanelName)) {
                const panel2 = $creator.scriptPanel(script);
                script.projectName = project.name;
                script.panel = panel2;
                script.header = container.header;
                container.body.replaceChildren(panel2);
                (_a = script.onrender) == null ? void 0 : _a.call(script, { panel: panel2, header: container.header });
                script.emit("render", { panel: panel2, header: container.header });
              }
            }
          }
        }
      };
      const initCorsModalSystem = () => {
        cors.on("modal", async (args) => {
          const [type, _attrs] = args || [];
          return new Promise((resolve, reject) => {
            const attrs = _attrs;
            attrs.onCancel = () => resolve("");
            attrs.onConfirm = resolve;
            attrs.onClose = resolve;
            $modal(type, attrs);
          });
        });
      };
      const initCorsMessageSystem = () => {
        cors.on("message", async (args) => {
          const [type, attrs] = args || [];
          $message(type, attrs);
        });
      };
      const onFontsizeChange = () => {
        container.style.font = `${this.cfg.fontsize}px  Menlo, Monaco, Consolas, 'Courier New', monospace`;
      };
      const rerender = async (urls, currentPanelName) => {
        initHeader(urls, currentPanelName);
        await renderBody(currentPanelName);
      };
      if (matchedScripts.length !== 0 && self === top) {
        $store.setTab($const.TAB_URLS, []);
        container.append(el("style", {}, style || ""), $elements.messageContainer, $elements.tooltip);
        $elements.root.append(container);
        document.body.append($elements.panel);
        const applyTheme = () => $elements.panel.setAttribute("data-theme", this.cfg.theme || "auto");
        applyTheme();
        this.onConfigChange("theme", applyTheme);
        window.addEventListener(
          "keydown",
          (e) => {
            if (e.ctrlKey && e.key === "o") {
              e.stopPropagation();
              e.preventDefault();
              this.cfg.visual = this.cfg.visual === "close" ? "normal" : "close";
            }
          },
          { capture: true }
        );
        handleVisible();
        visual(this.cfg.visual);
        (async () => {
          const urls = await $store.getTab($const.TAB_URLS);
          const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
          await rerender(defaults2.urls(urls), defaults2.panelName(currentPanelName));
        })();
        initCorsModalSystem();
        initCorsMessageSystem();
        handlePosition();
        onFontsizeChange();
        $store.addTabChangeListener(
          $const.TAB_URLS,
          debounce_1(async (urls) => {
            const currentPanelName = await $store.getTab($const.TAB_CURRENT_PANEL_NAME);
            rerender(defaults2.urls(urls), defaults2.panelName(currentPanelName));
          }, 2e3)
        );
        $store.addTabChangeListener($const.TAB_CURRENT_PANEL_NAME, async (currentPanelName) => {
          const urls = await $store.getTab($const.TAB_URLS) || [location.href];
          rerender(defaults2.urls(urls), defaults2.panelName(currentPanelName));
        });
        this.onConfigChange("fontsize", onFontsizeChange);
      }
    }
  });
  function $modal(type, attrs) {
    if (self === top) {
      const {
        maskCloseable = true,
        onConfirm,
        onCancel,
        onClose,
        notification: notify,
        notificationOptions,
        duration,
        ..._attrs
      } = attrs;
      if (notify) {
        $gm.notification(
          typeof _attrs.content === "string" ? _attrs.content : _attrs.content.textContent || "",
          notificationOptions
        );
      }
      const wrapper = el("div", { className: "modal-wrapper" }, (wrapper2) => {
        const modal = el("modal-element", {
          async onConfirm(val) {
            const isClose = await (onConfirm == null ? void 0 : onConfirm.apply(modal, [val]));
            if (isClose !== false) {
              wrapper2.remove();
            }
            return isClose;
          },
          onCancel() {
            onCancel == null ? void 0 : onCancel.apply(modal);
            wrapper2.remove();
          },
          onClose(val) {
            onClose == null ? void 0 : onClose.apply(modal, [val]);
            wrapper2.remove();
          },
          type,
          ..._attrs
        });
        wrapper2.append(modal);
        modal.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        if (maskCloseable) {
          wrapper2.addEventListener("click", () => {
            onClose == null ? void 0 : onClose.apply(modal);
            wrapper2.remove();
          });
        }
      });
      if (duration) {
        setTimeout(() => {
          wrapper.remove();
        }, duration * 1e3);
      }
      $elements.root.append(wrapper);
      return wrapper;
    } else {
      cors.emit("modal", [type, attrs], (args, remote) => {
        var _a, _b, _c;
        if (args) {
          (_a = attrs.onConfirm) == null ? void 0 : _a.call(attrs, args);
        } else {
          (_b = attrs.onCancel) == null ? void 0 : _b.call(attrs);
        }
        (_c = attrs.onClose) == null ? void 0 : _c.call(attrs, args);
      });
    }
  }
  function $message(type, attrs) {
    if (self === top) {
      const message = el("message-element", { type, ...attrs });
      $elements.messageContainer.append(message);
      return message;
    } else {
      if (typeof attrs.content !== "string") {
        attrs.content = attrs.content.innerHTML;
      }
      cors.emit("message", [type, attrs]);
    }
  }
  function $menu(label, config) {
    if (self !== top) {
      return;
    }
    $elements.extraMenuBar.style.display = "flex";
    const btn = el("button", label);
    btn.addEventListener("click", () => {
      if (config.scriptPanelLink) {
        RenderScript.methods.pin(config.scriptPanelLink).then(() => {
          RenderScript.methods.normal();
        }).catch(console.error);
      }
    });
    if (config.scriptPanelLink) {
      const full_name = (config.scriptPanelLink.projectName ? config.scriptPanelLink.projectName + " -> " : "") + config.scriptPanelLink.name;
      btn.title = "\u5FEB\u6377\u8DF3\u8F6C\uFF1A" + full_name;
      // btn.classList.add("script-panel-link");
    }
    $elements.extraMenuBar.append(btn);
    return btn;
  }
