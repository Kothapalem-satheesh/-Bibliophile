import { motion } from 'framer-motion'
import BookCard from './BookCard'
import Skeleton from './Skeleton'

const MODEL_NAMES = {
  hybrid: '✦ Hybrid AI',
  cosine: '⊛ Collaborative',
  tfidf: '◈ Content-Based',
  knn: '◉ KNN Classic',
}
const MODELS = ['hybrid', 'cosine', 'tfidf', 'knn']

export default function Results({
  book,
  recommendations,
  loading,
  onBookClick,
  activeModel,
  onModelChange,
  savedHas,
  onToggleSaveBook,
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      id="results"
      style={{ padding: '4rem 2rem', maxWidth: 1220, margin: '0 auto' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--gold)',
              marginBottom: '0.55rem',
            }}
          >
            Recommendations
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.45rem, 3.2vw, 2.05rem)',
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            Because you liked{' '}
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>&ldquo;{book}&rdquo;</em>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MODELS.map((m) => (
            <motion.button
              key={m}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onModelChange(m)}
              style={{
                background: activeModel === m ? 'var(--gold-dim)' : 'var(--card)',
                border: `1px solid ${activeModel === m ? 'var(--gold)' : 'var(--border)'}`,
                color: activeModel === m ? 'var(--gold-light)' : 'var(--t2)',
                padding: '8px 16px',
                borderRadius: 100,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: activeModel === m ? 600 : 400,
              }}
            >
              {MODEL_NAMES[m]}
            </motion.button>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 22,
        }}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
        ) : recommendations.length > 0 ? (
          recommendations.map((b, i) => (
            <BookCard
              key={b.title}
              book={b}
              onClick={onBookClick}
              index={i}
              saved={savedHas?.(b.title)}
              onToggleSave={onToggleSaveBook}
            />
          ))
        ) : (
          <div
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--t3)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.45 }}>📚</div>
            <p>No recommendations found. Try a different book or model.</p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
