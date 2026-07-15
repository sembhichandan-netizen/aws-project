const STYLES = {
  pending:   { bg:'#fef9c3', color:'#854d0e', border:'#fde047' },
  approved:  { bg:'#f0fdf4', color:'#15803d', border:'#86efac' },
  rejected:  { bg:'#fef2f2', color:'#b91c1c', border:'#fca5a5' },
  verified:  { bg:'#f0fdf4', color:'#15803d', border:'#86efac' },
  withdrawn: { bg:'#f9fafb', color:'#6b7280', border:'#e5e7eb' },
  reviewing: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
  active:    { bg:'#f0fdf4', color:'#15803d', border:'#86efac' },
}
export default function StatusBadge({ status }) {
  const s = STYLES[status?.toLowerCase()] || { bg:'#f9fafb', color:'#6b7280', border:'#e5e7eb' }
  return (
    <span className="badge capitalize"
      style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:'0.7rem', padding:'0.2rem 0.55rem', fontWeight:500 }}>
      {status}
    </span>
  )
}
