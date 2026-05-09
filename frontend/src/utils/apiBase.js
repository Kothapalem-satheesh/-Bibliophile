/**
 * FastAPI base URL for production (no trailing slash).
 * Leave unset in dev: requests stay same-origin and Vite proxies `/api` → localhost:8000.
 * On Vercel, set `VITE_API_URL` to your deployed API origin (e.g. https://your-api.onrender.com).
 */
const RAW = import.meta.env.VITE_API_URL ?? ''

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  if (!RAW || String(RAW).trim() === '') return p
  const base = String(RAW).replace(/\/$/, '')
  return `${base}${p}`
}
