# Novora Group Acquisitions — Website

Static marketing site for Novora Group Acquisitions, hosted on GitHub Pages.

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

**Important:** this domain already has active Google Workspace email on it (MX + SPF records
for `smtp.google.com`). Do **not** touch or delete the MX or TXT records when editing DNS below
— only add/replace the records listed here, or email breaks.

The domain currently also has two existing A records pointing at an old, broken app (returns
"402 Payment Required"), and a `www` CNAME pointing at `base44.onrender.com`. Both get replaced
by the steps below.

Steps, in Squarespace's DNS settings for this domain (Domains → novoragroupacq.com → DNS
Settings → Custom Records):

1. **Delete** the two existing A records pointing at `216.24.57.18` and `216.24.57.16`.
2. **Add four A records**, host `@`, each pointing to one of GitHub Pages' IPs:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
3. **Edit (or delete + re-add) the `www` CNAME record** so it points to:
   ```
   mussmink.github.io
   ```
   (currently points to `base44.onrender.com` — remove that one)
4. Leave the MX record (`smtp.google.com`) and the TXT/SPF record (`v=spf1 include:_spf.google.com ~all`) exactly as they are.
5. DNS changes can take anywhere from a few minutes to a few hours to propagate.
6. Once `https://novoragroupacq.com` loads the site, go to the repo's GitHub settings → **Pages**
   and check **Enforce HTTPS** (it may already be checked automatically once GitHub verifies the
   domain).

## Notes

- This was built as a sales mockup first, then converted into a real static site — see the earlier Novora Group Acquisitions artifact link in this conversation for the original visual pass.
- File uploads on the inquiry form (`Photos` field) require a paid Web3Forms plan to actually deliver attachments; on the free plan the field is present but attachments won't come through. Fine to leave as-is or remove later.
