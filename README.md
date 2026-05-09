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

## Models

- **Hybrid** (default) — 60% collaborative + 40% content-based
- **Collaborative filter** — KNN cosine similarity
- **Content-based** — TF-IDF on title + author
- **KNN classic** — KNN Euclidean distance
