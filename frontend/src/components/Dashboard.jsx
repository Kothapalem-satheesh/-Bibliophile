import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiUrl } from '../utils/apiBase'

function BarRows({ rows, labelKey, valueKey, max }) {
  if (!rows?.length) {
    return (
      <p style={{ color: 'var(--t3)', fontSize: '0.85rem', marginTop: 8 }}>No rows for this slice.</p>
    )
  }
  const cap = max ?? Math.max(...rows.map((r) => r[valueKey]), 1)
  return (
    <div style={{ marginTop: 12 }}>
      {rows.map((r, i) => {
        const v = r[valueKey]
        const pct = cap ? Math.min(100, (v / cap) * 100) : 0
        return (
          <div key={`${r[labelKey]}-${i}`} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--t2)',
                marginBottom: 4,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>
                {String(r[labelKey])}
              </span>
              <span style={{ flexShrink: 0 }}>{typeof v === 'number' ? v.toLocaleString() : v}</span>
            </div>
            <div
              style={{
                height: 8,
                background: 'var(--card)',
                borderRadius: 4,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Kpi({ label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '1rem 1.1rem',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: '0.72rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.35rem', fontFamily: "'Playfair Display', serif", color: 'var(--gold-light)', marginTop: 6 }}>
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: '0.72rem', color: 'var(--t3)', marginTop: 6, lineHeight: 1.35 }}>{hint}</div>
      )}
    </motion.div>
  )
}

export default function Dashboard({ apiReady }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (apiReady !== true) {
      setData(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(apiUrl('/api/dashboard'))
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) {
          const msg =
            typeof j.detail === 'string'
              ? j.detail
              : 'Could not load dashboard (models missing?).'
          throw new Error(msg)
        }
        return j
      })
      .then((j) => {
        if (!cancelled) setData(j)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message || 'Failed to load dashboard.')
          setData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiReady])

  if (apiReady !== true) {
    return (
      <section style={{ padding: '6rem 1.5rem 4rem', maxWidth: 960, margin: '0 auto' }}>
        <p style={{ color: 'var(--t3)' }}>Dashboard becomes available after training artifacts load.</p>
      </section>
    )
  }

  if (loading && !data) {
    return (
      <section style={{ padding: '6rem 1.5rem 4rem', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ color: 'var(--t2)' }}>Loading dataset analytics…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section style={{ padding: '6rem 1.5rem 4rem', maxWidth: 960, margin: '0 auto' }}>
        <p style={{ color: 'var(--amber)' }}>{error}</p>
      </section>
    )
  }

  const s = data?.summary || {}
  const rd = data?.rating_distribution || []
  const maxRatCount = rd.length ? Math.max(...rd.map((x) => x.count), 1) : 1

  return (
    <section style={{ padding: '5.5rem 1.5rem 4rem', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            color: 'var(--gold-light)',
            marginBottom: 8,
          }}
        >
          Dataset dashboard
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: '0.9rem', maxWidth: 720, lineHeight: 1.55, marginBottom: 28 }}>
          {data?.source || 'Aggregates from your trained artifacts only — separate from live recommendations.'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <Kpi label="Titles in model" value={s.titles_in_model?.toLocaleString() ?? '—'} />
          <Kpi label="Users (filtered ratings)" value={s.unique_users_in_filtered_ratings?.toLocaleString() ?? '—'} />
          <Kpi label="Rating rows" value={s.rating_rows?.toLocaleString() ?? '—'} />
          <Kpi label="Mean rating" value={s.avg_rating ?? '—'} hint={`σ ${s.rating_std ?? '—'} · med ${s.median_rating ?? '—'}`} />
          <Kpi
            label="User–book matrix"
            value={`${s.matrix_shape_rows ?? '—'} × ${s.matrix_shape_cols ?? '—'}`}
            hint={`${s.matrix_density_percent ?? '—'}% nonzero (${s.matrix_nonzero_cells?.toLocaleString() ?? '—'} cells)`}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '1.25rem 1.35rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', color: 'var(--t1)', marginBottom: 4 }}>Rating distribution</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--t3)' }}>Counts per score in filtered ratings</p>
            <BarRows rows={rd.map((x) => ({ label: `Score ${x.rating}`, count: x.count }))} labelKey="label" valueKey="count" max={maxRatCount} />
          </div>

          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '1.25rem 1.35rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', color: 'var(--t1)', marginBottom: 4 }}>Top authors</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--t3)' }}>By number of titles in metadata</p>
            <BarRows rows={data?.top_authors || []} labelKey="author" valueKey="books" />
          </div>

          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '1.25rem 1.35rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', color: 'var(--t1)', marginBottom: 4 }}>Books by decade</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--t3)' }}>Publication year buckets (metadata)</p>
            <BarRows rows={(data?.books_by_decade || []).map((d) => ({ ...d, label: `${d.decade}s` }))} labelKey="label" valueKey="count" />
          </div>

          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '1.25rem 1.35rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', color: 'var(--t1)', marginBottom: 4 }}>Top publishers</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--t3)' }}>Title counts</p>
            <BarRows rows={data?.top_publishers || []} labelKey="publisher" valueKey="books" />
          </div>

          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              gridColumn: '1 / -1',
              padding: '1.25rem 1.35rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', color: 'var(--t1)', marginBottom: 4 }}>Weighted popularity (artifact)</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--t3)', marginBottom: 12 }}>
              Same ordering as the Discover “Trending” rail — scores from notebook pipeline, not live CF.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ color: 'var(--t3)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>#</th>
                    <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>Title</th>
                    <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>Score</th>
                    <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>Avg rating</th>
                    <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}># ratings</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.weighted_popular_preview || []).map((row, i) => (
                    <tr key={row.title + i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px 10px 0', color: 'var(--t3)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: 'var(--t1)', maxWidth: 420 }}>{row.title}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: 'var(--gold)' }}>{row.score}</td>
                      <td style={{ padding: '10px 12px 10px 0' }}>{row.avg_rating}</td>
                      <td style={{ padding: '10px 12px 10px 0' }}>{row.num_ratings?.toLocaleString?.() ?? row.num_ratings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.weighted_popular_preview?.length && (
                <p style={{ color: 'var(--t3)', fontSize: '0.85rem', marginTop: 8 }}>No popularity table rows.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
