import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiUrl } from '../utils/apiBase'

const MODELS = [
  { id: 'hybrid', label: '✦ Hybrid' },
  { id: 'cosine', label: '⊛ Collaborative' },
  { id: 'tfidf', label: '◈ Content-Based' },
  { id: 'knn', label: '◉ KNN Classic' },
]

/** High-res library & reading imagery — crossfades in the hero */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2400&q=88',
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2400&q=88',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=2400&q=88',
]

const heroText = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
}

function mergeSuggestionLists(apiResults, q, allBooks, limit = 12) {
  const ql = q.toLowerCase()
  const seen = new Set(apiResults)
  const out = [...apiResults]
  for (const b of allBooks) {
    if (out.length >= limit) break
    if (seen.has(b)) continue
    if (b.toLowerCase().includes(ql)) {
      out.push(b)
      seen.add(b)
    }
  }
  return out.slice(0, limit)
}

export default function Hero({ onSearch, activeModel, onModelChange }) {
  const [query, setQuery] = useState('')
  const [allBooks, setAllBooks] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [selIdx, setSelIdx] = useState(-1)
  const [recentSearches, setRecentSearches] = useState([])
  const [bgIdx, setBgIdx] = useState(0)
  const [searchFocused, setSearchFocused] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [noTitleMatch, setNoTitleMatch] = useState(false)
  const inputRef = useRef(null)
  const debRef = useRef(null)
  const suggestSeqRef = useRef(0)

  useEffect(() => {
    const id = setInterval(
      () => setBgIdx((i) => (i + 1) % HERO_IMAGES.length),
      10000
    )
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch(apiUrl('/api/books'))
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setAllBooks(d.books || []))
      .catch(() => {})
    setRecentSearches(JSON.parse(localStorage.getItem('recentSearches') || '[]'))
  }, [])

  const handleInput = (val) => {
    setQuery(val)
    setSelIdx(-1)
    setNoTitleMatch(false)
    clearTimeout(debRef.current)
    if (!val.trim()) {
      setSuggestions([])
      setSuggestLoading(false)
      setShowDrop(recentSearches.length > 0)
      return
    }
    setShowDrop(true)
    setSuggestLoading(true)
    debRef.current = setTimeout(() => {
      const seq = ++suggestSeqRef.current
      setSuggestions([])
      const q = val.trim()
      ;(async () => {
        try {
          const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}`))
          if (suggestSeqRef.current !== seq) return
          if (!res.ok) throw new Error('search failed')
          const data = await res.json()
          const merged = mergeSuggestionLists(data.results || [], q, allBooks, 12)
          setSuggestions(merged)
          setNoTitleMatch(merged.length === 0)
        } catch {
          if (suggestSeqRef.current !== seq) return
          const fallback = allBooks.filter((b) => b.toLowerCase().includes(q.toLowerCase())).slice(0, 12)
          setSuggestions(fallback)
          setNoTitleMatch(fallback.length === 0)
        } finally {
          if (suggestSeqRef.current === seq) setSuggestLoading(false)
        }
      })()
    }, 180)
  }

  const saveRecent = (book) => {
    const updated = [book, ...recentSearches.filter((r) => r !== book)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const submit = (book) => {
    if (!book?.trim()) return
    saveRecent(book)
    setQuery(book)
    setShowDrop(false)
    onSearch(book, activeModel)
  }

  const handleKey = (e) => {
    const list = query.trim() ? suggestions : recentSearches
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelIdx((i) => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      selIdx >= 0 ? submit(list[selIdx]) : submit(query)
    } else if (e.key === 'Escape') setShowDrop(false)
  }

  const displayList = query.trim() ? suggestions : recentSearches
  const typedQuery = query.trim().length > 0
  const showDropdown =
    showDrop &&
    (typedQuery
      ? suggestLoading || displayList.length > 0 || noTitleMatch
      : recentSearches.length > 0)

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Slideshow + Ken Burns (scale) on each image */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={bgIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <motion.div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${HERO_IMAGES[bgIdx]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 42%',
                filter: 'saturate(1.1) contrast(1.02)',
              }}
              initial={{ scale: 1 }}
              animate={{ scale: 1.09 }}
              transition={{
                duration: 18,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(165deg, rgba(10,12,16,0.96) 0%, rgba(10,12,16,0.78) 38%, rgba(10,12,16,0.5) 58%, rgba(10,12,16,0.93) 100%),
              linear-gradient(90deg, rgba(10,12,16,0.91) 0%, transparent 42%, rgba(10,12,16,0.78) 100%)
            `,
            pointerEvents: 'none',
          }}
        />
      </div>
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 30% 20%, var(--gold-glow) 0%, transparent 42%),
            radial-gradient(circle at 70% 80%, rgba(90,120,200,0.12) 0%, transparent 45%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Floating motes */}
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: i % 4 === 0 ? 3 : 2,
            height: i % 4 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: i % 5 === 0 ? 'var(--gold-light)' : 'var(--gold)',
            left: `${(i * 3.7) % 100}%`,
            bottom: '-5%',
            opacity: 0,
            animation: `floatUp ${5 + (i % 5) * 0.45}s ${i * 0.35}s infinite ease-in-out`,
            boxShadow: '0 0 8px var(--gold-glow)',
          }}
        />
      ))}

      <motion.div
        variants={heroText}
        initial="hidden"
        animate="show"
        style={{
          maxWidth: 760,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.p
          variants={heroItem}
          style={{
            fontSize: '0.76rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}
        >
          AI-Powered Book Discovery
        </motion.p>

        <motion.div variants={heroItem}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.5rem, 6.5vw, 4.2rem)',
              lineHeight: 1.12,
              marginBottom: '1.5rem',
              fontWeight: 700,
              textShadow: '0 4px 48px rgba(0,0,0,0.45)',
            }}
          >
            Discover Your
            <br />
            <em
              style={{
                fontStyle: 'italic',
                background:
                  'linear-gradient(95deg, var(--gold-light) 0%, var(--gold) 45%, var(--gold-light) 90%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'goldShimmer 7s ease-in-out infinite',
              }}
            >
              Next Great Read
            </em>
          </h1>
        </motion.div>

        <motion.p
          variants={heroItem}
          style={{
            fontSize: '1.05rem',
            color: 'var(--t2)',
            maxWidth: 540,
            margin: '0 auto 2.5rem',
            lineHeight: 1.75,
            fontWeight: 400,
          }}
        >
          Enter any book you love and we&apos;ll find your perfect next read using collaborative
          filtering, content analysis, and hybrid AI models.
        </motion.p>

        <motion.div
          variants={heroItem}
          style={{ position: 'relative', maxWidth: 620, margin: '0 auto 2rem' }}
        >
          <motion.div
            animate={{
              boxShadow: searchFocused
                ? '0 0 0 2px rgba(201,168,76,0.55), 0 20px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)'
                : '0 12px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
              borderColor: searchFocused ? 'rgba(201,168,76,0.45)' : 'var(--border2)',
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(24,28,38,0.88)',
              border: '1px solid',
              borderRadius: showDropdown ? '14px 14px 0 0' : 14,
              padding: '8px 8px 8px 18px',
              backdropFilter: 'blur(14px)',
            }}
          >
            <motion.span
              aria-hidden
              animate={{ rotate: searchFocused ? [0, -12, 12, 0] : 0 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0.55 }}
            >
              🔍
            </motion.span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => {
                setSearchFocused(true)
                setShowDrop(true)
                if (query.trim()) handleInput(query)
              }}
              onBlur={() =>
                setTimeout(() => {
                  setShowDrop(false)
                  setSearchFocused(false)
                }, 220)
              }
              onKeyDown={handleKey}
              placeholder="Search a book title..."
              autoComplete="off"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                color: 'var(--t1)',
                minWidth: 0,
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setSuggestions([])
                  inputRef.current?.focus()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--t3)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            )}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => submit(query)}
              style={{
                background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                color: '#0a0c10',
                border: 'none',
                padding: '11px 24px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 24px var(--gold-dim)',
              }}
            >
              Search
            </motion.button>
          </motion.div>

          {showDropdown && (
            <motion.div
              role="listbox"
              aria-label={typedQuery ? 'Book title suggestions' : 'Recent searches'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(24,28,38,0.96)',
                border: '1px solid var(--border2)',
                borderTop: 'none',
                borderRadius: '0 0 14px 14px',
                zIndex: 50,
                backdropFilter: 'blur(14px)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              {typedQuery && suggestLoading && (
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.85rem',
                    color: 'var(--t3)',
                  }}
                >
                  Searching titles…
                </div>
              )}
              {typedQuery && !suggestLoading && noTitleMatch && (
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.85rem',
                    color: 'var(--t2)',
                    lineHeight: 1.45,
                  }}
                >
                  No close match — pick a title from the dataset or fix spelling (titles must match the Book-Crossing list exactly).
                </div>
              )}
              {!typedQuery && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--t3)',
                    padding: '8px 16px 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  Recent
                </div>
              )}
              {displayList.map((book, i) => (
                <div
                  key={`${book}-${i}`}
                  role="option"
                  aria-selected={i === selIdx}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    submit(book)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--t1)',
                    background: i === selIdx ? 'var(--gold-dim)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>
                    {typedQuery ? '📖' : '🕐'}
                  </span>
                  <span style={{ textAlign: 'left' }}>{book}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={heroItem}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>Model:</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {MODELS.map((m) => (
              <motion.button
                key={m.id}
                type="button"
                layout
                whileHover={{
                  scale: 1.06,
                  boxShadow: '0 8px 28px rgba(201,168,76,0.18)',
                }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                onClick={() => onModelChange(m.id)}
                style={{
                  background: activeModel === m.id ? 'var(--gold-dim)' : 'rgba(24,28,38,0.85)',
                  border: `1px solid ${activeModel === m.id ? 'var(--gold)' : 'var(--border)'}`,
                  color: activeModel === m.id ? 'var(--gold-light)' : 'var(--t2)',
                  padding: '8px 18px',
                  borderRadius: 100,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: activeModel === m.id ? 600 : 400,
                  boxShadow:
                    activeModel === m.id ? '0 0 28px var(--gold-dim)' : '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                {m.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
