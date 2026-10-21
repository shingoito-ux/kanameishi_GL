# MAMORINO — English Site

Static marketing site for MAMORINO. No build step, and no specific server
required — `html/common/header.html` and `footer.html` are loaded into every
page by client-side JS, so this works under any HTTP server (this repo's
`serve.js`, VSCode Live Server, the eventual production host, ...).

**It will not work opened directly as a `file://` path** — the browser blocks
the fetch that loads the header/footer in that case. Always view it through a
server.

## Run locally

```
npm start
```

Serves at http://localhost:3000.

## Structure

```
index.html            Home page
html/
  common/
    header.html        Shared header — included on every page
    footer.html         Shared footer — included on every page
  about.html
  contact.html
  our-plans.html
  our-process.html
  why-seismic-reinforcement.html
css/style.css          Single shared stylesheet
js/main.js             Hamburger nav + price simulator
image/                 Photos, logos, icons
sitemap.xml
```

## How includes work

Every page has two placeholders:

```html
<div data-include="/html/common/header.html"></div>
...
<div data-include="/html/common/footer.html"></div>
```

`js/main.js` fetches both files and swaps them in on page load, before wiring
up the hamburger menu and nav highlighting. Editing `html/common/header.html`
or `footer.html` shows up on every page on the next reload — no build step.

## Before launch

Hosted on Netlify at https://gl.kanameishi.co.jp (deploys from `master`).
Both contact forms (`home-assessment` on `index.html`, `contact` on
`html/contact.html`) use Netlify Forms; notifications go to
info@kaname-ishi.com (Netlify dashboard → Forms → Form notifications).
Favicons and home-screen icons (`favicon.ico`, `image/favicon.png`,
`image/apple-touch-icon.png`, `image/icon-192.png`, `image/icon-512.png`) are
cut from the house mark in `image/logo.webp`.

Must-do:

- Submit `https://gl.kanameishi.co.jp/sitemap.xml` in Google Search Console.

Should-do:

- Decide on pricing: figures are hidden with the `price-hidden` class (remove
  it to restore; also re-add `mt-note` to the termite `.coming-soon` box on
  `our-plans.html`). Decide whether the "Plan & Pricing" nav label stays.
- `image/prelogo2.png` (header + intro splash) is the approved interim logo;
  swap in the final lockup when it's ready.
- Add analytics (e.g. GA4) if wanted — then add a cookie notice and update
  the Cookies section of the Privacy Policy.
- Final QA: real phones, link check, Lighthouse.
