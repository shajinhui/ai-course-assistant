  function request(url, opts) {
    return new Promise((resolve, reject) => {
      try {
        const { responseType = "json", method = "get", type = "fetch", data = {}, headers = {} } = opts || {};
        const env = $.isInBrowser() ? "browser" : "node";
        if (type === "GM_xmlhttpRequest" && env === "browser") {
          if (typeof GM_xmlhttpRequest !== "undefined") {
            const contentType = headers["Content-Type"] || headers["content-type"];
            const requestData = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(data).toString() : Object.keys(data).length ? JSON.stringify(data) : void 0;
            GM_xmlhttpRequest({
              url,
              method: method.toUpperCase(),
              data: requestData,
              headers: Object.keys(headers).length ? headers : void 0,
              responseType: responseType === "json" ? "json" : void 0,
              onload: (response) => {
                if (response.status === 200) {
                  if (responseType === "json") {
                    try {
                      resolve(JSON.parse(response.responseText));
                    } catch (error) {
                      reject(error);
                    }
                  } else {
                    resolve(response.responseText || "");
                  }
                } else {
                  reject(response.responseText);
                }
              },
              onerror: (err) => {
                console.error("GM_xmlhttpRequest error", err);
                reject(err);
              }
            });
          } else {
            reject(new Error("GM_xmlhttpRequest is not defined"));
          }
        } else {
          const fet = env === "node" ? require("node-fetch").default : fetch;
          fet(url, { body: method === "post" ? JSON.stringify(data) : void 0, method, headers }).then((response) => {
            if (responseType === "json") {
              response.json().then(resolve).catch(reject);
            } else {
              response.text().then(resolve).catch(reject);
            }
          }).catch((error) => {
            reject(new Error(error));
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
