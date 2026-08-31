// Each case sets window.CASE = { name, run }.
(function () {
  function report(pass, detail) {
    var c = window.CASE || { name: "unnamed" };
    // DOM calls keep this Trusted Types-safe
    var pre = document.createElement("pre");
    pre.style.cssText =
      "font:14px/1.5 ui-monospace,monospace;padding:10px;margin:8px 0;border-radius:6px;" +
      "background:" + (pass ? "#e7f8ed" : "#fdeaea");
    pre.textContent = (pass ? "PASS  " : "FAIL  ") + c.name + "\n      " + detail;
    document.body.appendChild(pre);
    try {
      parent.postMessage({ nrb: true, name: c.name, pass: pass, detail: detail }, "*");
    } catch (e) {}
  }
  window.addEventListener("load", function () {
    // let the banner's own DOMContentLoaded path run first
    setTimeout(function () {
      var c = window.CASE;
      try {
        var r = c.run();
        report(r.pass, r.detail);
      } catch (e) {
        report(false, "threw: " + e.message);
      }
    }, 50);
  });
  window.strip = function () {
    var h = document.querySelector("nepal-relief-banner");
    return h && h.shadowRoot ? h.shadowRoot.querySelector(".strip") : null;
  };
  window.count = function () {
    return document.querySelectorAll("nepal-relief-banner").length;
  };
})();
