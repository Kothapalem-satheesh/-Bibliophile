export default function Skeleton() {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: '2px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '2/3',
          background:
            'linear-gradient(90deg, var(--bg2) 25%, var(--card) 50%, var(--bg2) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[92, 65, 42].map((w, i) => (
          <div
            key={i}
            style={{
              height: 12,
              width: `${w}%`,
              borderRadius: 6,
              background:
                'linear-gradient(90deg, var(--bg2) 25%, var(--card) 50%, var(--bg2) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
      </div>
    </div>
  )
}
