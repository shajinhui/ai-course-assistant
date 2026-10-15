  class IElement extends HTMLElement {
  }
  class ConfigElement extends IElement {
    constructor() {
      super(...arguments);
      this.label = el("label");
      this.wrapper = el("div", { className: "config-wrapper" });
      this.key = "";
    }
    get value() {
      return $store.get(this.key, this.defaultValue);
    }
    set value(value) {
      this.provider.value = value;
      $store.set(this.key, value);
    }
    connectedCallback() {
      var _a, _b, _c;
      switch (this.tag) {
        case "select": {
          this.provider = el("select");
          const value = $store.get(this.key, this.defaultValue);
          for (const item of this.options || []) {
            const option = el("option");
            if (Array.isArray(item)) {
              option.value = item[0];
              option.textContent = (_a = item[1]) != null ? _a : item[0];
              if (item[2]) {
                option.title = item[2];
              }
              if (item[0] === value) {
                option.selected = true;
                option.toggleAttribute("selected");
              }
              this.provider.add(option);
            } else {
              option.value = item.value;
              option.textContent = (_b = item.label) != null ? _b : item.value;
              if (item.title) {
                option.title = item.title;
              }
              if (item.value === value) {
                option.selected = true;
                option.toggleAttribute("selected");
              }
              this.provider.add(option);
            }
          }
          this.provider.onchange = () => {
            $store.set(this.key, this.provider.value);
          };
          break;
        }
        case "textarea": {
          this.provider = el("textarea");
          this.provider.value = $store.get(this.key, this.defaultValue);
          this.provider.onchange = () => {
            $store.set(this.key, this.provider.value);
          };
          break;
        }
        default: {
          this.provider = el("input");
          if (["checkbox", "radio"].some((t2) => {
            var _a2;
            return t2 === ((_a2 = this.attrs) == null ? void 0 : _a2.type);
          })) {
            this.provider.checked = $store.get(this.key, this.defaultValue);
            const provider = this.provider;
            provider.onchange = () => {
              $store.set(this.key, provider.checked);
            };
          } else {
            this.provider.value = $store.get(this.key, this.defaultValue);
            if (!this.attrs || this.attrs.type !== "password") this.provider.setAttribute("value", this.provider.value);
            this.provider.onchange = () => {
              const { min, max, type } = this.attrs || {};
              if (type === "number") {
                if (this.provider.value.trim() === "") {
                  this.provider.value = this.defaultValue;
                  $store.set(this.key, this.defaultValue);
                  return;
                }
                const val = parseFloat(this.provider.value);
                const _min = min ? parseFloat(min) : void 0;
                const _max = max ? parseFloat(max) : void 0;
                if (_min && val < _min) {
                  this.provider.value = _min.toString();
                  $store.set(this.key, parseFloat(this.provider.value));
                } else if (_max && val > _max) {
                  this.provider.value = _max.toString();
                  $store.set(this.key, parseFloat(this.provider.value));
                } else {
                  $store.set(this.key, val);
                }
              } else {
                $store.set(this.key, this.provider.value);
              }
            };
          }
          break;
        }
      }
      this.wrapper.replaceChildren(this.provider);
      this.append(this.label, this.wrapper);
      for (const key in this.attrs) {
        if (key === "style") {
          Object.assign(this.provider.style, this.attrs[key]);
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
          Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
        }
      }
      if (this.sync) {
        $store.addChangeListener(this.key, (pre, curr, remote) => {
          this.provider.value = curr;
        });
      }
      $creator.tooltip(this.provider);
      (_c = this._onload) == null ? void 0 : _c.call(this.provider, this);
    }
  }
  class ContainerElement extends IElement {
    constructor() {
      super(...arguments);
      this.header = $creator.tooltip(el("header-element", { title: "菜单栏，可拖动" }));
      this.body = el("div", { className: "body", clientHeight: window.innerHeight / 2 });
      this.footer = el("div", { className: "footer" });
    }
    connectedCallback() {
      this.append(this.header, this.body, this.footer);
      $.onresize(this, (cont) => {
        cont.body.style.maxHeight = window.innerHeight - this.header.clientHeight - 100 + "px";
        cont.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  class DropdownElement extends IElement {
    constructor() {
      super(...arguments);
      this.triggerElement = el("button");
      this.content = el("div", { className: "dropdown-content" });
      this.trigger = "hover";
    }
    connectedCallback() {
      this.append(this.triggerElement, this.content);
      this.classList.add("dropdown");
      if (this.trigger === "click") {
        this.triggerElement.onclick = () => {
          this.content.classList.toggle("show");
        };
      } else {
        this.triggerElement.onmouseover = () => {
          this.content.classList.add("show");
        };
        this.triggerElement.onmouseout = () => {
          this.content.classList.remove("show");
        };
        this.content.onmouseover = () => {
          this.content.classList.add("show");
        };
        this.content.onmouseout = () => {
          this.content.classList.remove("show");
        };
      }
      this.content.onclick = () => {
        this.content.classList.remove("show");
      };
    }
  }
  class HeaderElement extends IElement {
    connectedCallback() {
      this.append(this.visualSwitcher || "");
    }
  }
  class MessageElement extends IElement {
    constructor() {
      super(...arguments);
      this.closer = el("span", { className: "message-closer" }, "x");
      this.contentContainer = el("span", { className: "message-content-container" });
      this.type = "info";
      this.content = "";
      this.closeable = true;
    }
    connectedCallback() {
      var _a;
      this.classList.add(this.type);
      if (typeof this.content === "string") {
        this.contentContainer.innerHTML = this.content;
      } else {
        this.contentContainer.append(this.content);
      }
      this.duration = Math.max((_a = this.duration) != null ? _a : 5, 0);
      this.append(this.contentContainer);
      if (this.closeable) {
        this.append(this.closer);
        this.closer.addEventListener("click", () => {
          var _a2;
          (_a2 = this.onClose) == null ? void 0 : _a2.call(this);
          this.remove();
        });
      }
      if (this.duration) {
        setTimeout(() => {
          var _a2;
          (_a2 = this.onClose) == null ? void 0 : _a2.call(this);
          this.remove();
        }, this.duration * 1e3);
      }
    }
  }
  class ModalElement extends IElement {
    constructor() {
      super(...arguments);
      this._title = el("div", { className: "modal-title" });
      this.body = el("div", { className: "modal-body" });
      this.footerContainer = el("div", { className: "modal-footer" });
      this.modalInput = el("input", { className: "modal-input" });
      this.modalInputType = "input";
      this.type = "alert";
      this.content = "";
      this.inputDefaultValue = "";
      this.placeholder = "";
      this.modalStyle = {};
    }
    connectedCallback() {
      var _a;
      this.classList.add(this.type);
      Object.assign(this.style, this.modalStyle || {});
      const profile = el("div", {
        innerText: this.profile || "\u5F39\u7A97\u6765\u81EA: OCS " + (((_a = $gm.getInfos()) == null ? void 0 : _a.script.version) || ""),
        className: "modal-profile"
      });
      this._title.innerText = this.title;
      this.body.append(typeof this.content === "string" ? el("div", { innerHTML: this.content }) : this.content);
      if (this.modalInputType === "textarea") {
        this.modalInput = el("textarea", { className: "modal-input", style: { height: "100px" } });
      }
      this.modalInput.placeholder = this.placeholder || "";
      this.modalInput.value = this.inputDefaultValue || "";
      this.append(profile, this._title, this.body, this.footerContainer);
      this.style.width = (this.width || 400) + "px";
      if (this.footer === void 0) {
        this.footerContainer.append(this.modalInput);
        if (this.cancelButton === void 0) {
          this.cancelButton = el("button", { className: "modal-cancel-button" });
          this.cancelButton.innerText = this.cancelButtonText || "\u53D6\u6D88";
          this.cancelButton.onclick = () => {
            var _a2, _b;
            (_a2 = this.onCancel) == null ? void 0 : _a2.call(this);
            (_b = this.onClose) == null ? void 0 : _b.call(this);
            this.remove();
          };
        }
        if (this.confirmButton === void 0) {
          this.confirmButton = el("button", { className: "modal-confirm-button" });
          this.confirmButton.innerText = this.confirmButtonText || "\u786E\u5B9A";
          this.confirmButton.onclick = async () => {
            var _a2, _b;
            if (await ((_a2 = this.onConfirm) == null ? void 0 : _a2.call(this, this.modalInput.value)) !== false) {
              this.remove();
              (_b = this.onClose) == null ? void 0 : _b.call(this, this.modalInput.value);
            }
          };
        }
        this.cancelButton && this.footerContainer.append(this.cancelButton);
        this.confirmButton && this.footerContainer.append(this.confirmButton);
        if (this.type === "simple") {
          this.footerContainer.remove();
        } else if (this.type === "prompt") {
          this.modalInput.focus();
        }
      } else {
        this.footerContainer.append(this.footer);
      }
      $.onresize(this.body, (modal) => {
        this.body.style.maxHeight = window.innerHeight - 100 + "px";
        this.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  class ScriptPanelElement extends IElement {
    constructor() {
      super(...arguments);
      this.separator = el("div", { className: "separator" });
      this.notesContainer = el("div", { className: "notes card" });
      this.configsContainer = el("div", { className: "configs-container card" });
      this.body = el("div", { className: "script-panel-body" });
      this.lockWrapper = el("div", { className: "lock-wrapper" });
    }
    connectedCallback() {
      this.separator.innerText = this.name || "";
      this.append(this.separator, this.notesContainer);
      this.append(this.configsContainer);
      this.append(this.body);
    }
  }
