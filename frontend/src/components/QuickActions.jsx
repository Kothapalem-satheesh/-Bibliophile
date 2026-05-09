import { motion } from 'framer-motion'

export default function QuickActions({
  apiReady,
  surpriseLoading,
  onSurprise,
  searchedBook,
  onCopyLink,
  onOpenSaved,
  savedCount,
  onShowHelp,
}) {
  const btn = {
    padding: '8px 16px',
    borderRadius: 100,
    fontSize: '0.82rem',
    cursor: apiReady ? 'pointer' : 'not-allowed',
    opacity: apiReady ? 1 : 0.45,
    border: '1px solid var(--border)',
    background: 'rgba(24,28,38,0.85)',
    color: 'var(--t2)',
    fontWeight: 500,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: '1.25rem',
      }}
    >
      <motion.button
        type="button"
        whileHover={{ scale: apiReady ? 1.03 : 1 }}
        whileTap={{ scale: apiReady ? 0.97 : 1 }}
        disabled={!apiReady || surpriseLoading}
        onClick={onSurprise}
        style={{
          ...btn,
          background: 'var(--gold-dim)',
          borderColor: 'var(--gold)',
          color: 'var(--gold-light)',
        }}
      >
        {surpriseLoading ? 'Picking…' : '✦ Surprise me'}
      </motion.button>
      <button
        type="button"
        disabled={!searchedBook}
        onClick={onCopyLink}
        style={{
          ...btn,
          opacity: searchedBook && apiReady ? 1 : 0.45,
          cursor: searchedBook && apiReady ? 'pointer' : 'not-allowed',
        }}
      >
        🔗 Copy share link
      </button>
      <button type="button" onClick={onOpenSaved} style={btn}>
        📚 Saved ({savedCount})
      </button>
      <button type="button" onClick={onShowHelp} style={btn}>
        ⌨ Shortcuts
      </button>
    </motion.div>
  )
}
