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

### Required Vercel settings (avoid FastAPI / Python builds)

If Vercel tries to build **FastAPI**, the deployment will fail or behave wrongly — this repo is **not** meant to run Python on Vercel.

**Recommended (simplest):**

1. **Project → Settings → General → Root Directory:** set to **`frontend`** (single folder only — no `app.py` in scope).
2. **Framework Preset:** **Vite** (not “Automatic” if it picks FastAPI, and never **FastAPI**).
3. Leave **Build Command** `npm run build` and **Output Directory** **`dist`** (defaults match `frontend/vercel.json`).

**Alternative (deploy from repo root):**

1. **Root Directory:** leave **empty**.
2. **Framework Preset:** **Other** or ensure Vercel uses **Node** / your root **`package.json`** workspaces — **do not** select **FastAPI**.
3. Build should run **`npm ci`** → **`npm run build`** → output **`frontend/dist`** per root **`vercel.json`**.

Then:

- **Environment Variables:** **`VITE_API_URL`** — full origin of your FastAPI deployment, **no trailing slash** (example: `https://book-api-xxxx.onrender.com`).
- Redeploy after changing env vars (Vite bakes this value in at build time).

Local dev stays unchanged: leave `VITE_API_URL` unset and run `uvicorn` on port 8000; the Vite dev server proxies `/api` to it.

See `frontend/.env.example` for a template.

### If Vercel build fails: “No FastAPI entrypoint found”

That means the project is configured as **FastAPI** while **`app.py` was excluded** from the upload (old `.vercelignore`) or Python mode should not be used at all. **Fix:** follow **Required Vercel settings** above (Root **`frontend`** + **Vite**), or turn off the FastAPI preset — do not deploy the Python API on Vercel.

### If Vercel shows “Serverless Function has crashed” (500)

Only the **static** files should run on Vercel. See **Required Vercel settings**; set **`VITE_API_URL`** to your real API; redeploy after **`git pull`** of the latest commit.

## Models

- **Hybrid** (default) — 60% collaborative + 40% content-based
- **Collaborative filter** — KNN cosine similarity
- **Content-based** — TF-IDF on title + author
- **KNN classic** — KNN Euclidean distance
