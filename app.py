# HOW TO RUN:
# 1. Run booksrecommender.ipynb fully top to bottom first
# 2. pip install -r requirements.txt
# 3. uvicorn app:app --reload --port 8000
# API docs at http://localhost:8000/docs

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pickle
import random
import numpy as np
import pandas as pd
import difflib
from pathlib import Path

# Resolve artifacts next to this file so uvicorn finds pickles even if started from another cwd
ROOT_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = ROOT_DIR / "artifacts"

artifacts = {}

# Same mapping as load_artifacts — used for /api/health and availability checks
ARTIFACT_FILES = {
    "model": "model.pkl",
    "model_cosine": "model_cosine.pkl",
    "book_names": "book_names.pkl",
    "book_pivot": "book_pivot.pkl",
    "final_rating": "final_rating.pkl",
    "popular_books": "popular_books.pkl",
    "content_books": "content_books.pkl",
    "cosine_sim": "cosine_sim_matrix.pkl",
    "metadata": "book_metadata.pkl",
}


def list_missing_pickles():
    return [fname for fname in ARTIFACT_FILES.values() if not (ARTIFACTS_DIR / fname).exists()]


def load_artifacts():
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    for key, fname in ARTIFACT_FILES.items():
        path = ARTIFACTS_DIR / fname
        if path.exists():
            artifacts[key] = pickle.load(open(path, "rb"))
            print(f"Loaded {fname}")
        else:
            print(f"WARNING: {fname} not found. Run the notebook first.")


NOT_READY_MSG = (
    "Models not loaded. Ensure Book-Crossing CSVs are in data/ next to booksrecommender.ipynb, "
    "execute all notebook cells to create artifacts/*.pkl, then restart uvicorn."
)


def ensure_models_loaded():
    missing = list_missing_pickles()
    if missing:
        raise HTTPException(status_code=503, detail=NOT_READY_MSG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield


app = FastAPI(title="Book Recommender API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


@app.get("/api/health")
def api_health():
    missing = list_missing_pickles()
    return {
        "ready": len(missing) == 0,
        "missing_pickles": missing,
        "artifacts_path": str(ARTIFACTS_DIR),
        "hint": None if not missing else NOT_READY_MSG,
    }


def get_meta(title):
    try:
        m = artifacts["metadata"].loc[title]
        return {
            "title": title,
            "author": str(m["author"]),
            "year": str(m["year"]),
            "publisher": str(m["publisher"]),
            "image_url": str(m["image_url"]),
            "avg_rating": round(float(m["avg_rating"]), 2),
            "num_of_rating": int(m["num_of_rating"]),
            "match_score": 100.0,
        }
    except Exception:
        return None


def collab_recommend(book_name, model_key="model_cosine", n=8):
    pivot = artifacts["book_pivot"]
    model = artifacts[model_key]
    try:
        book_id = np.where(pivot.index == book_name)[0][0]
        distances, suggestions = model.kneighbors(
            pivot.iloc[book_id, :].values.reshape(1, -1), n_neighbors=n + 1
        )
        results = []
        for i, idx in enumerate(suggestions[0]):
            title = pivot.index[idx]
            if title != book_name:
                meta = get_meta(title)
                if meta:
                    meta["match_score"] = round((1 / (1 + distances[0][i])) * 100, 1)
                    results.append(meta)
        return results[:n]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


def tfidf_recommend(book_name, n=8):
    cb = artifacts["content_books"]
    csim = artifacts["cosine_sim"]
    try:
        idx = cb[cb["title"] == book_name].index[0]
        sim_scores = sorted(enumerate(csim[idx]), key=lambda x: x[1], reverse=True)[1 : n + 1]
        results = []
        for i, score in sim_scores:
            title = cb.iloc[i]["title"]
            meta = get_meta(title)
            if meta:
                meta["match_score"] = round(float(score) * 100, 1)
                results.append(meta)
        return results[:n]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


def hybrid_recommend(book_name, n=8):
    pivot = artifacts["book_pivot"]
    cb = artifacts["content_books"]
    csim = artifacts["cosine_sim"]
    mc = artifacts["model_cosine"]
    collab, content = {}, {}
    try:
        book_id = np.where(pivot.index == book_name)[0][0]
        distances, suggestions = mc.kneighbors(
            pivot.iloc[book_id, :].values.reshape(1, -1), n_neighbors=n + 1
        )
        for i, idx in enumerate(suggestions[0]):
            t = pivot.index[idx]
            if t != book_name:
                collab[t] = 1 / (1 + distances[0][i])
    except Exception:
        pass
    try:
        idx = cb[cb["title"] == book_name].index[0]
        for i, score in sorted(enumerate(csim[idx]), key=lambda x: x[1], reverse=True)[1 : n + 1]:
            content[cb.iloc[i]["title"]] = float(score)
    except Exception:
        pass
    results = []
    for title in set(list(collab.keys()) + list(content.keys())):
        hybrid = 0.6 * collab.get(title, 0) + 0.4 * content.get(title, 0)
        meta = get_meta(title)
        if meta:
            meta["match_score"] = round(hybrid * 100, 1)
            results.append(meta)
    if not results:
        raise HTTPException(status_code=404, detail="Book not found or no recommendations")
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:n]


@app.get("/api/books")
def get_all_books():
    ensure_models_loaded()
    names = [str(n) for n in artifacts["book_names"]]
    return {"books": names, "total": len(names)}


@app.get("/api/recommend")
def recommend(
    book: str = Query(...),
    model: str = Query("hybrid"),
    n: int = Query(8, ge=1, le=20),
):
    ensure_models_loaded()
    if model == "hybrid":
        results = hybrid_recommend(book, n)
    elif model == "cosine":
        results = collab_recommend(book, "model_cosine", n)
    elif model == "knn":
        results = collab_recommend(book, "model", n)
    elif model == "tfidf":
        results = tfidf_recommend(book, n)
    else:
        raise HTTPException(
            status_code=400, detail="model must be: hybrid, cosine, knn, tfidf"
        )
    return {"book": book, "model": model, "recommendations": results}


@app.get("/api/popular")
def get_popular(n: int = Query(20, ge=1, le=50)):
    ensure_models_loaded()
    pop = artifacts["popular_books"].head(n)
    result = []
    for _, row in pop.iterrows():
        result.append(
            {
                "title": str(row["title"]),
                "author": str(row.get("author", "")),
                "image_url": str(row.get("image_url", "")),
                "year": str(row.get("year", "")),
                "avg_rating": round(float(row.get("avg_rating", 0)), 2),
                "num_of_rating": int(row.get("num_of_rating", 0)),
                "score": round(float(row.get("score", 0)), 3),
                "match_score": 100.0,
            }
        )
    return {"popular": result}


@app.get("/api/book/{title:path}")
def get_book(title: str):
    ensure_models_loaded()
    meta = get_meta(title)
    if not meta:
        raise HTTPException(status_code=404, detail="Book not found")
    return meta


@app.get("/api/random-book")
def random_book():
    """Pick a random title from trained books (artifact data only — no external API)."""
    ensure_models_loaded()
    names = [str(n) for n in artifacts["book_names"]]
    title = random.choice(names)
    meta = get_meta(title)
    if not meta:
        raise HTTPException(status_code=404, detail="Book metadata missing")
    return meta


@app.get("/api/search")
def search_books(q: str = Query(..., min_length=1)):
    ensure_models_loaded()
    all_books = [str(n) for n in artifacts["book_names"]]
    ql = q.lower()
    exact = [b for b in all_books if ql in b.lower()][:15]
    matches = difflib.get_close_matches(q, all_books, n=12, cutoff=0.22)
    combined = list(dict.fromkeys(exact + matches))[:15]
    return {"results": combined}


@app.get("/api/stats")
def get_stats():
    ensure_models_loaded()
    fr = artifacts["final_rating"]
    return {
        "total_books": int(len(artifacts["book_names"])),
        "total_users": int(fr["user_id"].nunique()),
        "total_ratings": int(len(fr)),
        "avg_rating": round(float(fr["rating"].mean()), 2),
    }


@app.get("/api/dashboard")
def get_dashboard():
    """
    Analytics-only aggregates from notebook-produced pickles (final_rating, metadata,
    book_pivot, popular_books). No recommendations — dataset insights for the dashboard UI.
    """
    ensure_models_loaded()
    fr = artifacts["final_rating"]
    md = artifacts["metadata"]
    pivot = artifacts["book_pivot"]
    pop = artifacts["popular_books"]

    rc = fr["rating"].astype(float).value_counts().sort_index()
    rating_distribution = [{"rating": int(k), "count": int(v)} for k, v in rc.items()]

    authors = md["author"].astype(str).str.strip()
    authors = authors.replace({"nan": "", "None": ""}).replace("", "(unknown)")
    top_authors = [{"author": a, "books": int(c)} for a, c in authors.value_counts().head(14).items()]

    years = pd.to_numeric(md["year"], errors="coerce").dropna()
    years = years[(years >= 1800) & (years <= 2035)]
    if len(years) > 0:
        decades = ((years // 10) * 10).astype(int).value_counts().sort_index()
        books_by_decade = [{"decade": int(d), "count": int(c)} for d, c in decades.items()]
    else:
        books_by_decade = []

    publishers = md["publisher"].astype(str).str.strip()
    publishers = publishers.replace({"nan": "", "None": ""}).replace("", "(unknown)")
    top_publishers = [{"publisher": p, "books": int(c)} for p, c in publishers.value_counts().head(10).items()]

    arr = pivot.values
    nonzero = int(np.count_nonzero(arr))
    total_cells = int(arr.size)
    matrix_density_pct = round(100.0 * nonzero / total_cells, 4) if total_cells else 0.0

    popular_table = []
    for _, row in pop.head(10).iterrows():
        popular_table.append(
            {
                "title": str(row["title"]),
                "score": round(float(row.get("score", 0)), 4),
                "avg_rating": round(float(row.get("avg_rating", 0)), 2),
                "num_ratings": int(row.get("num_of_rating", 0)),
            }
        )

    r = fr["rating"].astype(float)
    return {
        "source": "artifacts from booksrecommender.ipynb — Book-Crossing derived tables only",
        "summary": {
            "titles_in_model": int(len(artifacts["book_names"])),
            "unique_users_in_filtered_ratings": int(fr["user_id"].nunique()),
            "rating_rows": int(len(fr)),
            "avg_rating": round(float(r.mean()), 3),
            "median_rating": round(float(r.median()), 3),
            "rating_min": float(r.min()),
            "rating_max": float(r.max()),
            "rating_std": round(float(r.std()), 3),
            "matrix_shape_rows": int(pivot.shape[0]),
            "matrix_shape_cols": int(pivot.shape[1]),
            "matrix_nonzero_cells": nonzero,
            "matrix_density_percent": matrix_density_pct,
        },
        "rating_distribution": rating_distribution,
        "top_authors": top_authors,
        "books_by_decade": books_by_decade,
        "top_publishers": top_publishers,
        "weighted_popular_preview": popular_table,
    }
