  class CommonEventEmitter extends EventEmitter$1 {
    on(eventName, listener) {
      return super.on(eventName.toString(), listener);
    }
    once(eventName, listener) {
      return super.once(eventName.toString(), listener);
    }
    emit(eventName, ...args) {
      return super.emit(eventName.toString(), ...args);
    }
    off(eventName, listener) {
      return super.off(eventName.toString(), listener);
    }
  }
  class BaseScript extends CommonEventEmitter {
  }
  class Script extends BaseScript {
    constructor({
      name,
      namespace,
      url,
      excludes,
      configs,
      hideInPanel,
      onstart,
      onactive,
      oncomplete,
      onbeforeunload,
      onrender,
      onhistorychange,
      methods,
      priority
    }) {
      super();
      this.excludes = [];
      this.cfg = {};
      this.methods = /* @__PURE__ */ Object.create({});
      this.event = new EventEmitter$1();
      this.name = name;
      this.namespace = namespace;
      this.url = url;
      this.excludes = excludes;
      this._configs = configs;
      this.hideInPanel = hideInPanel;
      this.onstart = this.errorHandler(onstart);
      this.onactive = this.errorHandler(onactive);
      this.oncomplete = this.errorHandler(oncomplete);
      this.onbeforeunload = this.errorHandler(onbeforeunload);
      this.onrender = this.errorHandler(onrender);
      this.onhistorychange = this.errorHandler(onhistorychange);
      this.methods = (methods == null ? void 0 : methods.bind(this)()) || /* @__PURE__ */ Object.create({});
      this.priority = priority != null ? priority : 0;
      if (this.methods) {
        for (const key in methods) {
          if (Reflect.has(this.methods, key) && typeof this.methods[key] !== "function") {
            Reflect.set(this.methods, key, this.errorHandler(this.methods[key]));
          }
        }
      }
    }
    get configs() {
      if (!this._resolvedConfigs) {
        this._resolvedConfigs = typeof this._configs === "function" ? this._configs() : this._configs;
      }
      return this._resolvedConfigs;
    }
    set configs(c) {
      this._configs = c;
    }
    onConfigChange(key, handler) {
      const _key = $.namespaceKey(this.namespace, key.toString());
      return $store.addChangeListener(_key, (pre, curr, remote) => {
        handler(curr, pre, !!remote);
      });
    }
    offConfigChange(listener) {
      $store.removeChangeListener(listener);
    }
    fullName() {
      return this.projectName ? `${this.projectName}-${this.name}` : this.name;
    }
    errorHandler(func) {
      return (...args) => {
        try {
          return func == null ? void 0 : func.apply(this, args);
        } catch (err) {
          console.error(err);
          if (err instanceof Error) {
            this.emit("scripterror", err.message);
          } else {
            this.emit("scripterror", String(err));
          }
        }
      };
    }
  }
  const minimizeSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>';
  const expandSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/></svg>';
