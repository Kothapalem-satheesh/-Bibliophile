import { motion } from 'framer-motion'

const ROWS = [
  ['?', 'Show this help'],
  ['Esc', 'Close dialogs'],
  ['↑ / ↓', 'Move in suggestion list'],
  ['Enter', 'Search or pick suggestion'],
]

export default function ShortcutsModal({ onClose }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kbd-help-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(5,6,10,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '1.5rem',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        <h2 id="kbd-help-title" style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>
          Keyboard shortcuts
        </h2>
        <table style={{ width: '100%', fontSize: '0.88rem', color: 'var(--t2)' }}>
          <tbody>
            {ROWS.map(([key, desc]) => (
              <tr key={key}>
                <td style={{ padding: '8px 12px 8px 0', verticalAlign: 'top' }}>
                  <kbd
                    style={{
                      background: 'var(--card)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      color: 'var(--gold-light)',
                      fontSize: '0.82rem',
                    }}
                  >
                    {key}
                  </kbd>
                </td>
                <td style={{ padding: '8px 0' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 20,
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--t1)',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
