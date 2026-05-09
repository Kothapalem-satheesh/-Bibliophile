import { motion } from 'framer-motion'

export default function SetupBanner({ missing, artifactsPath }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        margin: '0 auto',
        maxWidth: 900,
        padding: '12px 18px',
        borderRadius: 12,
        border: '1px solid rgba(232, 168, 56, 0.35)',
        background: 'rgba(40, 32, 20, 0.92)',
        color: 'var(--t1)',
        fontSize: '0.88rem',
        lineHeight: 1.55,
      }}
    >
      <strong style={{ color: 'var(--gold-light)' }}>Recommendation models are not loaded.</strong>{' '}
      Keep Book-Crossing CSVs in <code style={{ color: 'var(--gold)' }}>data/</code> beside{' '}
      <code style={{ color: 'var(--gold)' }}>booksrecommender.ipynb</code>. In Jupyter, run{' '}
      <strong>all cells</strong> (or Run → Run All Cells) so <code style={{ color: 'var(--gold)' }}>artifacts/</code>{' '}
      contains <code style={{ color: 'var(--gold)' }}>.pkl</code> files, then restart{' '}
      <code style={{ color: 'var(--gold)' }}>uvicorn</code>.
      {artifactsPath && (
        <span style={{ display: 'block', marginTop: 8, fontSize: '0.72rem', color: 'var(--t3)', wordBreak: 'break-all' }}>
          API reads models from: <code style={{ color: 'var(--gold)' }}>{artifactsPath}</code>
        </span>
      )}
      {missing?.length > 0 && (
        <span style={{ display: 'block', marginTop: 8, fontSize: '0.78rem', color: 'var(--t3)' }}>
          Missing: {missing.slice(0, 6).join(', ')}
          {missing.length > 6 ? ` … (+${missing.length - 6} more)` : ''}
        </span>
      )}
    </motion.div>
  )
}
