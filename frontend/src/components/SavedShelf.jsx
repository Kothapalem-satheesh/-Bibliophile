import { motion, AnimatePresence } from 'framer-motion'

export default function SavedShelf({
  open,
  onClose,
  titles,
  onPickTitle,
  onRemove,
  onExport,
  onImportFile,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 250,
              background: 'rgba(5,6,10,0.6)',
            }}
          />
          <motion.aside
            initial={{ x: 400, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 'min(400px, 100vw)',
              height: '100vh',
              zIndex: 260,
              background: 'linear-gradient(180deg, var(--bg2), var(--bg))',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-16px 0 64px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>Saved list</h2>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--t2)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--t3)', margin: '0.5rem 0 1rem' }}>
              Stored in this browser only (no account, no server database).
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onExport}
                disabled={titles.length === 0}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--t1)',
                  cursor: titles.length ? 'pointer' : 'not-allowed',
                  opacity: titles.length ? 1 : 0.5,
                  fontSize: '0.82rem',
                }}
              >
                Export JSON
              </button>
              <label
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--t1)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Import JSON
                <input
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onImportFile(f)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', margin: 0, paddingRight: 4 }}>
              {titles.length === 0 ? (
                <p style={{ color: 'var(--t3)', fontSize: '0.9rem' }}>
                  Use the bookmark on a book card to add titles here.
                </p>
              ) : (
                titles.map((t) => (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onPickTitle(t)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold-light)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        lineHeight: 1.35,
                      }}
                    >
                      {t}
                    </button>
                    <button
                      type="button"
                      aria-label="Remove from list"
                      onClick={() => onRemove(t)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--t3)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
