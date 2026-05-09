import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiUrl } from '../utils/apiBase'
import { Stars, Cover } from './BookCard'
import BookCard from './BookCard'
import Skeleton from './Skeleton'

export default function BookModal({
  book,
  onClose,
  onSearch,
  onBookClick,
  savedHas,
  onToggleSaveBook,
}) {
  const [similar, setSimilar] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    fetch(apiUrl(`/api/recommend?book=${encodeURIComponent(book.title)}&model=hybrid&n=4`))
      .then((r) => r.json())
      .then((d) => {
        setSimilar(d.recommendations || [])
        setLoadingSimilar(false)
      })
      .catch(() => setLoadingSimilar(false))
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [book.title])

  const ratingPct = Math.min(100, Math.round(((book.avg_rating || 0) / 10) * 100))

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-book-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,6,10,0.88)',
          zIndex: 200,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(6px)',
        }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(560px, 100vw)',
            height: '100vh',
            background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)',
            borderLeft: '1px solid var(--border)',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
          }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, rotate: 90 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.2rem',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--t2)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '0.9rem',
              zIndex: 2,
            }}
          >
            ✕
          </motion.button>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', marginTop: '0.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                width: 148,
                flexShrink: 0,
                borderRadius: 12,
                overflow: 'hidden',
                aspectRatio: '2/3',
                boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
                border: '1px solid var(--border)',
              }}
            >
              <Cover imageUrl={book.image_url} title={book.title} />
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--t3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '0.5rem',
                }}
              >
                {book.year} · {book.publisher}
              </p>
              <h2
                id="modal-book-title"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.35rem',
                  fontStyle: 'italic',
                  color: 'var(--t1)',
                  marginBottom: '0.45rem',
                  lineHeight: 1.35,
                }}
              >
                {book.title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--t2)', marginBottom: '1rem' }}>
                by {book.author}
              </p>
              <Stars rating={book.avg_rating} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  margin: '12px 0 1rem',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    background: 'var(--card)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratingPct}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--t2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {book.avg_rating?.toFixed(1)} / 10
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--t3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 4,
                    }}
                  >
                    Ratings
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                    {book.num_of_rating?.toLocaleString()}
                  </div>
                </div>
                {book.match_score != null && book.match_score < 100 && (
                  <div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--t3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: 4,
                      }}
                    >
                      Match
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--green)' }}>
                      {book.match_score}%
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSearch(book.title)
                    onClose()
                  }}
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                    color: '#0a0c10',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 28px var(--gold-dim)',
                  }}
                >
                  Find similar books →
                </motion.button>
                {onToggleSaveBook && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onToggleSaveBook(book)}
                    style={{
                      background: 'var(--card)',
                      color: 'var(--gold-light)',
                      border: '1px solid var(--border)',
                      padding: '11px 22px',
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    {savedHas?.(book.title) ? '🔖 Saved' : '📑 Save to list'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.05rem',
                color: 'var(--t2)',
                marginBottom: '1rem',
              }}
            >
              Similar books
            </h3>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
              {loadingSimilar
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ minWidth: 145, flexShrink: 0 }}>
                      <Skeleton />
                    </div>
                  ))
                : similar.map((b, i) => (
                    <div key={b.title} style={{ minWidth: 145, flexShrink: 0 }}>
                      <BookCard
                        book={b}
                        onClick={onBookClick}
                        index={i}
                        saved={savedHas?.(b.title)}
                        onToggleSave={onToggleSaveBook}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
  )
}
