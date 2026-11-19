# How to publish this app (not done yet)

The production files are already built in `dist/`. Vite is configured with `base: "./"`, so the site works from a repository subdirectory or the root of a static host.

## GitHub Pages (recommended)

1. Create a GitHub repository and push this project (the default branch should be `main`).
2. In the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the “Deploy to GitHub Pages” workflow). The workflow at `.github/workflows/pages.yml` runs `npm ci`, `npm test`, `npm run build`, and publishes `dist/`.
4. The site URL will be `https://<user>.github.io/<repo>/`. No app login is required. Text that link to the student.

Because `base` is `./`, you do not need to change it for a project Pages URL.

## Other free static hosts (no extra app account on the student’s side)

You can also upload the contents of `dist/` to Cloudflare Pages or Netlify. Those hosts typically require a maintainer account, but the published site still has no login for the student.

There is no fully automatic public host that both needs zero accounts from anyone and stays online; GitHub Pages is the intended path once a GitHub repo exists.
