  const $ = {
    createConfigProxy(script) {
      var _a, _b;
      const proxy = new Proxy(script.cfg, {
        set(target, propertyKey, value) {
          const key = $.namespaceKey(script.namespace, propertyKey);
          $store.set(key, value);
          return Reflect.set(target, propertyKey, value);
        },
        get(target, propertyKey) {
          const value = $store.get($.namespaceKey(script.namespace, propertyKey));
          Reflect.set(target, propertyKey, value);
          return value;
        }
      });
      for (const key in script.configs) {
        if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
          const element = Reflect.get(script.configs, key);
          Reflect.set(proxy, key, $store.get($.namespaceKey(script.namespace, key), element.defaultValue));
        }
      }
      if (script.namespace) {
        proxy.notes = (_b = (_a = script.configs) == null ? void 0 : _a.notes) == null ? void 0 : _b.defaultValue;
      }
      return proxy;
    },
    getAllRawConfigs(scripts) {
      const object = {};
      for (const script of scripts) {
        for (const key in script.configs) {
          if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
            const { label, ...element } = script.configs[key];
            Reflect.set(object, $.namespaceKey(script.namespace, key), {
              label: $.namespaceKey(script.namespace, key),
              ...element
            });
          }
        }
      }
      return object;
    },
    getMatchedScripts(projects, urls) {
      var _a;
      const scripts = [];
      for (const project of projects) {
        for (const key in project.scripts) {
          if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
            const script = project.scripts[key];
            if (project.domains.length === 0 || project.domains.some((d) => urls.some((url) => new URL(url).origin.includes(d)))) {
              if ((_a = script.excludes) == null ? void 0 : _a.some((u) => urls.some((url) => RegExp(u[1]).test(url)))) {
                continue;
              }
              if (script.url.some((u) => urls.some((url) => RegExp(u[1]).test(url)))) {
                scripts.push(script);
              }
            }
          }
        }
      }
      return scripts;
    },
    namespaceKey(namespace, key) {
      return namespace ? namespace + "." + key.toString() : key.toString();
    },
    uuid() {
      return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    },
    random(min, max) {
      return Math.round(Math.random() * (max - min)) + min;
    },
    async sleep(period) {
      return new Promise((resolve) => {
        setTimeout(resolve, period);
      });
    },
    isInBrowser() {
      return typeof window !== "undefined" && typeof window.document !== "undefined";
    },
    elementToRawObject(el2) {
      return {
        innerText: el2 == null ? void 0 : el2.innerText,
        innerHTML: el2 == null ? void 0 : el2.innerHTML,
        textContent: el2 == null ? void 0 : el2.textContent
      };
    },
    onresize(el2, handler) {
      const resize = debounce_1(() => {
        if (el2.parentNode === null) {
          window.removeEventListener("resize", resize);
        } else {
          handler(el2);
        }
      }, 200);
      resize();
      window.addEventListener("resize", resize);
    },
    loadCustomElements(elements) {
      for (const element of elements) {
        const name = $string.humpToTarget(element.name, "-");
        if (customElements.get(name) === void 0) {
          customElements.define(name, element);
        }
      }
    },
    isInTopWindow() {
      return self === top;
    },
    createCenteredPopupWindow(url, winName, opts) {
      const { width, height, scrollbars, resizable } = opts;
      const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
      const TopPosition = screen.height ? (screen.height - height) / 2 : 0;
      const settings = "height=" + height + ",width=" + width + ",top=" + TopPosition + ",left=" + LeftPosition + ",scrollbars=" + (scrollbars ? "yes" : "no") + ",resizable=" + (resizable ? "yes" : "no");
      return window.open(url, winName, settings);
    }
  };
