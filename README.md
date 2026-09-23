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

1. **Add the real logo.** Drop the logo file into `assets/` and swap it into the `.wordmark` link in `index.html` (currently text-only) and into `assets/favicon.svg` (currently a placeholder "N" mark).
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

Once you have the exact domain name and know which registrar it's with (GoDaddy, Namecheap, Squarespace, etc.):

1. In the repo's GitHub settings → **Pages**, add the custom domain under "Custom domain." GitHub will create/verify a `CNAME` file in this repo automatically (or add one manually containing just the domain, e.g. `novoraconstructiongroup.com`).
2. At the domain registrar's DNS settings, add:
   - For the root/apex domain (`novoraconstructiongroup.com`): four **A records** pointing to GitHub Pages' IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - For `www`: a **CNAME record** pointing to `<github-username>.github.io`.
3. Back in GitHub Pages settings, check "Enforce HTTPS" once DNS has propagated (can take up to a few hours).

## Notes

- This was built as a sales mockup first, then converted into a real static site — see the earlier Novora Construction Group artifact link in this conversation for the original visual pass.
- File uploads on the inquiry form (`Photos` field) require a paid Web3Forms plan to actually deliver attachments; on the free plan the field is present but attachments won't come through. Fine to leave as-is or remove later.
