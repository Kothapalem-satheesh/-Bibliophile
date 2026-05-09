import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import Navbar from './components/Navbar'
import SetupBanner from './components/SetupBanner'
import Hero from './components/Hero'
import QuickActions from './components/QuickActions'
import Results from './components/Results'
import Popular from './components/Popular'
import BookModal from './components/BookModal'
import StatsBar from './components/StatsBar'
import Dashboard from './components/Dashboard'
import ShortcutsModal from './components/ShortcutsModal'
import SavedShelf from './components/SavedShelf'
import { useSavedBooks } from './hooks/useSavedBooks'
import { apiUrl } from './utils/apiBase'

const MODEL_IDS = ['hybrid', 'cosine', 'tfidf', 'knn']

export default function App() {
  const [searchedBook, setSearchedBook] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [activeModel, setActiveModel] = useState(() => {
    try {
      const m = localStorage.getItem('bibliophile_preferred_model')
      if (MODEL_IDS.includes(m)) return m
    } catch {
      /* ignore */
    }
    return 'hybrid'
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [apiReady, setApiReady] = useState(null)
  const [missingPickles, setMissingPickles] = useState([])
  const [artifactsPath, setArtifactsPath] = useState('')
  const [surpriseLoading, setSurpriseLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [page, setPage] = useState(() => {
    try {
      const v = new URLSearchParams(window.location.search).get('view')
      return v === 'dashboard' ? 'dashboard' : 'discover'
    } catch {
      return 'discover'
    }
  })

  const saved = useSavedBooks()
  const urlLoaded = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem('bibliophile_preferred_model', activeModel)
    } catch {
      /* ignore */
    }
  }, [activeModel])

  useEffect(() => {
    let cancelled = false
    const poll = () =>
      fetch(apiUrl('/api/health'))
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return
          setApiReady(!!d.ready)
          setMissingPickles(d.missing_pickles || [])
          setArtifactsPath(d.artifacts_path || '')
        })
        .catch(() => {
          if (!cancelled) setApiReady(false)
        })
    poll()
    const id = setInterval(poll, 8000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (apiReady !== true) return
    fetch(apiUrl('/api/stats'))
      .then((r) => {
        if (!r.ok) return null
        return r.json()
      })
      .then((data) => data && setStats(data))
      .catch(() => {})
  }, [apiReady])

  const handleSearch = async (bookTitle, model = activeModel) => {
    if (!bookTitle?.trim()) return
    const useModel = MODEL_IDS.includes(model) ? model : activeModel
    setLoading(true)
    setSearchedBook(bookTitle)
    setRecommendations([])
    try {
      const res = await fetch(
        apiUrl(`/api/recommend?book=${encodeURIComponent(bookTitle)}&model=${useModel}&n=8`)
      )
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        const detail =
          typeof data.detail === 'string'
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((x) => x.msg || x).join(' ')
              : null
        toast.error(
          detail ||
            (res.status === 503
              ? 'Models not loaded. Run booksrecommender.ipynb, then restart the API.'
              : 'Book not found. Try another title.')
        )
        setRecommendations([])
        setLoading(false)
        return
      }
      setRecommendations(data.recommendations || [])
      setTimeout(
        () => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }),
        120
      )
    } catch (e) {
      toast.error(e?.message || 'Book not found. Try another title.')
      setRecommendations([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (apiReady !== true || urlLoaded.current) return
    urlLoaded.current = true
    const params = new URLSearchParams(window.location.search)
    const qBook = params.get('book')
    const qModel = params.get('model')
    const model = MODEL_IDS.includes(qModel) ? qModel : 'hybrid'
    setActiveModel(model)
    if (qBook?.trim()) {
      void handleSearch(qBook.trim(), model)
    }
  }, [apiReady])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (searchedBook) {
      url.searchParams.set('book', searchedBook)
      url.searchParams.set('model', activeModel)
    }
    if (page === 'dashboard') url.searchParams.set('view', 'dashboard')
    else url.searchParams.delete('view')
    window.history.replaceState({}, '', url)
  }, [searchedBook, activeModel, page])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleModelChange = (model) => {
    setActiveModel(model)
    if (searchedBook) handleSearch(searchedBook, model)
  }

  const onSurprise = async () => {
    setSurpriseLoading(true)
    try {
      const r = await fetch(apiUrl('/api/random-book'))
      if (!r.ok) throw new Error('random')
      const meta = await r.json()
      await handleSearch(meta.title, activeModel)
    } catch {
      toast.error('Could not pick a random book.')
    }
    setSurpriseLoading(false)
  }

  const copyShareLink = () => {
    if (!searchedBook) return
    const url = new URL(window.location.href)
    url.searchParams.set('book', searchedBook)
    url.searchParams.set('model', activeModel)
    navigator.clipboard.writeText(url.toString()).then(
      () => toast.success('Share link copied'),
      () => toast.error('Could not copy (browser blocked clipboard).')
    )
  }

  const toggleSaveBookNotify = (book) => {
    if (!book?.title) return
    const was = saved.has(book.title)
    saved.toggle(book.title)
    toast.success(!was ? 'Saved to your list' : 'Removed from saved')
  }

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181c26',
            color: '#f4f0e8',
            border: '1px solid rgba(201,168,76,0.22)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          },
        }}
      />
      <Navbar stats={stats} page={page} onNavigate={setPage} />
      {apiReady === false && (
        <div style={{ padding: '5.5rem 1.25rem 0', position: 'relative', zIndex: 50 }}>
          <SetupBanner missing={missingPickles} artifactsPath={artifactsPath} />
        </div>
      )}
      {page === 'discover' && (
        <>
          <Hero onSearch={handleSearch} activeModel={activeModel} onModelChange={handleModelChange} />
          <QuickActions
            apiReady={apiReady === true}
            surpriseLoading={surpriseLoading}
            onSurprise={onSurprise}
            searchedBook={searchedBook}
            onCopyLink={copyShareLink}
            onOpenSaved={() => setSavedOpen(true)}
            savedCount={saved.titles.length}
            onShowHelp={() => setShowShortcuts(true)}
          />
          {(searchedBook || loading) && (
            <Results
              book={searchedBook}
              recommendations={recommendations}
              loading={loading}
              onBookClick={setSelectedBook}
              activeModel={activeModel}
              onModelChange={handleModelChange}
              savedHas={saved.has}
              onToggleSaveBook={toggleSaveBookNotify}
            />
          )}
          <Popular
            onBookClick={setSelectedBook}
            savedHas={saved.has}
            onToggleSaveBook={toggleSaveBookNotify}
          />
          <StatsBar stats={stats} />
        </>
      )}
      {page === 'dashboard' && <Dashboard apiReady={apiReady} />}
      <AnimatePresence>
        {selectedBook && (
          <BookModal
            key={selectedBook.title}
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onSearch={handleSearch}
            onBookClick={setSelectedBook}
            savedHas={saved.has}
            onToggleSaveBook={toggleSaveBookNotify}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showShortcuts && (
          <ShortcutsModal open onClose={() => setShowShortcuts(false)} />
        )}
      </AnimatePresence>
      <SavedShelf
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        titles={saved.titles}
        onPickTitle={(t) => {
          setSavedOpen(false)
          void handleSearch(t, activeModel)
        }}
        onRemove={saved.remove}
        onExport={saved.exportJson}
        onImportFile={saved.importJson}
      />
    </div>
  )
}
