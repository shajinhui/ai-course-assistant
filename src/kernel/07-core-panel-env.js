  const panel = el("div");
  const root = panel.attachShadow({ mode: "closed" });
  const $elements = {
    panel,
    root,
    messageContainer: el("div", { className: "message-container" }),
    extraMenuBar: el("div", { className: "extra-menu-bar" }),
    tooltip: el("div", { className: "tooltip" })

  };
  const $gm = {
    unsafeWindow: typeof globalThis.unsafeWindow === "undefined" ? globalThis.window : globalThis.unsafeWindow,
    getInfos() {
      return typeof GM_info === "undefined" ? void 0 : GM_info;
    },
    getTab(callback) {
      return typeof GM_getTab === "undefined" ? void 0 : GM_getTab(callback);
    },
    notification(content, options) {
      var _a;
      const { onclick, ondone, important, duration = 30, silent = true, extraTitle = "" } = options || {};
      const { icon, name } = ((_a = $gm.getInfos()) == null ? void 0 : _a.script) || {};
      GM_notification({
        title: name + (extraTitle ? "-" + extraTitle : ""),
        text: content,
        image: icon || "",
        highlight: important,
        onclick,
        ondone,
        silent,
        timeout: duration * 1e3
      });
    },
    getMetadataFromScriptHead(key) {
      var _a, _b;
      const metadataString = (_a = this.getInfos()) == null ? void 0 : _a.scriptMetaStr;
      if (!metadataString) {
        return [];
      } else {
        const metadata = ((_b = metadataString.match(/\/\/\s+==UserScript==([\s\S]+)\/\/\s+==\/UserScript==/)) == null ? void 0 : _b[1]) || "";
        const metadataList = (metadata.match(/\/\/\s+@(.+?)\s+(.*?)(?:\n|$)/g) || []).map((line) => {
          const words = line.match(/[\S]+/g) || [];
          return {
            key: (words[1] || "").replace("@", ""),
            value: words.slice(2).join(" ")
          };
        });
        return metadataList.filter((l) => l.key === key).map((l) => l.value);
      }
    }
  };
  let popupWin;
  window.addEventListener("beforeunload", () => {
    popupWin == null ? void 0 : popupWin.close();
  });
