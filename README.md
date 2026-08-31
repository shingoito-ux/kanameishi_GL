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
  proven-results.html
  transparent-pricing.html
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

- Drop the final MAMORINO logo (English tagline version) in as
  `image/mamorino-logo-en.webp` — the header and footer already reference it.
- Confirm the romanized spelling of the leadership names on the About page with
  Kanameishi.
- Replace the placeholder domain in `sitemap.xml`.
- Wire the contact form (`html/contact.html`, `index.html`) to an actual email/CRM
  endpoint — it currently has no `action`.
