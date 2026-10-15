  const state$3 = {
    study: {
      videojs: /* @__PURE__ */ Object.create({}),
      hacked: false,
      aiConfigUnsetMessage: void 0,
      playbackRateWarningListenerId: 0
    }
  };
  const CXProject = Project.create({
    name: "\u8D85\u661F\u5B66\u4E60\u901A",
    domains: [
      "chaoxing.com",
      "edu.cn",
      "org.cn",
      "xueyinonline.com",
      "hnsyu.net",
      "qutjxjy.cn",
      "ynny.cn",
      "hnvist.cn",
      "fjlecb.cn",
      "gdhkmooc.com",
      "cugbonline.cn"
    ],
    scripts: {
      guide: new Script({
        name: "\u4F7F\u7528\u63D0\u793A",
        url: [

        ],
        namespace: "cx.guide",
        configs: {
          notes: {
            defaultValue: `\u8BF7\u624B\u52A8\u8FDB\u5165\u89C6\u9891\u3001\u4F5C\u4E1A\u3001\u8003\u8BD5\u9875\u9762\uFF0C\u811A\u672C\u4F1A\u81EA\u52A8\u8FD0\u884C\u3002`
          }
        },
        oncomplete() {
          CommonProject.scripts.render.methods.pin(this);
        }
      }),
      study: new Script({
        name: "\u8BFE\u7A0B\u5B66\u4E60",
        namespace: "cx.new.study",
        url: [
          ["\u4EFB\u52A1\u70B9\u9875\u9762", "/knowledge/cards"],
          ["\u9605\u8BFB\u4EFB\u52A1\u70B9", "/readsvr/book/mooc"]
        ],
        configs: {
          notes: {
            defaultValue: $creator.notes([
              "自动答题前请在「AI 聊天」配置 AI 接口。",
              ["\u4EFB\u52A1\u70B9\u4E0D\u662F\u987A\u5E8F\u6267\u884C\uFF0C\u5982\u679C\u67D0\u4E00\u4E2A\u4EFB\u52A1\u6CA1\u6709\u52A8", "\u8BF7\u67E5\u770B\u662F\u5426\u6709\u5176\u4ED6\u4EFB\u52A1\u6B63\u5728\u5B66\u4E60\uFF0C\u8010\u5FC3\u7B49\u5F85\u5373\u53EF\u3002"],
              "闯关模式中，AI 未完成的题目需要自己完成才能解锁章节。",
              "\u4E0D\u8981\u6700\u5C0F\u5316\u6D4F\u89C8\u5668\uFF0C\u53EF\u80FD\u5BFC\u81F4\u811A\u672C\u6682\u505C\u3002",
              "\u811A\u672C\u8BE6\u60C5\u8FD0\u884C\u65E5\u5FD7\u8BF7\u524D\u5F80\uFF1A\u540E\u53F0-\u65E5\u5FD7 \u67E5\u770B"
            ]).outerHTML
          },
          playbackRate,
          volume,
          videoQuizStrategy: {
            label: "\u89C6\u9891\u5185\u9898\u76EE",
            tag: "select",
            options: [
              ["ai", "AI 答题"],
              ["ignore", "\u5FFD\u7565"]
            ],
            attrs: {
              title: "视频弹题通过 AI 解答；AI 无有效答案时保留题目供手动处理。也可以选择忽略弹题。"
            },
            defaultValue: "ai"
          },
          restudy: {
            label: "\u590D\u4E60\u6A21\u5F0F",
            attrs: { title: "\u5DF2\u7ECF\u5B8C\u6210\u7684\u89C6\u9891\u7EE7\u7EED\u5B66\u4E60\uFF0C\u5E76\u4ECE\u5F53\u524D\u7684\u7AE0\u8282\u5F80\u4E0B\u5F00\u59CB\u5B66\u4E60", type: "checkbox" },
            defaultValue: false
          },
          backToFirstWhenFinish: {
            label: "\u5B8C\u6210\u5168\u90E8\u540E\u91CD\u65B0\u5B66\u4E60",
            attrs: {
              type: "checkbox",
              title: "\u5F53\u7AE0\u8282\u5DF2\u7ECF\u5B66\u4E60\u5B8C\u6210\u81F3\u6700\u540E\u4E00\u7AE0\u65F6\uFF0C\u8DF3\u8F6C\u5230\u7B2C\u4E00\u4E2A\u7AE0\u8282\u91CD\u65B0\u5F00\u59CB\u5B66\u4E60\u3002"
            },
            defaultValue: false
          },
          autoNextPage: {
            label: "\u81EA\u52A8\u4E0B\u4E00\u7AE0",
            attrs: { type: "checkbox" },
            defaultValue: true
          },
          reloadVideoWhenError: {
            label: "\u89C6\u9891\u52A0\u8F7D\u9519\u8BEF\u65F6\u81EA\u52A8\u5237\u65B0",
            attrs: { type: "checkbox" },
            defaultValue: false
          },
          showTextareaWhenEdit: {
            label: "\u7F16\u8F91\u65F6\u663E\u793A\u81EA\u5B9A\u4E49\u7F16\u8F91\u6846",
            attrs: {
              type: "checkbox",
              title: "\u8D85\u661F\u9ED8\u8BA4\u7981\u6B62\u5728\u7F16\u8F91\u6846\u4E2D\u590D\u5236\u7C98\u8D34\uFF0C\u5F00\u542F\u6B64\u9009\u9879\u53EF\u4EE5\u5728\u6587\u672C\u6846\u7F16\u8F91\u65F6\u751F\u6210\u4E00\u4E2A\u81EA\u5B9A\u4E49\u7F16\u8F91\u6846\u8FDB\u884C\u7F16\u8F91\uFF0C\u811A\u672C\u4F1A\u5C06\u5185\u5BB9\u540C\u6B65\u5230\u7F16\u8F91\u6846\u4E2D\u3002"
            },
            defaultValue: true
          },
          notifyWhenHasFaceRecognition: {
            label: "\u5F53\u6709\u4EBA\u8138\u9A8C\u8BC1\u65F6\u901A\u77E5\u6211",
            attrs: {
              type: "checkbox"
            },
            defaultValue: true
          },
          enableMedia: {
            separator: "\u4EFB\u52A1\u70B9\u5F00\u5173",
            label: "\u5F00\u542F-\u89C6\u9891/\u97F3\u9891\u81EA\u52A8\u64AD\u653E",
            attrs: { type: "checkbox", title: "\u5F00\u542F\uFF1A\u97F3\u9891\u548C\u89C6\u9891\u7684\u81EA\u52A8\u64AD\u653E" },
            defaultValue: true
          },
          enablePPT: {
            label: "\u5F00\u542F-PPT/\u4E66\u7C4D\u81EA\u52A8\u5B8C\u6210",
            attrs: { type: "checkbox", title: "\u5F00\u542F\uFF1APPT/\u4E66\u7C4D\u81EA\u52A8\u7FFB\u9605" },
            defaultValue: true
          },
          enableChapterTest: {
            label: "\u5F00\u542F-\u7AE0\u8282\u6D4B\u8BD5\u81EA\u52A8\u7B54\u9898",
            attrs: { type: "checkbox", title: "\u5F00\u542F\uFF1A\u7AE0\u8282\u6D4B\u8BD5\u81EA\u52A8\u7B54\u9898" },
            defaultValue: true
          }
        },
        onrender({ panel: panel2 }) {
          var _a;
          if (!OpenAIClient.isConfigured()) {
            const setting = el("button", { className: "base-style-button-secondary" }, "AI 聊天");
            setting.onclick = () => CommonProject.scripts.render.methods.pin(CommonProject.scripts.ai);
            if (state$3.study.aiConfigUnsetMessage === void 0) {
              state$3.study.aiConfigUnsetMessage = $message("warn", {
                content: el("span", {}, ["AI 接口尚未配置，无法自动答题，请打开 ", setting, " 填写接口设置。"]),
                duration: 0
              });
            }
          }
          this.offConfigChange(state$3.study.playbackRateWarningListenerId);
          state$3.study.playbackRateWarningListenerId = this.onConfigChange("playbackRate", (playbackRate2) => {
            if (playbackRate2 > 3) {
              $modal("alert", {
                title: "\u26A0\uFE0F\u9AD8\u500D\u901F\u8B66\u544A",
                content: $creator.notes(["\u9AD8\u500D\u901F\u53EF\u80FD\u5BFC\u81F4\u5B66\u4E60\u8BB0\u5F55\u6E05\u7A7A", "\u8D85\u661F\u540E\u53F0\u53EF\u4EE5\u770B\u5230\u5B66\u4E60\u65F6\u957F\uFF0C\u8BF7\u8C28\u614E\u8BBE\u7F6E\u2757"])
              });
            }
          }) || 0;
        },
        async oncomplete() {
          if (/\/readsvr\/book\/mooc/.test(location.href)) {
            $console.log("\u6B63\u5728\u5B8C\u6210\u4E66\u7C4D/PPT...");
            setTimeout(() => {
              readweb.goto(epage);
            }, 5e3);
            return;
          }
          if (/\/knowledge\/cards/.test(location.href)) {
            const updateMediaState = () => {
              if (top.currentMedia) {
                top.currentMedia.playbackRate = parseFloat(this.cfg.playbackRate.toString());
                top.currentMedia.volume = this.cfg.volume;
              }
            };
            this.onConfigChange("playbackRate", updateMediaState);
            this.onConfigChange("volume", updateMediaState);
            await study({
              ...this.cfg,
              playbackRate: parseFloat(this.cfg.playbackRate.toString()),
              workOptions: CommonProject.scripts.settings.methods.getWorkOptions()
            });
          }
        }
      }),


      copyHack: new Script({
        name: "\u5C4F\u853D\u590D\u5236\u7C98\u8D34\u9650\u5236",
        hideInPanel: true,
        url: [["\u6240\u6709\u9875\u9762", /.*/]],
        methods() {
          return {
            hackEditorPaste() {
              var _a, _b;
              try {
                const instants = ((_b = (_a = $gm.unsafeWindow) == null ? void 0 : _a.UE) == null ? void 0 : _b.instants) || [];
                for (const key in instants) {
                  const ue = instants[key];
                  if (ue == null ? void 0 : ue.textarea) {
                    ue.body.addEventListener("click", async () => {
                      if (CXProject.scripts.study.cfg.showTextareaWhenEdit) {
                        const defaultText = el("span", { innerHTML: ue.textarea.value }).textContent;
                        $modal("prompt", {
                          content: "\u8BF7\u5728\u6B64\u6587\u672C\u6846\u8FDB\u884C\u7F16\u8F91\uFF0C\u9632\u6B62\u8D85\u661F\u65E0\u6CD5\u590D\u5236\u7C98\u8D34\u3002(\u5982\u9700\u5173\u95ED\u8BF7\u524D\u5F80\u8BBE\u7F6E: \u8BFE\u7A0B\u5B66\u4E60-\u7F16\u8F91\u65F6\u663E\u793A\u81EA\u5B9A\u4E49\u7F16\u8F91\u6846)",
                          width: 800,
                          inputDefaultValue: defaultText || "",
                          modalInputType: "textarea",
                          onConfirm: (val = "") => {
                            ue.setContent(
                              val.split("\n").map((line) => `<p>${line}</p>`).join("")
                            );
                          }
                        });
                      }
                    });
                    if ($gm.unsafeWindow.editorPaste) {
                      ue.removeListener("beforepaste", $gm.unsafeWindow.editorPaste);
                    }
                    if ($gm.unsafeWindow.myEditor_paste) {
                      ue.removeListener("beforepaste", $gm.unsafeWindow.myEditor_paste);
                    }
                  }
                }
              } catch {
              }
            }
          };
        },
        oncomplete() {
          const hackInterval = setInterval(() => {
            if (typeof $gm.unsafeWindow.UE !== "undefined") {
              clearInterval(hackInterval);
              this.methods.hackEditorPaste();
              console.log("\u5DF2\u89E3\u9664\u8F93\u5165\u6846\u65E0\u6CD5\u590D\u5236\u7C98\u8D34\u9650\u5236");
            }
          }, 500);
        }
      }),
      studyDispatcher: new Script({
        name: "\u8BFE\u7A0B\u5B66\u4E60\u8C03\u5EA6\u5668",
        url: [["\u8BFE\u7A0B\u5B66\u4E60\u9875\u9762", "/mycourse/studentstudy"]],
        namespace: "cx.new.study-dispatcher",
        hideInPanel: true,
        async oncomplete() {
          $menu("\u{1F5A5}\uFE0F", { scriptPanelLink: CXProject.scripts.study });
          $menu("\u2699\uFE0F", { scriptPanelLink: CommonProject.scripts.settings });
          $menu("\u{1F30F}", { scriptPanelLink: CommonProject.scripts.workResults });
          $menu("\u{1F4C4}", { scriptPanelLink: BackgroundProject.scripts.console });
          $menu("\u{1F4E5}", { scriptPanelLink: BackgroundProject.scripts.update });
          const restudy2 = CXProject.scripts.study.cfg.restudy;
          CommonProject.scripts.render.methods.pin(CXProject.scripts.study);
          if (!restudy2) {
            const params = new URLSearchParams(window.location.href);
            const mooc = params.get("mooc2");
            if (mooc === null) {
              params.set("mooc2", "1");
              window.location.replace(decodeURIComponent(params.toString()));
              return;
            }
            let chapters = await CXAnalyses.waitForChapterInfos();
            chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);
            if (chapters.length === 0) {
              $message("warn", { content: "\u9875\u9762\u4EFB\u52A1\u70B9\u6570\u91CF\u4E3A\u7A7A! \u8BF7\u5237\u65B0\u91CD\u8BD5!" });
            } else {
              const params2 = new URLSearchParams(window.location.href);
              const courseId = params2.get("courseId");
              const classId = params2.get("clazzid");
              setTimeout(() => {
                if ($$el(`.posCatalog_active[id="cur${chapters[0].chapterId}"]`).length === 0) {
                  $gm.unsafeWindow.getTeacherAjax(courseId, classId, chapters[0].chapterId);
                }
              }, 1e3);
            }
          }
        }
      }),
      cxSecretFontRecognize: new Script({
        name: "\u7E41\u4F53\u5B57\u8BC6\u522B",
        hideInPanel: true,
        url: [
          ["\u9898\u76EE\u9875\u9762", "work/doHomeWorkNew"],
          ["\u8003\u8BD5\u6574\u5377\u9884\u89C8", "/mooc2/exam/preview"],
          ["\u4F5C\u4E1A", "/mooc2/work/dowork"]
        ],
        async oncomplete() {
          await mappingRecognize();
        }
      })
    }
  });
  function workOrExam$1(type = "work", { period, thread, redundanceWordsText, answerSeparators, answerMatchMode }) {
    $message("info", { content: `\u5F00\u59CB${type === "work" ? "\u4F5C\u4E1A" : "\u8003\u8BD5"}` });
    CommonProject.scripts.workResults.methods.init({
      questionPositionSyncHandlerType: "cx"
    });
    const workOrExamQuestionTitleTransform = (titles) => {
      const optimizationTitle = titles.map((titleElement) => {
        if (titleElement) {
          const titleCloneEl = titleElement.cloneNode(true);
          const childNodes = titleCloneEl.childNodes;
          childNodes[0].remove();
          childNodes[0].remove();
          return optimizationElementWithImage(titleCloneEl).innerText;
        }
        return "";
      }).join(",");
      return removeRedundantWords(
        StringUtils.of(optimizationTitle).nowrap().nospace().toString().trim(),
        redundanceWordsText.split("\n")
      );
    };
    const worker = new OCSWorker({
      root: ".questionLi",
      elements: {
        title: [
          (root2) => $el("h3", root2)
        ],
        options: ".answerBg .answer_p, .textDIV, .eidtDiv",
        type: type === "exam" ? 'input[name^="type"]' : 'input[id^="answertype"]',
        lineAnswerInput: ".line_answer input[name^=answer]",
        lineSelectBox: ".line_answer_ct .selectBox ",
        reading: ".reading_answer",
        filling: ".filling_answer"
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerMatchMode,
      answerer: async (elements, ctx) => {
        if (elements.title) {
          const title = workOrExamQuestionTitleTransform(elements.title);
          if (title) {
            const typeInput = elements.type[0];
            await $.sleep((period != null ? period : 3) * 1e3);
            return searchQuestionAnswers({
              type: (typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0) || "unknown",
              title,
              options: ctx.elements.options.map((o) => o.innerText).join("\n")
            });
          } else {
            throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
          }
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: async (ctx) => {
        var _a;
        const { elements, searchInfos } = ctx;
        const typeInput = elements.type[0];
        const type2 = getQuestionType(parseInt(typeInput.value));
        if (type2 && (type2 === "completion" || type2 === "multiple" || type2 === "judgement" || type2 === "single")) {
          const resolver = defaultQuestionResolve(ctx)[type2];
          return await resolver(
            searchInfos,
            elements.options.map((option) => optimizationElementWithImage(option)),
            async (type3, answer, option) => {
              var _a2, _b, _c;
              if (type3 === "judgement" || type3 === "single" || type3 === "multiple") {
                if ((option == null ? void 0 : option.parentElement) && $$el('[class*="check_answer"]', option.parentElement).length === 0) {
                  option.click();
                  await $.sleep(500);
                }
              } else if (type3 === "completion" && answer.trim()) {
                const text = option == null ? void 0 : option.querySelector("textarea");
                const textareaFrame = option == null ? void 0 : option.querySelector("iframe");
                if (text) {
                  text.value = answer;
                }
                if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                  textareaFrame.contentDocument.body.innerHTML = answer;
                }
                if ((_a2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _a2.parentElement) {
                  (_c = $el("[onclick*=saveQuestion]", (_b = option == null ? void 0 : option.parentElement) == null ? void 0 : _b.parentElement)) == null ? void 0 : _c.click();
                  await $.sleep(500);
                }
              }
            }
          );
        } else if (type2 && type2 === "line") {
          for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
            let ans = answers;
            if (ans.length === 1) {
              ans = splitAnswer(ans[0]);
            }
            if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
              for (let index = 0; index < elements.lineSelectBox.length; index++) {
                const box = elements.lineSelectBox[index];
                if (ans[index]) {
                  (_a = $el(`li[data=${ans[index]}] a`, box)) == null ? void 0 : _a.click();
                  await $.sleep(200);
                }
              }
              return { finish: true };
            }
          }
          return { finish: false };
        } else if (type2 && type2 === "fill") {
          return readerAndFillHandle(searchInfos, elements.filling);
        } else if (type2 && type2 === "reader") {
          return readerAndFillHandle(searchInfos, elements.reading);
        }
        return { finish: false };
      },
      onResultsUpdate(current, _, res) {
        var _a;
        CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, workOrExamQuestionTitleTransform));
        CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
      }
    });
    worker.doWork().then(() => {
      $message("info", { content: "\u4F5C\u4E1A/\u8003\u8BD5\u5B8C\u6210\uFF0C\u8BF7\u81EA\u884C\u68C0\u67E5\u540E\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002", duration: 0 });
      worker.emit("done");
    }).catch((err) => {
      console.error(err);
      $message("error", { content: "\u7B54\u9898\u7A0B\u5E8F\u53D1\u751F\u9519\u8BEF : " + err.message });
    });
    return worker;
  }
  async function mappingRecognize(doc = document) {
    var _a, _b;
    let typrMapping = /* @__PURE__ */ Object.create({});
    try {
      top.typrMapping = top.typrMapping || await loadTyprMapping();
      typrMapping = top.typrMapping;
    } catch {
      typrMapping = await loadTyprMapping();
    }
    const fontFaceEl = Array.from(doc.head.querySelectorAll("style")).find(
      (style) => {
        var _a2;
        return (_a2 = style.textContent) == null ? void 0 : _a2.includes("font-cxsecret");
      }
    );
    const base64ToUint8Array = (base64) => {
      const data = window.atob(base64);
      const buffer = new Uint8Array(data.length);
      for (let i = 0; i < data.length; ++i) {
        buffer[i] = data.charCodeAt(i);
      }
      return buffer;
    };
    const fontMap = typrMapping;
    if (fontFaceEl && Object.keys(fontMap).length > 0) {
      const font = (_b = (_a = fontFaceEl.textContent) == null ? void 0 : _a.match(/base64,([\w\W]+?)'/)) == null ? void 0 : _b[1];
      if (font) {
        $console.log("\u6B63\u5728\u8BC6\u522B\u7E41\u4F53\u5B57");
        const code = typr_js.parse(base64ToUint8Array(font));
        const match = {};
        for (let i = 19968; i < 40870; i++) {
          const Glyph = typr_js.U.codeToGlyph(code, i);
          if (!Glyph)
            continue;
          const path = typr_js.U.glyphToPath(code, Glyph);
          const hex = md5(JSON.stringify(path)).slice(24);
          match[i.toString()] = fontMap[hex];
        }
        const fonts = CXAnalyses.getSecretFont(doc);
        fonts.forEach((el2, index) => {
          let html = el2.innerHTML;
          for (const key in match) {
            const word = String.fromCharCode(parseInt(key));
            const value = String.fromCharCode(match[key]);
            while (html.indexOf(word) !== -1) {
              html = html.replace(word, value);
            }
          }
          el2.innerHTML = html;
          el2.classList.remove("font-cxsecret");
        });
        $console.log("\u8BC6\u522B\u7E41\u4F53\u5B57\u5B8C\u6210\u3002");
      } else {
        $console.log("\u672A\u68C0\u6D4B\u5230\u7E41\u4F53\u5B57\u3002");
      }
    }
  }
  async function loadTyprMapping() {
    try {
      $console.log("\u6B63\u5728\u52A0\u8F7D\u7E41\u4F53\u5B57\u5E93\u3002");

    } catch (err) {
      $console.error("\u8F7D\u7E41\u4F53\u5B57\u5E93\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5\uFF1A", String(err));
    }
  }
  const CXAnalyses = {
    isInSpecialMode() {
      return Array.from((top == null ? void 0 : top.document.querySelectorAll(".catalog_points_sa,.catalog_points_er")) || []).length !== 0;
    },
    async isStuckInBreakingMode() {
      if (this.isInSpecialMode()) {
        const chapter = top == null ? void 0 : top.document.querySelector(".posCatalog_active");
        if (chapter) {
          const id = chapter.getAttribute("id");
          if (id) {
            const counter = await $store.getTab("chapter_counter") || /* @__PURE__ */ Object.create({});
            let count = Reflect.get(counter, id);
            count = count ? count + 1 : 1;
            Reflect.set(counter, id, count);
            let res = false;
            if (count >= 3) {
              Reflect.set(counter, id, 1);
              res = true;
            }
            await $store.setTab("chapter_counter", counter);
            return res;
          }
        }
      }
      return false;
    },
    isInFinalTab() {
      const tabs = Array.from((top == null ? void 0 : top.document.querySelectorAll(".prev_ul li")) || []);
      return tabs.length && tabs[tabs.length - 1].classList.contains("active");
    },
    isInFinalChapter() {
      var _a;
      return (_a = Array.from((top == null ? void 0 : top.document.querySelectorAll(".posCatalog_select")) || []).pop()) == null ? void 0 : _a.classList.contains("posCatalog_active");
    },
    isFinishedAllChapters() {
      return this.getChapterInfos().every((chapter) => chapter.unFinishCount === 0);
    },
    getChapterInfos() {
      return Array.from((top == null ? void 0 : top.document.querySelectorAll('[onclick^="getTeacherAjax"]')) || []).map((el2) => {
        var _a, _b, _c;
        return {
          chapterId: (_b = (_a = el2.getAttribute("onclick")) == null ? void 0 : _a.match(/\('(.*)','(.*)','(.*)'\)/)) == null ? void 0 : _b[3],
          unFinishCount: parseInt(((_c = el2.parentElement.querySelector(".jobUnfinishCount")) == null ? void 0 : _c.value) || "0")
        };
      });
    },
    waitForChapterInfos(timeout = 10) {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const res = this.getChapterInfos();
          if (res.length > 0) {
            clearInterval(interval);
            clearInterval(to);
            resolve(res);
          }
        }, 1e3);
        const to = setTimeout(() => {
          clearInterval(interval);
          resolve([]);
        }, timeout * 1e3);
      });
    },
    getSecretFont(doc = document) {
      return Array.from(doc.querySelectorAll(".font-cxsecret")).map((font) => {
        const after = font.querySelector(".after");
        return after === null ? font : after;
      });
    }
  };
  function rateHack() {
    state$3.study.hacked = false;
    let dragCount = 0;
    try {
      hack();
      window.document.addEventListener("readystatechange", hack);
      window.addEventListener("load", hack);
    } catch (e) {
      console.error(e);
    }
    function hack() {
      const videojs = $gm.unsafeWindow.videojs;
      const Ext = $gm.unsafeWindow.Ext;
      if (typeof videojs !== "undefined" && typeof Ext !== "undefined") {
        if (state$3.study.hacked) {
          return;
        }
        state$3.study.hacked = true;
        const _origin = videojs.getPlugin("seekBarControl");
        const plugin = videojs.extend(videojs.getPlugin("plugin"), {
          constructor: function(videoExt, data) {
            const _sendLog = data.sendLog;
            data.sendLog = (...args) => {
              var _a;
              if (args[1] === "drag") {
                dragCount++;
                if (dragCount > 100) {
                  dragCount = 0;
                  (_a = $el("video")) == null ? void 0 : _a.pause();
                }
              } else {
                _sendLog.apply(data, args);
              }
            };
            _origin.apply(_origin.prototype, [videoExt, data]);
          }
        });
        videojs.registerPlugin("seekBarControl", plugin);
        Ext.define("ans.VideoJs", {
          override: "ans.VideoJs",
          constructor: function(data) {
            this.addEvents(["seekstart"]);
            this.mixins.observable.constructor.call(this, data);
            const vjs = videojs(data.videojs, this.params2VideoOpt(data.params), function() {
            });
            Ext.fly(data.videojs).on("contextmenu", function(f) {
              f.preventDefault();
            });
            Ext.fly(data.videojs).on("keydown", function(f) {
              if (f.keyCode === 32 || f.keyCode === 37 || f.keyCode === 39 || f.keyCode === 107) {
                f.preventDefault();
              }
            });
            if (vjs.videoJsResolutionSwitcher) {
              vjs.on("resolutionchange", function() {
                const cr = vjs.currentResolution();
                const re2 = cr.sources ? cr.sources[0].res : false;
                Ext.setCookie("resolution", re2);
              });
            }
            if (vjs.videoJsPlayLine) {
              vjs.on("playlinechange", function() {
                const cp = vjs.currentPlayline();
                Ext.setCookie("net", cp.net);
              });
            }
          }
        });
      }
    }
  }
  async function study(opts) {
    var _a;
    await $.sleep(3e3);
    const searchedJobs = [];
    let searching = true;
    let attachmentCount = ((_a = $gm.unsafeWindow.attachments) == null ? void 0 : _a.length) || 0;
    setTimeout(() => {
      searching = false;
    }, 10 * 1e3);
    const runJobs = async () => {
      const job = searchJob(opts, searchedJobs);
      if (job && job.func) {
        try {
          await job.func();
        } catch (e) {
          $console.error("\u672A\u77E5\u9519\u8BEF", e);
        }
        await $.sleep(1e3);
        await runJobs();
      } else if (attachmentCount > 0) {
        attachmentCount--;
        await $.sleep(1e3);
        await runJobs();
      } else if (searching) {
        await $.sleep(1e3);
        await runJobs();
      }
    };
    await runJobs();
    top._preChapterId = "";
    const next2 = async () => {
      var _a2;
      const curCourseId = $el("#curCourseId", top == null ? void 0 : top.document);
      const curChapterId = $el("#curChapterId", top == null ? void 0 : top.document);
      const curClazzId = $el("#curClazzId", top == null ? void 0 : top.document);
      const count = $$el("#prev_tab .prev_ul li", top == null ? void 0 : top.document);
      if (CXAnalyses.isInFinalTab()) {
        if (await CXAnalyses.isStuckInBreakingMode()) {
          return $modal("alert", {
            content: "\u68C0\u6D4B\u5230\u6B64\u7AE0\u8282\u91CD\u590D\u8FDB\u5165, \u4E3A\u4E86\u907F\u514D\u65E0\u9650\u91CD\u590D, \u8BF7\u81EA\u884C\u624B\u52A8\u5B8C\u6210\u540E\u624B\u52A8\u70B9\u51FB\u4E0B\u4E00\u7AE0, \u6216\u8005\u5237\u65B0\u91CD\u8BD5\u3002"
          });
        }
      }
      if (CXAnalyses.isInFinalChapter()) {
        let content = "";
        if (opts.backToFirstWhenFinish) {
          content = "\u5DF2\u7ECF\u62B5\u8FBE\u6700\u540E\u4E00\u4E2A\u7AE0\u8282\uFF0C10\u79D2\u540E\u8FD4\u56DE\u7B2C\u4E00\u4E2A\u7AE0\u8282\u91CD\u65B0\u5F00\u59CB\u3002";
          setTimeout(() => {
            var _a3;
            (_a3 = top == null ? void 0 : top.document.querySelector(".posCatalog_name")) == null ? void 0 : _a3.click();
          }, 10 * 1e3);
          $message("info", { content, duration: 30 });
        } else {
          if (CXAnalyses.isFinishedAllChapters()) {
            content = "\u5168\u90E8\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF01";
          } else {
            content = "\u5DF2\u7ECF\u62B5\u8FBE\u6700\u540E\u4E00\u4E2A\u7AE0\u8282\uFF01\u4F46\u4ECD\u7136\u6709\u4EFB\u52A1\u70B9\u672A\u5B8C\u6210\uFF0C\u8BF7\u624B\u52A8\u5207\u6362\u81F3\u672A\u5B8C\u6210\u7684\u7AE0\u8282\u3002";
          }
          $modal("alert", { content });
        }
        CommonProject.scripts.settings.methods.notificationBySetting(content, {
          duration: 0,
          extraTitle: "\u8D85\u661F\u5B66\u4E60\u901A\u5B66\u4E60\u811A\u672C"
        });
      } else {
        if (curChapterId && curCourseId && curClazzId) {
          top._preChapterId = curChapterId.value;
          (_a2 = $gm.unsafeWindow.top) == null ? void 0 : _a2.PCount.next(
            count.length.toString(),
            curChapterId.value,
            curCourseId.value,
            curClazzId.value,
            ""
          );
        } else {
          $console.warn("\u53C2\u6570\u9519\u8BEF\uFF0C\u65E0\u6CD5\u8DF3\u8F6C\u4E0B\u4E00\u7AE0\uFF0C\u8BF7\u5C1D\u8BD5\u624B\u52A8\u5207\u6362\u3002");
        }
      }
    };
    if (CXProject.scripts.study.cfg.autoNextPage) {
      const msg = "\u9875\u9762\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF0C\u5373\u5C06\u5207\u6362\u4E0B\u4E00\u7AE0\u3002";
      $message("success", { content: msg });
      $console.info(msg);
      await $.sleep(5e3);
      next2();
    } else {
      const msg = "\u9875\u9762\u4EFB\u52A1\u70B9\u5DF2\u5B8C\u6210\uFF0C\u81EA\u52A8\u4E0B\u4E00\u7AE0\u5DF2\u5173\u95ED\uFF0C\u8BF7\u624B\u52A8\u5207\u6362\u3002";
      $message("warn", { content: msg });
      $console.warn(msg);
    }
  }
  function searchIFrame(root2) {
    var _a, _b;
    let list = Array.from(root2.querySelectorAll("iframe"));
    const result = [];
    while (list.length) {
      const frame = list.shift();
      try {
        if (frame && ((_a = frame == null ? void 0 : frame.contentWindow) == null ? void 0 : _a.document)) {
          result.push(frame);
          const frames = (_b = frame == null ? void 0 : frame.contentWindow) == null ? void 0 : _b.document.querySelectorAll("iframe");
          list = list.concat(Array.from(frames || []));
        }
      } catch (e) {
        console.log(e.message);
      }
    }
    return result;
  }
  function searchJob(opts, searchedJobs) {
    const knowCardWin = $gm.unsafeWindow;
    const searchJobElement = (root2) => {
      return domSearch(
        {
          media: "video,audio",
          chapterTest: ".TiMu",
          read: "#img.imglook"
        },
        root2.contentWindow.document
      );
    };
    const search = (root2) => {
      const win = root2.contentWindow;
      const { media, read, chapterTest } = searchJobElement(root2);
      if (win && (media || read || chapterTest)) {
        const doc = win.document;
        const attachment = knowCardWin.attachments[getValidNumber(win._jobindex, win.parent._jobindex)];
        if (attachment && searchedJobs.find((job2) => job2.mid === attachment.property.mid) === void 0) {
          const { name, title, bookname, author } = attachment.property;
          const jobName = name || title || (bookname ? bookname + author : void 0) || "\u672A\u77E5\u4EFB\u52A1";
          let func;
          if (media) {
            if (!CXProject.scripts.study.cfg.enableMedia) {
              const msg = `\u97F3\u89C6\u9891\u81EA\u52A8\u5B66\u4E60\u529F\u80FD\u5DF2\u5173\u95ED\uFF08\u5728\u4E0A\u65B9\u83DC\u5355\u680F\uFF0C\u8D85\u661F\u5B66\u4E60\u901A-\u8BFE\u7A0B\u5B66\u4E60\u4E2D\u5F00\u542F\uFF09\u3002${jobName} \u5373\u5C06\u8DF3\u8FC7`;
              $message("warn", { content: msg });
              $console.warn(msg);
            } else {
              if (opts.restudy || attachment.job) {
                func = () => {
                  const msg = `\u5373\u5C06${opts.restudy ? "\u91CD\u65B0" : ""}\u64AD\u653E : ` + jobName;
                  $message("info", { content: msg });
                  $console.log(msg);
                  return mediaTask(opts, media, doc);
                };
              }
            }
          } else if (chapterTest) {
            if (!CXProject.scripts.study.cfg.enableChapterTest) {
              const msg = `\u7AE0\u8282\u6D4B\u8BD5\u81EA\u52A8\u7B54\u9898\u529F\u80FD\u5DF2\u5173\u95ED\uFF08\u5728\u4E0A\u65B9\u83DC\u5355\u680F\uFF0C\u8D85\u661F\u5B66\u4E60\u901A-\u8BFE\u7A0B\u5B66\u4E60\u4E2D\u5F00\u542F\uFF09\u3002${jobName} \u5373\u5C06\u8DF3\u8FC7`;
              $message("warn", { content: msg });
              $console.warn(msg);
            } else {
              const status = win.document.querySelector(".testTit_status");
              if (status == null ? void 0 : status.classList.contains("testTit_status_complete")) {
                const msg = `\u7AE0\u8282\u6D4B\u8BD5\u5DF2\u5B8C\u6210 : ` + jobName;
                $message("success", { content: msg });
                $console.log(msg);
              } else {
                if (attachment.job || CommonProject.scripts.settings.cfg["work-when-no-job"]) {
                  func = () => {
                    const msg = `\u5F00\u59CB\u7B54\u9898 : ` + jobName;
                    $message("info", { content: msg });
                    $console.log(msg);
                    return chapterTestTask(root2, opts.workOptions);
                  };
                }
                if (attachment.job === void 0 && CommonProject.scripts.settings.cfg["work-when-no-job"] === false) {
                  const msg = `\u5F53\u524D\u4F5C\u4E1A ${jobName} \u4E0D\u662F\u4EFB\u52A1\u70B9\uFF0C\u4F46\u5F85\u5B8C\u6210\uFF0C\u5982\u9700\u5F00\u542F\u81EA\u52A8\u7B54\u9898\u8BF7\u524D\u5F80\uFF1A\u901A\u7528-\u5168\u5C40\u8BBE\u7F6E\uFF0C\u5F00\u542F\u5F3A\u5236\u7B54\u9898\u3002`;
                  $message("warn", { content: msg });
                  $console.warn(msg);
                }
              }
            }
          } else if (read) {
            if (!CXProject.scripts.study.cfg.enablePPT) {
              const msg = `PPT/\u4E66\u7C4D\u9605\u8BFB\u529F\u80FD\u5DF2\u5173\u95ED\uFF08\u5728\u4E0A\u65B9\u83DC\u5355\u680F\uFF0C\u8D85\u661F\u5B66\u4E60\u901A-\u8BFE\u7A0B\u5B66\u4E60\u4E2D\u5F00\u542F\uFF09\u3002${jobName} \u5373\u5C06\u8DF3\u8FC7`;
              $message("warn", { content: msg });
              $console.warn(msg);
            } else {
              if (attachment.job) {
                func = () => {
                  const msg = `\u6B63\u5728\u5B66\u4E60 : ` + jobName;
                  $message("warn", { content: msg });
                  $console.log(msg);
                  return readTask(win);
                };
              }
            }
          }
          const job2 = {
            mid: attachment.property.mid,
            attachment,
            func
          };
          searchedJobs.push(job2);
          return job2;
        }
      } else {
        return void 0;
      }
    };
    let job;
    for (const iframe of searchIFrame(knowCardWin.document)) {
      job = search(iframe);
      if (job) {
        return job;
      }
    }
    return job;
  }
  function fixedVideoProgress() {
    if (state$3.study.videojs) {
      const { bar } = domSearch({ bar: ".vjs-control-bar" }, state$3.study.videojs);
      if (bar) {
        bar.style.opacity = "1";
      }
    }
  }
  async function mediaTask(setting, media, doc) {
    const { playbackRate: playbackRate2 = 1, volume: volume2 = 0 } = setting;
    const { videojs } = domSearch({ videojs: "#video,#audio" }, doc);
    if (!videojs) {
      $console.error("\u89C6\u9891\u68C0\u6D4B\u4E0D\u5230\uFF0C\u8BF7\u5C1D\u8BD5\u5237\u65B0\u6216\u8005\u624B\u52A8\u5207\u6362\u4E0B\u4E00\u7AE0\u3002");
      return;
    }
    state$3.study.videojs = videojs;
    top.currentMedia = media;
    fixedVideoProgress();
    let reloadInterval;
    if (setting.reloadVideoWhenError) {
      reloadInterval = setInterval(() => {
        if (doc.documentElement.innerText.includes("\u7F51\u7EDC\u9519\u8BEF\u5BFC\u81F4\u89C6\u9891\u4E0B\u8F7D\u4E2D\u9014\u5931\u8D25")) {
          $console.error("\u89C6\u9891\u52A0\u8F7D\u5931\u8D25\uFF0C\u5373\u5C06\u5237\u65B0\u9875\u9762");
          setTimeout(() => {
            location.reload();
          }, 3e3);
        }
      }, 5e3);
    }
    if (setting.videoQuizStrategy !== "ignore") {
      const loop = async () => {
        var _a;
        const submitBtn = () => doc.querySelector("#videoquiz-submit");
        if (submitBtn()) {
          const list = Array.from(doc.querySelectorAll(".ans-videoquiz-opt label"));
          const answered = await answerPopupWithAI(doc.querySelector(".ans-videoquiz"), list, (option) => option.click());
          if (!answered) {
            $message("warn", { content: "AI 未完成视频弹题，请手动处理后刷新页面恢复自动学习。", duration: 0 });
            return;
          }
          (_a = submitBtn()) == null ? void 0 : _a.click();
          await $.sleep(3e3);
          const container = doc.querySelector("#video .ans-videoquiz");
          const components = Array.from(doc.querySelectorAll(".x-component-default"));
          if (container) {
            container.remove();
          }
          if (components.length) {
            for (const com of components) {
              com.style.display = "none";
            }
          }
        }
        await $.sleep(3e3);
        await loop();
      };
      loop();
    }
    await new Promise((resolve, reject) => {
      const playFunction = async () => {
        await waitForFaceRecognition();
        if (!media.ended) {
          await $.sleep(1e3);
          media.play();
          media.playbackRate = playbackRate2;
        }
      };
      media.addEventListener("pause", playFunction);
      media.addEventListener("ended", () => {
        $console.log("\u89C6\u9891\u64AD\u653E\u5B8C\u6BD5");
        media.removeEventListener("pause", playFunction);
        clearInterval(reloadInterval);
        resolve();
      });
      $console.log("\u89C6\u9891\u5F00\u59CB\u64AD\u653E");
      media.volume = volume2;
      media.currentTime = 0;
      playMedia(() => media.play()).then(() => {
        media.playbackRate = playbackRate2;
      }).catch(reject);
    });
  }
  async function readTask(win) {
    const finishJob = win.finishJob;
    if (finishJob)
      finishJob();
    await $.sleep(3e3);
  }
  async function chapterTestTask(frame, {
    period,
    upload,
    thread,
    stopSecondWhenFinish,
    redundanceWordsText,
    answerSeparators,
    answerMatchMode
  }) {
    if (!OpenAIClient.isConfigured()) {
      const msg2 = "AI 接口尚未配置，无法自动答题，请在「AI 聊天」填写设置。";
      $message("error", { content: msg2 });
      return $console.warn(msg2);
    }
    $message("info", {
      content: el("div", ["\u6B63\u5728\u7B54\u9898\u4E2D\uFF0C\u7B54\u9898\u7ED3\u679C\u8BF7\u524D\u5F80\uFF1A\u901A\u7528-\u641C\u7D22\u7ED3\u679C \u8FDB\u884C\u67E5\u770B"]),
      duration: 10
    });
    $console.info("\u5F00\u59CB\u7AE0\u8282\u6D4B\u8BD5");
    const frameWindow = frame.contentWindow;
    const { TiMu } = domSearchAll({ TiMu: ".TiMu" }, frameWindow.document);
    CommonProject.scripts.workResults.methods.init();
    const chapterTestTaskQuestionTitleTransform = (titles) => {
      const transformed = StringUtils.of(
        titles.map((t2) => t2 ? optimizationElementWithImage(t2).innerText : "").join(",")
      ).nowrap().nospace().toString().trim().replace(/^\d+[。、.]/, "").replace(/（\d+.\d+分）/, "").replace(/\(..题, .+?分\)/, "").replace(/[[(【（](.+题|名词解释|完形填空|阅读理解)[\])】）]/, "").trim();
      return removeRedundantWords(transformed, redundanceWordsText.split("\n"));
    };
    const worker = new OCSWorker({
      root: TiMu,
      elements: {
        title: ".Zy_TItle .clearfix",
        options: "ul li .after,ul li textarea,ul textarea,ul li label:not(.before)",
        type: 'input[id^="answertype"]',
        lineAnswerInput: ".line_answer input[name^=answer]",
        lineSelectBox: ".line_answer_ct .selectBox "
      },
      thread: thread != null ? thread : 1,
      answerSeparators: answerSeparators.split(",").map((s) => s.trim()),
      answerMatchMode,
      answerer: async (elements, ctx) => {
        const title = chapterTestTaskQuestionTitleTransform(elements.title);
        if (title) {
          const typeInput = elements.type[0];
          await $.sleep((period != null ? period : 3) * 1e3);
          return searchQuestionAnswers({
            type: (typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0) || "unknown",
            title,
            options: ctx.elements.options.map((o) => o.innerText).join("\n")
          });
        } else {
          throw new Error("\u9898\u76EE\u4E3A\u7A7A\uFF0C\u8BF7\u67E5\u770B\u9898\u76EE\u662F\u5426\u4E3A\u7A7A\uFF0C\u6216\u8005\u5FFD\u7565\u6B64\u9898");
        }
      },
      work: async (ctx) => {
        var _a;
        const { elements, searchInfos } = ctx;
        const typeInput = elements.type[0];
        const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0;
        if (type && (type === "completion" || type === "multiple" || type === "judgement" || type === "single")) {
          const resolver = defaultQuestionResolve(ctx)[type];
          const handler = (type2, answer, option, ctx2) => {
            var _a2, _b, _c, _d, _e, _f, _g;
            if (type2 === "judgement" || type2 === "single" || type2 === "multiple") {
              const checked = ((_b = (_a2 = option == null ? void 0 : option.parentElement) == null ? void 0 : _a2.querySelector("label input")) == null ? void 0 : _b.getAttribute("checked")) === "checked" || ((_c = option == null ? void 0 : option.parentElement) == null ? void 0 : _c.getAttribute("aria-checked")) === "true";
              if (checked)
                ;
              else {
                option == null ? void 0 : option.click();
              }
            } else if (type2 === "completion" && answer.trim()) {
              const text = (_d = option == null ? void 0 : option.parentElement) == null ? void 0 : _d.querySelector("textarea");
              const textareaFrame = (_e = option == null ? void 0 : option.parentElement) == null ? void 0 : _e.querySelector("iframe");
              if (text) {
                text.value = answer;
              }
              if (textareaFrame == null ? void 0 : textareaFrame.contentDocument) {
                textareaFrame.contentDocument.body.innerHTML = answer;
              }
              if ((_f = option == null ? void 0 : option.parentElement) == null ? void 0 : _f.parentElement) {
                (_g = $el("[onclick*=saveQuestion]", option.parentElement.parentElement)) == null ? void 0 : _g.click();
              }
            }
          };
          return await resolver(
            searchInfos,
            elements.options.map((option) => optimizationElementWithImage(option)),
            handler
          );
        } else if (type && type === "line") {
          for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
            let ans = answers;
            if (ans.length === 1) {
              ans = splitAnswer(ans[0]);
            }
            if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
              for (let index = 0; index < elements.lineSelectBox.length; index++) {
                const box = elements.lineSelectBox[index];
                if (ans[index]) {
                  (_a = $el(`li[data=${ans[index]}] a`, box)) == null ? void 0 : _a.click();
                  await $.sleep(200);
                }
              }
              return { finish: true };
            }
          }
          return { finish: false };
        }
        return { finish: false };
      },
      async onResultsUpdate(curr, _, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
        CommonProject.scripts.workResults.methods.setResults(
          simplifyWorkResult(res, chapterTestTaskQuestionTitleTransform)
        );
        CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
      },
      async onElementSearched(elements) {
        const typeInput = elements.type[0];
        const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : void 0;
        if (type === "judgement") {
          elements.options.forEach((option) => {
            var _a, _b, _c;
            if (option.innerText.includes("\u5BF9") || option.innerText.includes("\u9519"))
              ;
            else if (((_a = option == null ? void 0 : option.textContent) == null ? void 0 : _a.trim()) === "True") {
              if (((_b = option == null ? void 0 : option.textContent) == null ? void 0 : _b.trim()) === "True") {
                option.textContent = "\u221A";
              }
              if (((_c = option == null ? void 0 : option.textContent) == null ? void 0 : _c.trim()) === "False") {
                option.textContent = "x";
              }
            } else {
              const ri = option.querySelector(".ri");
              const span = document.createElement("span");
              span.innerText = ri ? "\u221A" : "\xD7";
              option.appendChild(span);
            }
          });
        }
      }
    });
    const results = await worker.doWork();
    const msg = `\u7B54\u9898\u5B8C\u6210\uFF0C\u5C06\u7B49\u5F85 ${stopSecondWhenFinish} \u79D2\u540E\u8FDB\u884C\u4FDD\u5B58\u6216\u63D0\u4EA4\u3002`;
    $console.info(msg);
    $message("info", { content: msg, duration: stopSecondWhenFinish });
    await $.sleep(stopSecondWhenFinish * 1e3);
    await worker.uploadHandler({
      type: upload,
      results,
      async callback(finishedRate, uploadable) {
        const msg2 = `\u5B8C\u6210\u7387 ${finishedRate.toFixed(2)} :  ${uploadable ? "3\u79D2\u540E\u5C06\u81EA\u52A8\u63D0\u4EA4" : "3\u79D2\u540E\u5C06\u81EA\u52A8\u4FDD\u5B58"} `;
        $console.info(msg2);
        $message("success", { content: msg2, duration: 3 });
        await $.sleep(3e3);
        if (uploadable) {
          frameWindow.btnBlueSubmit();
          await $.sleep(3e3);
          frameWindow.submitCheckTimes();
          top.$("#workpop").hide();
        } else {
          frameWindow.alert = () => {
          };
          frameWindow.noSubmit();
        }
      }
    });
    worker.emit("done");
  }
  function getValidNumber(...nums) {
    return nums.map((num) => typeof num === "number" ? num : void 0).find((num) => num !== void 0);
  }
  function getQuestionType(val) {
    return val === 0 ? "single" : val === 1 ? "multiple" : val === 3 ? "judgement" : [2, 4, 5, 6, 7, 8, 9, 10].some((t2) => t2 === val) ? "completion" : val === 11 ? "line" : val === 14 ? "fill" : val === 15 ? "reader" : void 0;
  }
  async function readerAndFillHandle(searchInfos, list) {
    var _a;
    for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
      let ans = answers;
      if (ans.length === 1) {
        ans = splitAnswer(ans[0]);
      }
      if (ans.filter(Boolean).length !== 0 && list.length !== 0) {
        for (let index = 0; index < ans.length; index++) {
          const item = list[index];
          if (item) {
            (_a = $el(`span.saveSingleSelect[data="${ans[index]}"]`, item)) == null ? void 0 : _a.click();
            await $.sleep(200);
          }
        }
        return { finish: true };
      }
    }
    return { finish: false };
  }
  function waitForFaceRecognition() {
    let notified = false;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const face = $el("#fcqrimg", top == null ? void 0 : top.document);
        if (face) {
          if (!notified) {
            notified = true;
            if (CXProject.scripts.study.cfg.notifyWhenHasFaceRecognition) {
              CommonProject.scripts.settings.methods.notificationBySetting(
                "\u68C0\u6D4B\u5230\u4EBA\u8138\u8BC6\u522B\uFF0C\u8BF7\u624B\u52A8\u8FDB\u884C\u8BC6\u522B\u540E\u811A\u672C\u624D\u4F1A\u7EE7\u7EED\u8FD0\u884C\u3002",
                { duration: 0 }
              );
            }
            $console.warn("\u68C0\u6D4B\u5230\u4EBA\u8138\u8BC6\u522B\uFF0C\u8BF7\u624B\u52A8\u8FDB\u884C\u8BC6\u522B\u540E\u811A\u672C\u624D\u4F1A\u7EE7\u7EED\u8FD0\u884C\u3002");
          }
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 3e3);
    });
  }
