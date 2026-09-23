# Novora Construction Group — Website

Static marketing site for Novora Construction Group, hosted on GitHub Pages.

## Structure

```
index.html        page content
css/style.css      all styling
js/main.js         mobile nav + inquiry form submission
assets/            logo, favicon, images
```

No build step — it's plain HTML/CSS/JS. Open `index.html` directly in a browser to preview locally.

## Still to do before this goes live

1. ~~Add the real logo.~~ Done — `assets/logo.png` (circle-cropped, transparent background) plus derived `favicon-32.png` and `apple-touch-icon.png`.
2. **Get a Web3Forms access key** (handles the "Start Your Project" inquiry form — no backend needed):
   - Go to https://web3forms.com/, enter the email address inquiries should be sent to, and it will email you a free access key.
   - In `index.html`, find the line:
     ```html
     <input type="hidden" name="access_key" value="REPLACE_WITH_WEB3FORMS_ACCESS_KEY">
     ```
     and replace `REPLACE_WITH_WEB3FORMS_ACCESS_KEY` with the real key.
   - This key is meant to be public/client-side — that's how Web3Forms works, no secret to protect.
3. **Connect the custom domain** (see below).

## Deploying / updating the live site

The site is served by GitHub Pages directly from this repo's `main` branch. To publish a change:

```bash
git add .
git commit -m "describe the change"
git push
```

GitHub Pages picks up the new commit automatically within a minute or two.

## Connecting the custom domain

Domain: **novoragroupacq.com**, registered via Squarespace Domains. GitHub's side is already
done — the custom domain is set on Pages and the `CNAME` file exists in this repo.

**Important:** this domain already has active Google Workspace email on it (an `MX` record for
`smtp.google.com`, an SPF `TXT` record, and a `google._domainkey` `TXT`/DKIM record). Do **not**
touch or delete any of those three when editing DNS below, or email breaks.

Squarespace's DNS Settings → Custom Records table for this domain shows (as of 2026-09-23):

| Type  | Name              | Data                    |
|-------|-------------------|-------------------------|
| CNAME | www               | base44.onrender.com     |
| TXT   | @                 | v=spf1 include:_spf.google.com ~all |
| MX    | @                 | smtp.google.com         |
| ALIAS | @                 | base44.onrender.com     |
| TXT   | google._domainkey | v=DKIM1; k=rsa; p=...   |

Squarespace uses an **ALIAS** record at the apex (`@`) instead of raw A records — this does the
same job as GitHub Pages' four A records, so there's no need to add/delete anything, just edit
two existing rows:

1. **Edit the `ALIAS` row** (`@`, currently `base44.onrender.com`) → change its Data to:
   ```
   mussmink.github.io
   ```
2. **Edit the `CNAME` row** (`www`, currently `base44.onrender.com`) → change its Data to:
   ```
   mussmink.github.io
   ```
3. **Leave the `TXT` (SPF), `MX`, and `TXT` (DKIM) rows untouched** — that's the working
   `@novoragroupacq.com` email.
4. Leave the MX record (`smtp.google.com`) and the TXT/SPF record (`v=spf1 include:_spf.google.com ~all`) exactly as they are.
5. DNS changes can take anywhere from a few minutes to a few hours to propagate.
6. Once `https://novoragroupacq.com` loads the site, go to the repo's GitHub settings → **Pages**
   and check **Enforce HTTPS** (it may already be checked automatically once GitHub verifies the
   domain).

## Notes

- This was built as a sales mockup first, then converted into a real static site — see the earlier Novora Construction Group artifact link in this conversation for the original visual pass.
- File uploads on the inquiry form (`Photos` field) require a paid Web3Forms plan to actually deliver attachments; on the free plan the field is present but attachments won't come through. Fine to leave as-is or remove later.
