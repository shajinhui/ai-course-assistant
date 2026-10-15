  function addFunctionEventListener(obj, type) {
    const origin = obj[type];
    return function(...args) {
      const res = origin.apply(this, args);
      const e = new Event(type.toString());
      e.arguments = args;
      window.dispatchEvent(e);
      return res;
    };
  }
  function el(tagName, attrsOrChildren, childrenOrHandler) {
    const element = document.createElement(tagName);
    if (attrsOrChildren) {
      if (Array.isArray(attrsOrChildren)) {
        element.append(...attrsOrChildren);
      } else if (typeof attrsOrChildren === "string") {
        element.append(attrsOrChildren);
      } else {
        const attrs = attrsOrChildren;
        for (const key in attrs) {
          if (Object.prototype.hasOwnProperty.call(attrs, key)) {
            if (key === "style") {
              Object.assign(element.style, attrs[key]);
            } else {
              const value = attrs[key];
              Reflect.set(element, key, value);
            }
          }
        }
      }
    }
    if (childrenOrHandler) {
      if (typeof childrenOrHandler === "function") {
        childrenOrHandler.call(element, element);
      } else if (Array.isArray(childrenOrHandler)) {
        element.append(...childrenOrHandler);
      } else if (typeof childrenOrHandler === "string") {
        element.append(childrenOrHandler);
      }
    }
    return element;
  }
  function $el(selector, root2 = window.document) {
    const el2 = root2.querySelector(selector);
    return el2 === null ? void 0 : el2;
  }
  function $$el(selector, root2 = window.document) {
    return Array.from(root2.querySelectorAll(selector));
  }
  function enableElementDraggable(header, target, ondrag) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    header.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      target.style.top = Math.max(target.offsetTop - pos2, 10) + "px";
      target.style.left = target.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      ondrag == null ? void 0 : ondrag();
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
