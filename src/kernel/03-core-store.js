  class LocalStoreChangeEvent extends Event {
    constructor() {
      super(...arguments);
      this.key = "";
    }
  }
  const _ObjectStoreProvider = class {
    get(key, defaultValue) {
      var _a;
      return (_a = Reflect.get(_ObjectStoreProvider._source.store, key)) != null ? _a : defaultValue;
    }
    set(key, value) {
      var _a;
      const pre = Reflect.get(_ObjectStoreProvider._source.store, key);
      Reflect.set(_ObjectStoreProvider._source.store, key, value);
      (_a = _ObjectStoreProvider.storeListeners.get(key)) == null ? void 0 : _a.forEach((lis) => lis(value, pre));
    }
    delete(key) {
      Reflect.deleteProperty(_ObjectStoreProvider._source.store, key);
    }
    list() {
      return Object.keys(_ObjectStoreProvider._source.store);
    }
    async getTab(key) {
      return Reflect.get(_ObjectStoreProvider._source.tab, key);
    }
    async setTab(key, value) {
      var _a;
      Reflect.set(_ObjectStoreProvider._source.tab, key, value);
      (_a = _ObjectStoreProvider.tabListeners.get(key)) == null ? void 0 : _a.forEach((lis) => lis(value, this.getTab(key)));
    }
    addChangeListener(key, listener) {
      const listeners = _ObjectStoreProvider.storeListeners.get(key) || [];
      listeners.push(listener);
      _ObjectStoreProvider.storeListeners.set(key, listeners);
    }
    removeChangeListener(listener) {
      _ObjectStoreProvider.tabListeners.forEach((lis, key) => {
        const index = lis.findIndex((l) => l === listener);
        if (index !== -1) {
          lis.splice(index, 1);
          _ObjectStoreProvider.tabListeners.set(key, lis);
        }
      });
    }
    addTabChangeListener(key, listener) {
      const listeners = _ObjectStoreProvider.tabListeners.get(key) || [];
      listeners.push(listener);
      _ObjectStoreProvider.tabListeners.set(key, listeners);
    }
    removeTabChangeListener(key, listener) {
      const listeners = _ObjectStoreProvider.tabListeners.get(key) || [];
      const index = listeners.findIndex((l) => l === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        _ObjectStoreProvider.tabListeners.set(key, listeners);
      }
    }
  };
  let ObjectStoreProvider = _ObjectStoreProvider;
  ObjectStoreProvider._source = { store: {}, tab: {} };
  ObjectStoreProvider.storeListeners = /* @__PURE__ */ new Map();
  ObjectStoreProvider.tabListeners = /* @__PURE__ */ new Map();
  class GMStoreProvider {
    constructor() {
      if (self === top && typeof globalThis.GM_listValues !== "undefined") {
        for (const val of GM_listValues()) {
          if (val.startsWith("_tab_change_")) {
            GM_deleteValue(val);
          }
        }
      }
    }
    getTabChangeHandleKey(tabUid, key) {
      return `_tab_change_${tabUid}_${key}`;
    }
    get(key, defaultValue) {
      return GM_getValue(key, defaultValue);
    }
    set(key, value) {
      GM_setValue(key, value);
    }
    delete(key) {
      GM_deleteValue(key);
    }
    list() {
      return GM_listValues();
    }
    getTab(key) {
      return new Promise((resolve, reject) => {
        GM_getTab((tab = {}) => resolve(Reflect.get(tab, key)));
      });
    }
    setTab(key, value) {
      return new Promise((resolve, reject) => {
        GM_getTab((tab = {}) => {
          Reflect.set(tab, key, value);
          GM_saveTab(tab);
          this.set(this.getTabChangeHandleKey(Reflect.get(tab, $const.TAB_UID), key), value);
          resolve();
        });
      });
    }
    addChangeListener(key, listener) {
      return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
        listener(pre, curr, remote);
      });
    }
    removeChangeListener(listenerId) {
      if (typeof listenerId === "number") {
        GM_removeValueChangeListener(listenerId);
      }
    }
    async addTabChangeListener(key, listener) {
      const uid = await this.getTab($const.TAB_UID);
      return GM_addValueChangeListener(this.getTabChangeHandleKey(uid, key), (_, pre, curr) => {
        listener(curr, pre);
      });
    }
    removeTabChangeListener(key, listener) {
      return this.removeChangeListener(listener);
    }
  }
  const $store = typeof globalThis.unsafeWindow === "undefined" ? new ObjectStoreProvider() : new GMStoreProvider();
