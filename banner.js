/*! nepal-relief-banner v1.0.1 | MIT
 *  https://github.com/clashrelated/nepal-relief-banner
 */
(function () {
  "use strict";

  // SSR: bundlers will happily run this on a server
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var VERSION = "1.0.1";

  // deliberately not configurable
  var FUND_URL = "https://pmdrf.nchl.com.np/";

  // Nepal time (UTC+05:45)
  var DEFAULT_UNTIL = "2026-09-30T23:59:59+05:45";

  var HOST_TAG = "nepal-relief-banner";
  var DONATE_EVENT = "nepal-relief-banner:donate";
  var ANALYTICS_EVENT = "nepal_relief_donate";

  // two tags in <head> both run before a body exists
  if (window.__nepalReliefBannerClaimed) return;

  // null inside a module or a callback
  var tag =
    document.currentScript || document.querySelector('script[src*="' + HOST_TAG + '"]');

  function opt(name, fallback) {
    var v = tag && tag.getAttribute("data-" + name);
    return v === null || v === undefined || v === "" ? fallback : v;
  }

  var config = {
    position: opt("position", "top"), // top | sticky | bottom
    lang: opt("lang", "auto"), // en | ne | auto
    theme: opt("theme", "light"), // light | dark | auto
    accent: opt("accent", null),
    dismissible: opt("dismissible", "true") !== "false",
    analytics: opt("analytics", "off") === "auto",
    until: opt("until", DEFAULT_UNTIL),
    target: opt("target", null),
  };

  // a bare date parses as UTC midnight, ie 05:45 that morning in Nepal
  var untilText = config.until;
  if (/^\d{4}-\d{2}-\d{2}$/.test(untilText)) untilText += "T23:59:59+05:45";

  var until = new Date(untilText).getTime();
  if (isNaN(until)) {
    untilText = DEFAULT_UNTIL;
    until = new Date(DEFAULT_UNTIL).getTime();
  }
  if (Date.now() >= until) return;

  // per campaign, or a future appeal starts out already dismissed
  var STORE_KEY = "nepal-relief-dismissed:" + untilText.slice(0, 10);

  // safari private mode throws instead of returning null
  function stored(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function store(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
    }
  }

  if (stored(STORE_KEY) === "1") return;

  window.__nepalReliefBannerClaimed = true;

  var COPY = {
    en: {
      // the portal's own donate heading
      text: "Donate to the Government of Nepal Prime Minister's Disaster Relief Fund",
      newTab: "opens in a new tab",
      region: "Nepal disaster relief notice",
      dismiss: "Dismiss the Nepal relief notice",
    },
    ne: {
      // wording from the PM Office's own appeal
      text: "प्रधानमन्त्री दैवी प्रकोप उद्धार कोषमा आर्थिक सहयोग गर्नुहोस्",
      newTab: "नयाँ ट्याबमा खुल्छ",
      region: "नेपाल विपद् राहतसम्बन्धी सूचना",
      dismiss: "यो सूचना हटाउनुहोस्",
    },
  };

  var lang = config.lang;
  if (lang !== "en" && lang !== "ne") {
    var docLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    lang = docLang.indexOf("ne") === 0 ? "ne" : "en";
  }
  var copy = COPY[lang];

  var THEMES = {
    light: {
      bg: "#eaf0ff",
      fg: "#1e293b",
      link: "#1a4fdb",
      icon: "#1a4fdb",
      rule: "rgba(31,95,247,0.14)",
      underline: "rgba(31,95,247,0.35)",
      close: "#64748b",
      closeHover: "rgba(255,255,255,0.65)",
    },
    dark: {
      bg: "#0d1b3e",
      fg: "#dbe4f5",
      link: "#9dbaff",
      icon: "#9dbaff",
      rule: "rgba(157,186,255,0.18)",
      underline: "rgba(157,186,255,0.4)",
      close: "#94a3b8",
      closeHover: "rgba(255,255,255,0.09)",
    },
  };

  var themeName = config.theme;
  if (themeName === "auto") {
    themeName =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }
  var t = THEMES[themeName] || THEMES.light;
  // ends up in a stylesheet, so no ; or }
  if (config.accent && /^[#a-zA-Z0-9(),.%\s-]+$/.test(config.accent)) {
    t = Object.assign({}, t, { link: config.accent, icon: config.accent });
  }

  var css =
    ":host{all:initial;display:block;contain:layout style}" +
    ".strip{box-sizing:border-box;background:" +
    t.bg +
    ";color:" +
    t.fg +
    ";border-bottom:1px solid " +
    t.rule +
    ";font-family:'Noto Sans Devanagari',ui-sans-serif,system-ui,-apple-system," +
    "'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" +
    "font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}" +
    ".inner{box-sizing:border-box;position:relative;max-width:1280px;margin:0 auto;" +
    "display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 44px}" +
    ".heart{flex:none;display:none;color:" +
    t.icon +
    "}" +
    "p{margin:0;text-align:center}" +
    "a{color:" +
    t.link +
    ";font-weight:500;text-decoration:underline;text-decoration-color:" +
    t.underline +
    ";text-underline-offset:2px;transition:text-decoration-color .15s}" +
    "a:hover{text-decoration-color:" +
    t.link +
    "}" +
    "a:focus-visible,button:focus-visible{outline:2px solid " +
    t.link +
    ";outline-offset:2px;border-radius:4px}" +
    ".arrow{display:inline-block;vertical-align:-2px;margin-left:2px}" +
    "button{position:absolute;right:8px;top:50%;transform:translateY(-50%);" +
    "display:flex;align-items:center;justify-content:center;padding:4px;margin:0;border:0;" +
    "border-radius:8px;background:transparent;color:" +
    t.close +
    ";cursor:pointer;font:inherit;transition:background-color .15s,color .15s}" +
    "button:hover{background:" +
    t.closeHover +
    ";color:" +
    t.fg +
    "}" +
    "@media(min-width:640px){.strip{font-size:14px}.inner{padding-left:52px;padding-right:52px}" +
    ".heart{display:block}button{right:14px}}";

  // set in mount(), so data-target isn't overruled
  if (config.position === "bottom") {
    css +=
      ":host([data-fixed]){position:fixed;left:0;right:0;bottom:0;z-index:2147483000}" +
      ":host([data-fixed]) .strip{border-bottom:0;border-top:1px solid " +
      t.rule +
      ";box-shadow:0 -1px 12px rgba(2,6,23,.08)}";
  }
  if (config.position === "sticky") {
    css +=
      ":host([data-stuck]){position:sticky;top:0;z-index:2147483000}" +
      ":host([data-stuck]) .strip{box-shadow:0 1px 12px rgba(2,6,23,.06)}";
  }

  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    css +=
      ":host{animation:nrb-in .22s ease-out both}@keyframes nrb-in{from{opacity:0}to{opacity:1}}";
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  var ICON_HEART =
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
  var ICON_ARROW = "M7 7h10v10M7 17 17 7";
  var ICON_X = "M18 6 6 18M6 6l12 12";

  function icon(path, cls, size) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", cls);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", path);
    svg.appendChild(p);
    return svg;
  }

  // innerHTML throws under Trusted Types
  function build() {
    var strip = document.createElement("div");
    strip.className = "strip";
    strip.setAttribute("role", "region");
    strip.setAttribute("aria-label", copy.region);

    var inner = document.createElement("div");
    inner.className = "inner";
    strip.appendChild(inner);
    inner.appendChild(icon(ICON_HEART, "heart", 15));

    var p = document.createElement("p");
    var a = document.createElement("a");
    a.href = FUND_URL;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = copy.text;
    a.setAttribute("aria-label", copy.text + ", " + copy.newTab);
    a.appendChild(icon(ICON_ARROW, "arrow", 13));
    p.appendChild(a);
    inner.appendChild(p);

    var button = null;
    if (config.dismissible) {
      button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", copy.dismiss);
      button.appendChild(icon(ICON_X, "x", 15));
      inner.appendChild(button);
    }

    return { strip: strip, link: a, button: button };
  }

  function mount() {
    // unresolvable target is a typo, don't guess somewhere else
    var parent = null;
    if (config.target) {
      try {
        parent = document.querySelector(config.target);
      } catch (e) {
        parent = null;
      }
      if (!parent) {
        window.__nepalReliefBannerClaimed = false;
        return;
      }
    }

    var host = document.createElement(HOST_TAG);
    host.setAttribute("data-version", VERSION);

    // without one these styles would hit the whole document
    if (!host.attachShadow) return;
    var root = host.attachShadow({ mode: "open" });

    // CSP treats a <style> element as inline style and blocks it,
    // a constructed sheet gets through. fallback is for old safari
    var sheeted = false;
    if (window.CSSStyleSheet && root.adoptedStyleSheets) {
      try {
        var sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        root.adoptedStyleSheets = [sheet];
        sheeted = true;
      } catch (e) {
      }
    }
    if (!sheeted) {
      var style = document.createElement("style");
      style.textContent = css;
      root.appendChild(style);
    }

    var parts = build();
    root.appendChild(parts.strip);

    if (parent) {
      parent.appendChild(host);
    } else if (config.position === "bottom") {
      host.setAttribute("data-fixed", "");
      document.body.appendChild(host);
    } else {
      if (config.position === "sticky") host.setAttribute("data-stuck", "");
      document.body.insertBefore(host, document.body.firstChild);
    }

    parts.link.addEventListener("click", function () {
      try {
        document.dispatchEvent(new CustomEvent(DONATE_EVENT, { detail: { url: FUND_URL } }));
      } catch (e) {}
      // gtag writes to dataLayer itself, so never both
      if (!config.analytics) return;
      try {
        if (typeof window.gtag === "function") {
          window.gtag("event", ANALYTICS_EVENT, { link_url: FUND_URL });
        } else if (window.dataLayer && typeof window.dataLayer.push === "function") {
          window.dataLayer.push({ event: ANALYTICS_EVENT, link_url: FUND_URL });
        }
      } catch (e) {}
    });

    function remove() {
      if (host.parentNode) host.parentNode.removeChild(host);
      window.__nepalReliefBannerClaimed = false;
    }

    if (parts.button) {
      parts.button.addEventListener("click", function () {
        remove();
        store(STORE_KEY, "1");
      });
    }

    window.NepalReliefBanner = {
      version: VERSION,
      element: host,
      remove: remove,
      reset: function () {
        store(STORE_KEY, "0");
      },
    };
  }

  // no body yet if this sits in <head>, or is deferred
  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  }
})();
