/** Prefer larger Amazon cover thumbnails when possible. */
export function bestCoverUrl(url) {
  if (!url || url === 'nan') return ''
  let u = String(url).trim()
  if (!u) return ''
  const lower = u.toLowerCase()
  if (lower.includes('amazon') && lower.includes('images')) {
    u = u.replace(/_SL\d+_/gi, '_SL500_')
  }
  return u
}
