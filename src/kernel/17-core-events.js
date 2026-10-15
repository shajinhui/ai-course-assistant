  class CorsEventEmitter {
    constructor() {
      this.eventMap = /* @__PURE__ */ new Map();
    }
    eventKey(name) {
      return "cors.events." + name;
    }
    tempKey(...args) {
      return ["_temp_", ...args].join(".");
    }
    keyOfReturn(id) {
      return this.tempKey("event", id, "return");
    }
    keyOfArguments(id) {
      return this.tempKey("event", id, "arguments");
    }
    keyOfState(id) {
      return this.tempKey("event", id, "state");
    }
    emit(name, args = [], callback) {
      $store.getTab($const.TAB_UID).then((uid) => {
        const id = $.uuid().replace(/-/g, "");
        const key = uid + "." + this.eventKey(name);
        $store.set(this.keyOfState(id), 0);
        $store.set(this.keyOfArguments(id), args);
        const listenerId = $store.addChangeListener(this.keyOfState(id), (pre, curr, remote) => {
          $store.removeChangeListener(listenerId);
          callback == null ? void 0 : callback($store.get(this.keyOfReturn(id)), !!remote);
          $store.delete(this.keyOfState(id));
          $store.delete(this.keyOfReturn(id));
          $store.delete(this.keyOfArguments(id));
        }) || 0;
        $store.set(key, ($store.get(key) ? String($store.get(key)).split(",") : []).concat(id).join(","));
      }).catch(console.error);
    }
    on(name, handler) {
      return new Promise((resolve) => {
        $store.getTab($const.TAB_UID).then((uid) => {
          const key = uid + "." + this.eventKey(name);
          const originId = this.eventMap.get(key);
          if (originId) {
            resolve(originId);
          } else {
            const id = $store.addChangeListener(key, async (pre, curr, remote) => {
              if (remote) {
                if (curr === void 0) {
                  return;
                }
                const list = String(curr).split(",");
                const id2 = list.pop();
                if (id2) {
                  $store.set(this.keyOfReturn(id2), await handler($store.get(this.keyOfArguments(id2))));
                  setTimeout(() => {
                    $store.set(this.keyOfState(id2), 1);
                    $store.set(key, list.join(","));
                  }, 100);
                }
              }
            }) || 0;
            this.eventMap.set(key, id);
            resolve(id);
          }
        }).catch(console.error);
      });
    }
    off(name) {
      const key = this.eventKey(name);
      const originId = this.eventMap.get(key);
      if (originId) {
        this.eventMap.delete(key);
        $store.removeChangeListener(originId);
      }
    }
  }

  const cors = new CorsEventEmitter();
