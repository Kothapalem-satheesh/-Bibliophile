import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar({ stats, page = 'discover', onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        background: scrolled ? 'rgba(10,12,16,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(1.2)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.span
          aria-hidden
          style={{ fontSize: '1.45rem' }}
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          📚
        </motion.span>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.32rem',
            color: 'var(--gold-light)',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Bibliophile
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {typeof onNavigate === 'function' && (
          <div
            role="tablist"
            aria-label="Main sections"
            style={{
              display: 'flex',
              gap: 6,
              padding: 4,
              background: 'rgba(24,28,38,0.65)',
              borderRadius: 999,
              border: '1px solid var(--border)',
            }}
          >
            {['discover', 'dashboard'].map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={page === id}
                onClick={() => onNavigate(id)}
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: 999,
                  padding: '0.38rem 0.95rem',
                  fontSize: '0.78rem',
                  fontWeight: page === id ? 600 : 400,
                  color: page === id ? 'var(--bg)' : 'var(--t2)',
                  background: page === id ? 'var(--gold)' : 'transparent',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >
                {id === 'discover' ? 'Discover' : 'Dashboard'}
              </button>
            ))}
          </div>
        )}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: 'var(--t3)' }}
          >
            <span>{stats.total_books?.toLocaleString()} books</span>
            <span style={{ color: 'var(--gold)' }}>·</span>
            <span>{stats.total_ratings?.toLocaleString()} ratings</span>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
