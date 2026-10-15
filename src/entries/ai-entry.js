// Always provide a direct entry to the user-configured AI panel.
(function() {
  function mountAIEntry() {
    if (self !== top || document.getElementById("ocs-ai-entry")) return;
    // Shadow DOM keeps host-page CSS from leaking into the entry (and vice versa).
    const host = document.createElement("div");
    host.id = "ocs-ai-entry";
    host.style.cssText = "position:fixed;right:22px;bottom:22px;z-index:2147483646;";
    const shadow = host.attachShadow({ mode: "open" });
    const css = document.createElement("style");
    css.textContent = `
      button {
        all: initial;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 0;
        height: 46px;
        padding: 0 15px;
        border-radius: 23px;
        background: #26262b;
        color: #fff;
        font: 600 14px/1 -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
        letter-spacing: .4px;
        white-space: nowrap;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(24, 24, 27, .28);
        transition: gap .25s ease, padding .25s ease, transform .15s ease, box-shadow .2s ease;
      }
      .icon { font-size: 18px; opacity: .9; }
      .label { max-width: 0; overflow: hidden; opacity: 0; transition: max-width .3s ease, opacity .2s ease; }
      button:hover, button:focus-visible { gap: 8px; padding: 0 20px 0 15px; transform: translateY(-2px); box-shadow: 0 10px 26px rgba(24, 24, 27, .34); }
      button:hover .label, button:focus-visible .label { max-width: 140px; opacity: 1; }
      button:active { transform: scale(.97); }
      button:focus-visible { outline: 3px solid rgba(255,255,255,.9); outline-offset: 2px; }
      @media (prefers-color-scheme: dark) { button { background: #e4e4e7; color: #18181b; box-shadow: 0 6px 20px rgba(0, 0, 0, .45); } }
      @media (prefers-reduced-motion: reduce) { button { transition: none; } button:hover, button:focus-visible { transform: none; } }
    `;
    const button = document.createElement("button");
    button.type = "button";
    button.title = "小肥鱼AI · 设置 / 聊天";
    button.setAttribute("aria-label", "小肥鱼AI · 设置 / 聊天");
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = "✦";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "小肥鱼AI";
    button.append(icon, label);
    shadow.append(css, button);
    host.onclick = async () => {
      const render = CommonProject.scripts.render;
      render.cfg.x = Math.max(12, Math.min(render.cfg.x, window.innerWidth - 520));
      render.cfg.y = Math.max(12, Math.min(render.cfg.y, window.innerHeight - 140));
      CommonProject.scripts.render.methods.normal();
      await CommonProject.scripts.render.methods.pin(CommonProject.scripts.ai);
    };
    document.body.append(host);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAIEntry, { once: true });
  } else {
    mountAIEntry();
  }
})();
