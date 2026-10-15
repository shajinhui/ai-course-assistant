  const ListOfActions = [
    "click",
    "check",
    "dblclick",
    "bringToFront",
    "dragAndDrop",
    "fill",
    "focus",
    "hover",
    "screenshot",
    "selectOption",
    "setInputFiles",
    "tap",
    "press",
    "reload",
    "waitForRequest",
    "waitForResponse",
    "waitForSelector"
  ];
  class RemotePlaywright {
    static async getCurrentPage(logger = console.debug) {
      if (this.currentPage) {
        return this.currentPage;
      }
      if (!this.authToken) {
        try {
          this.authToken = await request("http://localhost:15319/get-actions-key", {
            type: "GM_xmlhttpRequest",
            method: "get",
            responseType: "text"
          });
          this.currentPage = this.createRemotePage(this.authToken, logger);
          return this.currentPage;
        } catch (e) {
          console.log(e);
          return void 0;
        }
      } else {
        this.currentPage = this.createRemotePage(this.authToken, logger);
        return this.currentPage;
      }
    }
    static createRemotePage(authToken, logger) {
      const page = /* @__PURE__ */ Object.create({});
      for (const property of ListOfActions) {
        Reflect.set(page, property, async (...args) => {
          var _a, _b, _c;
          let data;
          if (property === "click" && args[0] instanceof Element) {
            args[0].scrollIntoView();
            await $.sleep(1e3);
            const rect = args[0].getBoundingClientRect();
            data = {
              page: window.location.href,
              property: "mouse.click",
              args: [
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                {
                  button: (_a = args[1]) == null ? void 0 : _a.button,
                  clickCount: (_b = args[1]) == null ? void 0 : _b.clickCount,
                  delay: (_c = args[1]) == null ? void 0 : _c.delay
                }
              ]
            };
          }
          if (!data) {
            data = { page: window.location.href, property, args };
          }
          logger == null ? void 0 : logger("[RP]: ", JSON.stringify(data));
          try {
            const res = await request("/ocs-script-actions", {
              type: "fetch",
              method: "post",
              responseType: ["waitForRequest", "waitForResponse", "reload"].includes(property) ? "json" : "text",
              headers: {
                "auth-token": authToken
              },
              data
            });
            return res;
          } catch (e) {
            logger == null ? void 0 : logger("[RP-ERROR]: ", JSON.stringify(data));
            return void 0;
          }
        });
      }
      console.log(page);
      return page;
    }
  }
  RemotePlaywright.authToken = "";
  RemotePlaywright.currentPage = void 0;
