  function defaultWorkTypeResolver(ctx) {
    function count(selector) {
      let c = 0;
      for (const option of ctx.elements.options || []) {
        if ((option == null ? void 0 : option.querySelector(selector)) !== null) {
          c++;
        }
      }
      return c;
    }
    return count('[type="radio"]') === 2 ? "judgement" : count('[type="radio"]') > 2 ? "single" : count('[type="checkbox"]') > 2 ? "multiple" : count("textarea") >= 1 ? "completion" : void 0;
  }
  function isPlainAnswer(answer) {
    answer = answer.trim();
    if (answer.length > 8 || !/[A-Z]/.test(answer)) {
      return false;
    }
    const counter = {};
    let min = 0;
    for (let i = 0; i < answer.length; i++) {
      if (answer.charCodeAt(i) < min) {
        return false;
      }
      min = answer.charCodeAt(i);
      counter[min] = (counter[min] || 0) + 1;
    }
    for (const key in counter) {
      if (counter[key] !== 1) {
        return false;
      }
    }
    return true;
  }
  function resolvePlainAnswer(answer) {
    const resolve = answer.trim().replace(/[,，、 ]/g, "").trim();
    if (isPlainAnswer(resolve)) {
      return resolve;
    }
  }
  function splitAnswer(answer, separators = ["===", "#", "---", "###", "|", ";", "\uFF1B"]) {
    answer = answer.trim();
    if (answer.length === 0) {
      return [];
    }
    separators = separators.length === 0 ? ["===", "#", "---", "###", "|", ";", "\uFF1B"] : separators;
    separators = separators.filter((el2) => el2.trim().length > 0);
    try {
      const json = JSON.parse(answer);
      if (Array.isArray(json)) {
        return json.map(String).filter((el2) => el2.trim().length > 0);
      }
    } catch {
      for (const sep of separators) {
        if (answer.split(sep).length > 1) {
          return answer.split(sep).filter((el2) => el2.trim().length > 0);
        }
      }
    }
    return [answer];
  }
