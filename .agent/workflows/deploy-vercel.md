---
description: Deploy Symera to Vercel (updates API bundle first)
---

# Deploy Symera to Vercel

This workflow automates the process of updating the Symera backend code on Vercel. It handles the critical step of bundling the API serverless function before pushing changes.

**Use this workflow whenever you make changes to the backend code (`server/`, `shared/`, or `api/`).**

## Steps

1.  **Build the API Bundle**
    This step runs `esbuild` to package all server-side code into a single file `api/index.mjs`. This is required for Vercel to find all dependencies.
    // turbo
    ```bash
    node build-api.mjs
    ```

2.  **Add the Bundle to Git**
    We must commit the generated bundle so Vercel can use it directly.
    // turbo
    ```bash
    git add api/index.mjs
    ```

3.  **Commit Changes**
    Commit the changes (including the new bundle) with a descriptive message.
    ```bash
    git commit -m "update: rebuild api bundle for deployment"
    ```

4.  **Push to GitHub**
    Pushing to the `main` branch triggers an automatic deployment on Vercel.
    // turbo
    ```bash
    git push origin main
    ```

5.  **Monitor Deployment**
    After pushing, check the Vercel dashboard to ensure the deployment succeeds.
    [Open Vercel Dashboard](https://vercel.com/dashboard)
