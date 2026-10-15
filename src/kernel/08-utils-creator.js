  const $creator = {
    notes(lines, tag = "ul") {
      return el(
        tag,
        lines.map(
          (line) => el(
            "li",
            Array.isArray(line) ? line.map((node) => typeof node === "string" ? el("div", { innerHTML: node }) : node) : [typeof line === "string" ? el("div", { innerHTML: line }) : line]
          )
        )
      );
    },
    tooltip(target) {
      target.setAttribute("data-title", target.title);
      if (typeof $gm.getInfos() !== "undefined") {
        target.removeAttribute("title");
      }
      const onMouseMove = (e) => {
        if ($elements.tooltip.style.display !== "none") {
          $elements.tooltip.style.top = e.y + "px";
          $elements.tooltip.style.left = e.x + "px";
        }
      };
      const showTitle = (e) => {
        const dataTitle = target.getAttribute("data-title");
        if (dataTitle) {
          $elements.tooltip.innerHTML = dataTitle.split("\n").join("<br>") || "";
          $elements.tooltip.style.top = e.y + "px";
          $elements.tooltip.style.left = e.x + "px";
          $elements.tooltip.style.display = "block";
        } else {
          $elements.tooltip.style.display = "none";
        }
        window.addEventListener("mousemove", onMouseMove);
      };
      const hideTitle = () => {
        $elements.tooltip.style.display = "none";
        window.removeEventListener("mousemove", onMouseMove);
      };
      hideTitle();
      target.addEventListener("mouseenter", showTitle);
      target.addEventListener("click", showTitle);
      target.addEventListener("mouseout", hideTitle);
      target.addEventListener("mouseleave", hideTitle);
      target.addEventListener("blur", hideTitle);
      return target;
    },
    input(attrs, children, handler) {
      return el("input", attrs, function(input) {
        input.append(...children || []);
        input.classList.add("base-style-input");
        handler == null ? void 0 : handler.apply(this, [input]);
      });
    },
    button(text, attrs, handler) {
      return el("input", { type: "button", ...attrs }, function(btn) {
        btn.value = text || "";
        btn.classList.add("base-style-button");
        handler == null ? void 0 : handler.apply(this, [btn]);
      });
    },
    scriptPanel(script, opts) {
      var _a, _b;
      const scriptPanel = el("script-panel-element", { name: script.name });
      script.onConfigChange("notes", (pre, curr) => {
        scriptPanel.notesContainer.innerHTML = script.cfg.notes || "";
      });
      script.panel = scriptPanel;
      scriptPanel.notesContainer.innerHTML = ((script.configs || {}).notes || {}).defaultValue || "";
      const elList = [];
      // 配置项按 separator 分组。带 collapsed 的分组折叠成 <details>，默认收起，
      // 首屏只露出常用项；分组内若有值被改过，标题上提示「已修改」。
      let group = { title: "", collapsed: false, configs: /* @__PURE__ */ Object.create({}) };
      const flushGroup = () => {
        const keys = Object.keys(group.configs).filter((key) => group.configs[key].label !== void 0);
        if (keys.length) {
          const area = $creator.configsArea($creator.configs(script.namespace, group.configs, opts == null ? void 0 : opts.onload));
          if (!group.title) {
            elList.push(area);
          } else if (group.collapsed) {
            const details = el("details", { className: "configs-group" });
            const summary = el("summary");
            summary.append(el("span", group.title));
            const changed = keys.some((key) => {
              const fallback = group.configs[key].defaultValue;
              return $store.get($.namespaceKey(script.namespace, key), fallback) !== fallback;
            });
            if (changed) summary.append(el("span", { className: "configs-group-hint" }, "· 已修改"));
            details.append(summary, area);
            elList.push(details);
          } else {
            elList.push(el("div", { className: "configs-group-title" }, group.title), area);
          }
        }
        group = { title: "", collapsed: false, configs: /* @__PURE__ */ Object.create({}) };
      };
      for (const key in script.configs) {
        if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
          const cfg = script.configs[key];
          if (cfg.separator) {
            flushGroup();
            group.title = cfg.separator;
            group.collapsed = cfg.collapsed === true;
          }
          group.configs[key] = cfg;
        }
      }
      flushGroup();
      scriptPanel.configsContainer.replaceChildren(...elList);
      return scriptPanel;
    },
    configsArea(configElements) {
      const configsContainer = el("div", { className: "configs card" });
      const configsBody = el("div", { className: "configs-body" });
      configsBody.append(...Object.entries(configElements).map(([key, el2]) => el2));
      configsContainer.append(configsBody);
      return configsContainer;
    },
    configs(namespace, configs, onload) {
      const elements = /* @__PURE__ */ Object.create({});
      for (const key in configs) {
        if (Object.prototype.hasOwnProperty.call(configs, key)) {
          const config = configs[key];
          if (config.label !== void 0) {
            const element = el("config-element", {
              key: $.namespaceKey(namespace, key),
              tag: config.tag,
              sync: config.sync,
              attrs: config.attrs,
              _onload: function(el2) {
                var _a;
                (_a = config.onload) == null ? void 0 : _a.call(this, el2);
                onload == null ? void 0 : onload(el2);
              },
              defaultValue: config.defaultValue,
              options: config.options
            });
            element.label.textContent = config.label;
            elements[key] = element;
          }
        }
      }
      return elements;
    },
    copy(name, value) {
      return el("span", "\u{1F4C4}" + name, (btn) => {
        btn.className = "copy";
        btn.addEventListener("click", () => {
          btn.innerText = "\u5DF2\u590D\u5236\u221A";
          navigator.clipboard.writeText(value);
          setTimeout(() => {
            btn.innerText = "\u{1F4C4}" + name;
          }, 500);
        });
      });
    },
    preventText(opts) {
      const { name, delay = 3, autoRemove = true, ondefault, onprevent } = opts;
      const span = el("span", name);
      span.style.textDecoration = "underline";
      span.style.cursor = "pointer";
      span.onclick = () => {
        clearTimeout(id);
        if (autoRemove) {
          span.remove();
        }
        onprevent == null ? void 0 : onprevent(span);
      };
      const id = setTimeout(() => {
        if (autoRemove) {
          span.remove();
        }
        ondefault(span);
      }, delay * 1e3);
      return span;
    },
    createQuestionTitleExtra(question) {
      const space = $creator.space(
        [
          $creator.copy("\u590D\u5236", question),
          el("span", { className: "question-title-extra-btn", innerText: "\u{1F30F}\u767E\u5EA6\u4E00\u4E0B" }, (btn) => {
            btn.onclick = () => {
              popupWin == null ? void 0 : popupWin.close();

            };
          })
        ],
        { x: 4 }
      );
      space.style.marginTop = "6px";
      space.style.textAlign = "right";
      return el("div", { style: { textAlign: "right" } }, [space]);
    },
    space(children, options) {
      return el("div", { className: "space" }, (div) => {
        var _a, _b, _c;
        for (let index = 0; index < children.length; index++) {
          const child = el("span", { className: "space-item" }, [children[index]]);
          child.style.display = "inline-block";
          const x = (_a = options == null ? void 0 : options.x) != null ? _a : 12;
          const y = (_b = options == null ? void 0 : options.y) != null ? _b : 0;
          if (index > 0) {
            child.style.marginLeft = x / 2 + "px";
            child.style.marginRight = x / 2 + "px";
            child.style.marginTop = y / 2 + "px";
            child.style.marginBottom = y / 2 + "px";
          } else {
            child.style.marginRight = x / 2 + "px";
            child.style.marginBottom = y / 2 + "px";
          }
          div.append(child);
          if (index !== children.length - 1) {
            div.append(el("span", [(_c = options == null ? void 0 : options.separator) != null ? _c : " "]));
          }
        }
      });
    }
  };
