# Deploying shopfefa.world: “Launching in 5 days” + dev previews

## What’s in place

- **Coming Soon page**: When `NEXT_PUBLIC_COMING_SOON=true`, the site shows a single “Launching February 13th” / “X days to launch” page instead of the full app.
- **One codebase**: Same repo; the env var controls whether visitors see the coming soon page or the full site.

## Branch strategy (recommended)

| Branch | Use | Where it deploys (Vercel) |
|--------|-----|---------------------------|
| **main** | Production for shopfefa.world | Production → `www.shopfefa.world` |
| **dev** | Active development + previews | Preview deployments (e.g. `fefa-frontend-git-dev-…vercel.app`) |

- **main**: Set `NEXT_PUBLIC_COMING_SOON=true` in Vercel **only for Production**. Pushes to `main` update the live site and keep showing “Launching in 5 days” until you turn it off.
- **dev**: Do not set `NEXT_PUBLIC_COMING_SOON` (or set it to `false`) for **Preview** environments. Push to `dev` and open the preview URL to test the full site.

## Vercel setup

1. **Production (main → shopfefa.world)**  
   - Vercel → Project → **Settings** → **Environment Variables**  
   - Add: `NEXT_PUBLIC_COMING_SOON` = `true`  
   - Apply to **Production** only.  
   - Redeploy from `main` if needed.

2. **Previews (e.g. dev branch)**  
   - Do **not** add `NEXT_PUBLIC_COMING_SOON` for Preview, or set it to `false`.  
   - Each push to `dev` (or other branches) gets a preview URL with the full site.

## When you’re ready to go live (Feb 13)

1. Merge `dev` into `main` (so production has the latest code).
2. In Vercel, remove `NEXT_PUBLIC_COMING_SOON` from Production (or set it to `false`).
3. Redeploy from `main`. shopfefa.world will then show the full site.

## Quick checklist

- [ ] Create a **dev** branch and do development there.
- [ ] In Vercel, set `NEXT_PUBLIC_COMING_SOON=true` for **Production** only.
- [ ] Push to **main** → shopfefa.world shows “Launching in 5 days”.
- [ ] Push to **dev** → use the preview URL to test the full site.
- [ ] On launch day: remove the env var from Production and redeploy from `main`.
