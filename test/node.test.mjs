// The bits that don't need a browser. CSP, Trusted Types and shadow DOM are
// in test/index.html.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

class TestElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this.shadowRoot = null;
    this.textContent = "";
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  getAttribute(name) {
    return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null;
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  insertBefore(child) {
    child.parentNode = this;
    this.children.unshift(child);
    return child;
  }
  addEventListener() {}
  attachShadow() {
    this.shadowRoot = new TestElement("#shadow-root");
    return this.shadowRoot;
  }
}

function findElement(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children) {
    var found = findElement(child, predicate);
    if (found) return found;
  }
  if (node.shadowRoot) return findElement(node.shadowRoot, predicate);
  return null;
}

function emittedCss(attrs = {}, { dark = false } = {}) {
  const script = new TestElement("script");
  for (const [name, value] of Object.entries(attrs)) script.setAttribute("data-" + name, value);

  const body = new TestElement("body");
  const document = {
    currentScript: script,
    body,
    documentElement: new TestElement("html"),
    createElement: (tag) => new TestElement(tag),
    createElementNS: (ns, tag) => new TestElement(tag),
    querySelector: () => null,
    addEventListener() {},
    dispatchEvent() {},
  };
  const window = {
    __nepalReliefBannerClaimed: false,
    localStorage: { getItem: () => null, setItem() {} },
    matchMedia: (query) => ({
      matches: query.indexOf("prefers-color-scheme") !== -1 && dark,
    }),
  };

  vm.runInNewContext(read("banner.js"), {
    window,
    document,
    Date,
    CustomEvent: function CustomEvent(type, init) {
      return { type, detail: init && init.detail };
    },
  });

  const host = findElement(body, (node) => node.tagName === "nepal-relief-banner");
  assert.ok(host, "banner host not mounted");
  const style = findElement(host.shadowRoot, (node) => node.tagName === "style");
  assert.ok(style, "fallback style element not emitted");
  return style.textContent;
}

function cssValue(css, pattern) {
  return css.match(pattern)?.[1];
}

test("banner.js loads without browser globals", async () => {
  const src = read("banner.js");
  const run = new Function("window", "document", src);
  assert.doesNotThrow(() => run(undefined, undefined));
});

test("bare dates run through the end of the day in Nepal", () => {
  // new Date("2026-09-30") is UTC midnight = 05:45 in Kathmandu
  const naive = new Date("2026-09-30");
  const fixed = new Date("2026-09-30T23:59:59+05:45");
  const npt = (d) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  assert.equal(npt(naive), "05:45");
  assert.equal(npt(fixed), "23:59");
  assert.match(read("banner.js"), /T23:59:59\+05:45/);
});

test("default expiry includes a time and offset", () => {
  const m = read("banner.js").match(/DEFAULT_UNTIL\s*=\s*"([^"]+)"/);
  assert.ok(m, "DEFAULT_UNTIL not found");
  assert.ok(!/^\d{4}-\d{2}-\d{2}$/.test(m[1]), `${m[1]} would parse as UTC midnight`);
  assert.ok(!Number.isNaN(new Date(m[1]).getTime()));
});

test("the README's SRI hash matches the committed banner.min.js", () => {
  const digest =
    "sha384-" + createHash("sha384").update(readFileSync(join(root, "banner.min.js"))).digest("base64");
  const claimed = read("README.md").match(/sha384-[A-Za-z0-9+/=]+/)?.[0];
  assert.equal(claimed, digest, "SRI mismatch; run npm run sri and update the README");
});

test("donation URL stays fixed to the government portal", () => {
  const src = read("banner.js");
  assert.match(src, /FUND_URL\s*=\s*"https:\/\/pmdrf\.nchl\.com\.np\/"/);
  assert.ok(!/opt\("(url|href|fund)"/.test(src), "donation URL became configurable");
});

test("dark and auto-dark keep dark theme colors without color overrides", () => {
  for (const css of [emittedCss({ theme: "dark" }), emittedCss({ theme: "auto" }, { dark: true })]) {
    assert.equal(cssValue(css, /background:([^;]+);color:/), "#0d1b3e");
    assert.equal(cssValue(css, /;color:([^;]+);border-bottom:/), "#dbe4f5");
    assert.equal(cssValue(css, /a\{color:([^;]+);font-weight/), "#9dbaff");
  }
});

test("hostile color option values do not reach emitted CSS", () => {
  const hostile = "red;} .owned{background:url(https://attacker.example/x)";
  const css = emittedCss({ bg: hostile });

  assert.equal(cssValue(css, /background:([^;]+);color:/), "#eaf0ff");
  assert.ok(!css.includes("attacker.example"));
  assert.ok(!css.includes(".owned"));
  assert.ok(!css.includes(hostile));
});
