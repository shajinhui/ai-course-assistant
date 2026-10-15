  async function start$1(startConfig) {
    if ([
      "GM_getTab",
      "GM_saveTab",
      "GM_setValue",
      "GM_getValue",
      "unsafeWindow",
      "GM_listValues",
      "GM_deleteValue",
      "GM_notification",
      "GM_xmlhttpRequest",
      "GM_addValueChangeListener",
      "GM_removeValueChangeListener"
    ].some((api) => typeof Reflect.get(globalThis, api) === "undefined")) {



    }
    const uid = await $store.getTab($const.TAB_UID);
    if (uid === void 0) {
      await $store.setTab($const.TAB_UID, $.uuid());
    }
    startConfig.projects = startConfig.projects.map((p) => {
      for (const key in p.scripts) {
        if (Object.prototype.hasOwnProperty.call(p.scripts, key)) {
          p.scripts[key].cfg = $.createConfigProxy(p.scripts[key]);
        }
      }
      return p;
    });
    const scripts = $.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
    scripts.forEach((script) => {
      var _a;
      script.startConfig = startConfig;
      script.emit("start", startConfig);
      (_a = script.onstart) == null ? void 0 : _a.call(script, startConfig);
    });
    let previousUrl = location.href;
    let urlSync = Promise.resolve();
    const syncPageUrl = () => {
      const currentUrl = location.href;
      urlSync = urlSync.then(async () => {
        const urls = await $store.getTab($const.TAB_URLS) || [];
        const next = Array.from(new Set([...urls.filter((url) => url !== previousUrl), currentUrl]));
        previousUrl = currentUrl;
        if (JSON.stringify(urls) !== JSON.stringify(next)) await $store.setTab($const.TAB_URLS, next);
      }).catch(console.error);
    };
    syncPageUrl();
    let active = false;
    if (document.readyState === "interactive") {
      active = true;
      scripts.forEach((script) => {
        var _a;
        return (_a = script.onactive) == null ? void 0 : _a.call(script, startConfig);
      });
    } else if (document.readyState === "complete") {
      scripts.forEach((script) => {
        var _a;
        return (_a = script.onactive) == null ? void 0 : _a.call(script, startConfig);
      });
      scripts.forEach((script) => {
        var _a;
        return (_a = script.oncomplete) == null ? void 0 : _a.call(script, startConfig);
      });
    }
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "interactive" && active === false) {
        scripts.forEach((script) => {
          var _a;
          script.emit("active", startConfig);
          (_a = script.onactive) == null ? void 0 : _a.call(script, startConfig);
        });
      }
      if (document.readyState === "complete") {
        scripts.forEach((script) => {
          var _a;
          script.emit("complete");
          (_a = script.oncomplete) == null ? void 0 : _a.call(script, startConfig);
        });
        syncPageUrl();
      }
    });
    window.addEventListener("hashchange", () => {
      syncPageUrl();
      scripts.forEach((script) => {
        var _a;
        script.emit("hashchange", startConfig);
        (_a = script.onhashchange) == null ? void 0 : _a.call(script, startConfig);
      });
    });
    history.pushState = addFunctionEventListener(history, "pushState");
    history.replaceState = addFunctionEventListener(history, "replaceState");
    window.addEventListener("pushState", () => {
      syncPageUrl();
      scripts.forEach((script) => {
        var _a;
        script.emit("historychange", "push", startConfig);
        (_a = script.onhistorychange) == null ? void 0 : _a.call(script, "push", startConfig);
      });
    });
    window.addEventListener("replaceState", () => {
      syncPageUrl();
      scripts.forEach((script) => {
        var _a;
        script.emit("historychange", "replace", startConfig);
        (_a = script.onhistorychange) == null ? void 0 : _a.call(script, "replace", startConfig);
      });
    });
    window.addEventListener("popstate", syncPageUrl);
    window.addEventListener("beforeunload", (e) => {
      var _a;
      let prevent;
      for (const script of scripts) {
        script.emit("beforeunload");
        if ((_a = script.onbeforeunload) == null ? void 0 : _a.call(script, startConfig)) {
          prevent = true;
        }
      }
      if (prevent) {
        e.preventDefault();
        e.returnValue = true;
        return true;
      }
    });
  }
