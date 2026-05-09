import { useState } from 'react'
import { motion } from 'framer-motion'
import { bestCoverUrl } from '../utils/coverUrl'

function Stars({ rating, outOf = 10 }) {
  const n = Math.round((rating / outOf) * 5)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? 'var(--gold)' : 'var(--t3)', fontSize: '0.85rem' }}>
          ★
        </span>
      ))}
      <span style={{ fontSize: '0.75rem', color: 'var(--t2)', marginLeft: 4 }}>
        {rating?.toFixed(1)}
      </span>
    </div>
  )
}

function Cover({ imageUrl, title }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const url = bestCoverUrl(imageUrl)
  const initial = title?.[0]?.toUpperCase() || '?'

  if (failed || !url || url === 'nan') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(145deg, #1e2230 0%, #12151c 50%, #1a1628 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-40%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(201,168,76,0.15), transparent 50%)',
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '3.2rem',
            color: 'var(--gold)',
            opacity: 0.85,
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 8px 32px var(--gold-glow)',
          }}
        >
          {initial}
        </span>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg2)' }}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--bg2) 25%, var(--card) 50%, var(--bg2) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }}
        />
      )}
      <motion.img
        src={url}
        alt={title}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}

export { Stars, Cover }

export default function BookCard({
  book,
  onClick,
  index = 0,
  saved,
  onToggleSave,
  /** Narrow horizontal rails (Trending): fixed width, no layout animation stretch */
  variant = 'grid',
}) {
  const [hovered, setHovered] = useState(false)
  const score = book.match_score
  const badgeColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--t3)'
  const badgeBg =
    score >= 80 ? 'rgba(94,207,154,0.18)' : score >= 60 ? 'rgba(232,168,56,0.18)' : 'rgba(92,89,104,0.25)'

  return (
    <motion.div
      layout={variant !== 'carousel'}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.5), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(book)}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: '2px solid var(--gold)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        width: variant === 'carousel' ? '100%' : undefined,
        maxWidth: variant === 'carousel' ? '100%' : undefined,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          background: 'var(--bg2)',
          overflow: 'hidden',
        }}
      >
        <Cover imageUrl={book.image_url} title={book.title} />
        {onToggleSave && (
          <button
            type="button"
            aria-label={saved ? 'Remove from saved list' : 'Save to list'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave(book)
            }}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 6,
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'rgba(10,12,16,0.75)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {saved ? '🔖' : '📑'}
          </button>
        )}
        {score != null && score < 100 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeColor}55`,
              padding: '4px 10px',
              borderRadius: 100,
              fontSize: '0.72rem',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}
          >
            {score}%
          </motion.div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,12,16,0.92) 0%, transparent 55%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '1.35rem',
            fontSize: '0.82rem',
            color: 'var(--gold-light)',
            letterSpacing: '0.08em',
            fontWeight: 600,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.25s ease',
            pointerEvents: 'none',
          }}
        >
          View details →
        </div>
      </div>
      <div style={{ padding: 15 }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '0.98rem',
            fontStyle: 'italic',
            color: 'var(--t1)',
            marginBottom: 6,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.title}
        </h3>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--t2)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 8,
          }}
        >
          {book.author}
        </p>
        <Stars rating={book.avg_rating} />
        <p style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>
          {book.num_of_rating?.toLocaleString()} ratings
        </p>
      </div>
    </motion.div>
  )
}
