import { useState, useEffect, useCallback } from 'react'

const KEY = 'bibliophile_saved_titles'

export function useSavedBooks() {
  const [titles, setTitles] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(titles))
    } catch {
      /* quota */
    }
  }, [titles])

  const toggle = useCallback((title) => {
    if (!title) return
    setTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title].slice(0, 300)
    )
  }, [])

  const has = useCallback((title) => titles.includes(title), [titles])

  const remove = useCallback((title) => {
    setTitles((prev) => prev.filter((t) => t !== title))
  }, [])

  const exportJson = useCallback(() => {
    const payload = { exportedAt: new Date().toISOString(), titles }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bibliophile-reading-list.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }, [titles])

  const importJson = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const next = data.titles || data
        if (Array.isArray(next) && next.every((x) => typeof x === 'string')) {
          setTitles(next.slice(0, 300))
        }
      } catch {
        /* ignore */
      }
    }
    reader.readAsText(file)
  }, [])

  return { titles, toggle, has, remove, exportJson, importJson }
}
