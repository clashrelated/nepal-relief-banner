# Nepal Relief Banner

One line of HTML puts a donate link to the **Government of Nepal Prime
Minister's Disaster Relief Fund** on your site. It takes itself down on
30 September 2026.

```html
<script
  src="https://cdn.jsdelivr.net/gh/clashrelated/nepal-relief-banner@1.0.1/banner.min.js"
  integrity="sha384-ho2P9tyM1ZVoVX96zkFRkCYyJRGoXCjXpSS1a9KFnTyCUXAf1mVz3HAjQJSST1wN"
  crossorigin="anonymous"
></script>
```

Paste it after your opening `<body>` tag.
[Live demo and options](https://clashrelated.github.io/nepal-relief-banner/)

3.2 KB gzipped, one file, no dependencies. It renders in a shadow root so it
can't collide with your CSS, makes no requests of its own, sets no cookies, and
doesn't touch analytics unless you turn that on.

## Options

`data-` attributes on the script tag, all optional.

| Attribute | Default | |
| --- | --- | --- |
| `data-position` | `top` | `top` sits in the flow, `sticky` holds at the top of the screen, `bottom` is fixed to the bottom. Use `top` or `bottom` if you already have a sticky header. |
| `data-theme` | `light` | `light`, `dark`, `auto` |
| `data-lang` | `auto` | `en`, `ne`, or `auto` from your `<html lang>` |
| `data-accent` | brand blue | any CSS colour, for the link and icon |
| `data-dismissible` | `true` | `false` drops the close button |
| `data-analytics` | `off` | `auto` forwards the click to `gtag` or `dataLayer` |
| `data-until` | `2026-09-30` | last day it shows, Nepal time. A bare date runs to the end of that day. |
| `data-target` | none | CSS selector to mount into instead of the page edge |

```html
<script
  src="https://cdn.jsdelivr.net/gh/clashrelated/nepal-relief-banner@1.0.1/banner.min.js"
  integrity="sha384-ho2P9tyM1ZVoVX96zkFRkCYyJRGoXCjXpSS1a9KFnTyCUXAf1mVz3HAjQJSST1wN"
  crossorigin="anonymous"
  data-position="bottom"
  data-theme="auto"
  data-lang="ne"
></script>
```

## Where the tag goes

In the HTML shell, not a component, so it's there on first paint.

| | |
| --- | --- |
| WordPress | Appearance → Theme File Editor → `header.php`, under `<body>`. Or a "custom header code" box like WPCode's. |
| Shopify | Online Store → Themes → Edit code → `layout/theme.liquid`, under `<body>` |
| Wix, Squarespace, Webflow, Framer | the "custom code" panel, body slot, all pages |
| Next.js | `app/layout.tsx`, first child of `<body>` |
| Vite, CRA, Vue, Svelte, Astro | `index.html`, under `<body>` |
| Laravel, Rails, Django | your base layout template |
| npm | `npm install nepal-relief-banner` then `import "nepal-relief-banner"`, defaults only |

## From your own code

```js
document.addEventListener("nepal-relief-banner:donate", () => plausible("Relief click"));

NepalReliefBanner.remove();  // take it off this page view
NepalReliefBanner.reset();   // clear the dismissal
```

With `data-analytics="auto"` it also sends `nepal_relief_donate` to `gtag`, or
to `dataLayer` if there's no gtag. Never both, or GTM counts the click twice.

## Without JavaScript

No dismiss button, and it won't expire on its own.

```html
<div style="background:#eaf0ff;border-bottom:1px solid rgba(31,95,247,.14);
            padding:8px 16px;text-align:center;font:14px/1.5 system-ui,sans-serif;
            color:#1e293b">
  <a href="https://pmdrf.nchl.com.np/" target="_blank" rel="noopener noreferrer"
     style="color:#1a4fdb;font-weight:500">
    Donate to the Government of Nepal Prime Minister's Disaster Relief Fund &#8599;
  </a>
</div>
```

## Pinning

The install line above pins one version and its hash, so you won't get fixes
automatically. If you'd rather have them, drop `integrity` and `crossorigin`
and use `@1`:

```html
<script src="https://cdn.jsdelivr.net/gh/clashrelated/nepal-relief-banner@1/banner.min.js"></script>
```

`banner.min.js` is built from a pinned Terser with a committed lockfile, so you
can check the hash yourself:

```sh
curl -s https://cdn.jsdelivr.net/gh/clashrelated/nepal-relief-banner@1.0.1/banner.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

The donate URL is hardcoded on purpose.

After editing `banner.js`: `npm install && npm run build && npm run sri`, then
paste the new hash into this file.

## Tests

```sh
npm test                      # node
python3 -m http.server 4173   # then localhost:4173/test/
```

Node covers the SSR guard, the expiry parsing and the SRI hash. The browser
cases cover CSP, Trusted Types, shadow-DOM isolation, double-mounting, a bad
`data-target`, expiry, analytics, and the Nepali copy.

## Licence

MIT.

The fund is at [pmdrf.nchl.com.np](https://pmdrf.nchl.com.np/), run by NCHL.
This project isn't affiliated with them.
