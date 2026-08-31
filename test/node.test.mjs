// The bits that don't need a browser. CSP, Trusted Types and shadow DOM are
// in test/index.html.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

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
