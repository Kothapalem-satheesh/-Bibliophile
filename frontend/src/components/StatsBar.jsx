import { motion } from 'framer-motion'

export default function StatsBar({ stats }) {
  if (!stats) return null
  const items = [
    { value: stats.total_books?.toLocaleString(), label: 'Curated books' },
    { value: stats.total_users?.toLocaleString(), label: 'Active readers' },
    { value: stats.total_ratings?.toLocaleString(), label: 'Ratings analyzed' },
    { value: stats.avg_rating?.toFixed(1), label: 'Avg rating' },
  ]

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '2.75rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(24,28,38,0.35))',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: 'clamp(1.25rem, 4vw, 2.5rem)',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              textAlign: 'center',
              paddingLeft: i > 0 ? 'clamp(1rem, 3vw, 2rem)' : 0,
              borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.65rem',
                color: 'var(--gold-light)',
                fontWeight: 700,
              }}
            >
              {item.value}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
      <p style={{ fontSize: '0.76rem', color: 'var(--t3)' }}>
        Powered by KNN · TF-IDF · Hybrid AI · Book-Crossing dataset
      </p>
    </footer>
  )
}
