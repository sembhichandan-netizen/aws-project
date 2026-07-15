import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { Globe, Clock, DollarSign, CheckCircle, Search, X, Send } from 'lucide-react'

const rateColor = r => r >= 80 ? 'text-[hsl(142_70%_35%)] bg-[hsl(142_70%_97%)]' : r >= 70 ? 'text-amber-600 bg-amber-50' : 'text-orange-600 bg-orange-50'
const FLAG = { Canada:'🇨🇦', Australia:'🇦🇺', 'United Kingdom':'🇬🇧', Germany:'🇩🇪', 'New Zealand':'🇳🇿', 'United States':'🇺🇸' }

export default function VisaPrograms() {
  const [programs, setPrograms] = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [applying, setApplying] = useState(false)
  const [notes,    setNotes]    = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    axios.get('/api/visa-programs')
      .then(r => setPrograms(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  )

  const apply = async () => {
    setApplying(true)
    try {
      await axios.post('/api/applications', { program_id: selected.id, notes })
      toast.success(`Application submitted for ${selected.name}! 🎉`)
      setSelected(null); setNotes('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Application failed')
    } finally {
      setApplying(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Visa Programs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Browse and apply to immigration programs worldwide.</p>
        </div>
        <div className="card flex-shrink-0 px-4 py-2 text-sm font-bold text-gray-700">
          {programs.length} Programs
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by country, type, or program name…"
          className="input pl-11 py-3 text-sm shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Apply Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="card max-w-md w-full p-7 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{FLAG[selected.country] || '🌐'}</span>
              <div>
                <h2 className="text-lg font-black text-gray-900">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.country} · {selected.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Processing Time</p>
                <p className="text-sm font-bold text-gray-800">{selected.processing_time}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Government Fee</p>
                <p className="text-sm font-bold text-gray-800">{selected.fee}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Additional Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Any special circumstances or questions for the consultant…"
                className="input resize-none text-sm" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={apply} disabled={applying} className="btn-primary flex-1 disabled:opacity-60">
                {applying
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send size={14} /> Submit Application</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Programs Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Globe size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No programs match your search.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="card p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{FLAG[p.country] || '🌐'}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">{p.country}</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{p.name}</p>
                  </div>
                </div>
                <span className={`badge text-xs font-bold ${rateColor(p.success_rate)}`}>
                  {p.success_rate}%
                </span>
              </div>

              <span className="inline-block text-xs bg-[hsl(var(--muted))] text-[hsl(var(--fg))] font-semibold px-2 py-0.5 rounded-md mb-3 w-fit">
                {p.type}
              </span>

              <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{p.description}</p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 border-t border-gray-50 pt-3">
                <span className="flex items-center gap-1"><Clock size={11} /> {p.processing_time}</span>
                <span className="flex items-center gap-1"><DollarSign size={11} /> {p.fee}</span>
              </div>

              {/* Success Rate Bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(220_70%_15%)] rounded-full"
                  style={{ width: `${p.success_rate}%` }} />
              </div>

              <button onClick={() => setSelected(p)}
                className="btn-primary w-full text-sm py-2.5">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
