# Bibliophile — Book Recommendation System

## How to Run

### Step 1: Generate ML artifacts

Your folder that contains `booksrecommender.ipynb` must also contain a **`data/`** directory with the Book-Crossing CSVs (e.g. `BX-Books.csv`, `BX-Book-Ratings.csv`, `BX-Users.csv`). If your `data` folder lives higher in the project tree, **move or copy** it so it sits next to the notebook, or the notebook will not find the files.

Run **all cells** in `booksrecommender.ipynb` from top to bottom. This creates an **`artifacts/`** folder with `.pkl` files. **Until those files exist, search will show “book not found”** — the UI now shows a banner explaining this.

### Step 2: Start the API

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Step 3: Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

### Step 4: Open the app

- App: http://localhost:5173
- API docs: http://localhost:8000/docs

## Deploy (Vercel + Git)

Vercel hosts the **React build only**. The **FastAPI** app must run somewhere else (Render, Railway, Fly.io, your VPS, etc.) with your `artifacts/*.pkl` present on that host.

1. Push this repo to GitHub/GitLab and import it in [Vercel](https://vercel.com). Use the repository **root** that contains `vercel.json` (the folder with `app.py` and `frontend/`).
2. In Vercel → Project → **Settings → Environment Variables**, add:
   - **`VITE_API_URL`** — full origin of your FastAPI deployment, **no trailing slash** (example: `https://book-api-xxxx.onrender.com`).
3. Redeploy after changing env vars (Vite bakes this value in at build time).

Local dev stays unchanged: leave `VITE_API_URL` unset and run `uvicorn` on port 8000; the Vite dev server proxies `/api` to it.

See `frontend/.env.example` for a template.

### If Vercel shows “Serverless Function has crashed” (500)

This project’s **API does not run on Vercel** — only the **static Vite build** in **`frontend/dist`** should deploy. A 500 here almost always means the deployment is still **old** (see commit hash on the deployment) or Vercel is **not** using the static build output.

1. **Push the latest commit** from this repo (root **`package.json`** workspaces + **`package-lock.json`** + **`vercel.json`** without serverless rewrites). If Vercel still shows **`first commit` / `c30fc8d`**, you have not deployed the fix yet — trigger **Redeploy** after `git push`.
2. **Project → Settings → General:** leave **Root Directory** empty (repo root), unless you switch to the alternate layout below.
3. **Project → Settings → General → Build & Development:** turn **off** any manual overrides that force **Python**, **Other runtimes**, or a custom **Output** that is not `frontend/dist`. The repo’s **`vercel.json`** should supply: **Install** `npm ci`, **Build** `npm run build`, **Output** `frontend/dist`.
4. **Alternate layout:** set **Root Directory** to **`frontend`**, Framework **Vite**, **Build** `npm run build`, **Output** `dist` (then the root `vercel.json` is ignored — that is fine).
5. Set **`VITE_API_URL`** to your real FastAPI URL (no trailing slash).

Check **Deployments → … → Build Logs** (build must succeed) and **Functions** tab — for a pure static site you should see **no** Python functions.

## Models

- **Hybrid** (default) — 60% collaborative + 40% content-based
- **Collaborative filter** — KNN cosine similarity
- **Content-based** — TF-IDF on title + author
- **KNN classic** — KNN Euclidean distance
