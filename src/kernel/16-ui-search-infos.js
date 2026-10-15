  const transformImgLinkOfQuestion = (question) => {
    const dom = new DOMParser().parseFromString(question, "text/html");
    for (const img of Array.from(dom.querySelectorAll("img"))) {
      img.replaceWith(img.src);
    }
    return dom.body.textContent || "";
  };
  class SearchInfosElement extends IElement {
    constructor() {
      super(...arguments);
      this.infos = [];
      this.question = "";
    }
    connectedCallback() {
      const question = transformImgLinkOfQuestion(this.question || "\u65E0");
      this.append(
        el("div", [el("span", { textContent: question }), $creator.createQuestionTitleExtra(this.question)], (div) => {
          div.style.padding = "4px";
        }),
        el("hr")
      );
      this.append(
        ...this.infos.map((info) => {
          return el("details", { open: true }, [
            el("summary", [el("a", { href: info.homepage, innerText: info.name, target: "_blank" })]),
            ...(info.error ? [el("span", { className: "error" }, [info.error || "\u7F51\u7EDC\u9519\u8BEF\u6216\u8005\u672A\u77E5\u9519\u8BEF"])] : []).concat([
              ...info.results.map((ans) => {
                const title = transformImgLinkOfQuestion(ans[0] || this.question || "\u65E0");
                const answer = transformImgLinkOfQuestion(ans[1] || "\u65E0");
                return el("div", { className: "search-result" }, [
                  el("div", { className: "question" }, [el("span", { textContent: title })]),
                  el("div", { className: "answer" }, [
                    el("span", "\u7B54\u6848\uFF1A"),
                    ...splitAnswer(answer).map((a) => el("code", { textContent: a }))
                  ])
                ]);
              })
            ])
          ]);
        })
      );
      $.onresize(this, (sr) => {
        sr.style.maxHeight = window.innerHeight / 2 + "px";
      });
    }
  }
  const definedCustomElements = [
    ConfigElement,
    ContainerElement,
    HeaderElement,
    ModalElement,
    MessageElement,
    ScriptPanelElement,
    SearchInfosElement,
    DropdownElement
  ];
