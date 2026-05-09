import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { apiUrl } from '../utils/apiBase'
import BookCard from './BookCard'
import Skeleton from './Skeleton'

export default function Popular({ onBookClick, savedHas, onToggleSaveBook }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    fetch(apiUrl('/api/popular?n=20'))
      .then((r) => r.json())
      .then((d) => {
        setBooks(d.popular || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const cardWidth = 168

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * (cardWidth + 18), behavior: 'smooth' })

  return (
    <section
      style={{
        padding: '3.5rem 2rem',
        maxWidth: 1220,
        margin: '0 auto',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
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
            Curated collection
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.35rem, 3vw, 1.95rem)',
              fontWeight: 700,
            }}
          >
            Trending in the collection
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['←', '→'].map((arrow, i) => (
            <motion.button
              key={arrow}
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => scroll(i === 0 ? -1 : 1)}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--t2)',
                width: 40,
                height: 40,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              {arrow}
            </motion.button>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 18,
          overflowX: 'auto',
          paddingBottom: 16,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'thin',
          alignItems: 'stretch',
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: `0 0 ${cardWidth}px`,
                  width: cardWidth,
                  maxWidth: cardWidth,
                  scrollSnapAlign: 'start',
                }}
              >
                <Skeleton />
              </div>
            ))
          : books.map((book, i) => (
              <div
                key={book.title}
                style={{
                  flex: `0 0 ${cardWidth}px`,
                  width: cardWidth,
                  maxWidth: cardWidth,
                  scrollSnapAlign: 'start',
                }}
              >
                <BookCard
                  variant="carousel"
                  book={book}
                  onClick={onBookClick}
                  index={i}
                  saved={savedHas?.(book.title)}
                  onToggleSave={onToggleSaveBook}
                />
              </div>
            ))}
      </motion.div>
    </section>
  )
}
