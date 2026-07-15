import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { ClipboardList, Globe, Clock, Trash2, Filter } from 'lucide-react'

const FLAG = { Canada:'🇨🇦', Australia:'🇦🇺', 'United Kingdom':'🇬🇧', Germany:'🇩🇪', 'New Zealand':'🇳🇿', 'United States':'🇺🇸' }

export default function Applications() {
  const [apps,    setApps]    = useState([])
  const [filter,  setFilter]  = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await axios.get('/api/applications')
    setApps(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const withdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await axios.delete(`/api/applications/${id}`)
      toast.success('Application withdrawn')
      load()
    } catch {
      toast.error('Failed to withdraw application')
    }
  }

  const FILTERS = ['all', 'pending', 'reviewing', 'approved', 'rejected', 'withdrawn']
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? apps.length : apps.filter(a => a.status === f).length
    return acc
  }, {})

  const stepMap = { pending: 1, reviewing: 2, approved: 3, rejected: 0, withdrawn: 0 }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track all your immigration program applications.</p>
        </div>
        <a href="/programs" className="btn-primary text-sm">+ Apply to Program</a>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === f ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[hsl(var(--border))] hover:text-[hsl(var(--primary))]'
            }`}>
            {f} <span className={`text-[10px] font-bold ${filter === f ? 'text-[hsl(var(--border))]' : 'text-gray-400'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Applications */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">No {filter !== 'all' ? filter : ''} applications found.</p>
          <a href="/programs" className="btn-primary inline-flex mt-5 text-sm">Browse Programs</a>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => (
            <div key={app.id} className="card p-5 hover:shadow-md transition-all duration-200 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{FLAG[app.country] || '🌐'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">{app.program_name}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{app.country} · {app.type}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        Submitted {new Date(app.submitted_at).toLocaleDateString()}
                      </span>
                      {app.processing_time && (
                        <span className="text-xs text-gray-400">Est. {app.processing_time}</span>
                      )}
                    </div>
                    {app.notes && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-1.5 italic">
                        Your note: {app.notes}
                      </p>
                    )}
                    {app.admin_notes && (
                      <p className="text-xs text-[hsl(var(--fg))] mt-2 bg-[hsl(var(--muted))] rounded-lg px-3 py-1.5 border border-[hsl(var(--border))]">
                        Consultant: {app.admin_notes}
                      </p>
                    )}
                  </div>
                </div>

                {['pending', 'reviewing'].includes(app.status) && (
                  <button onClick={() => withdraw(app.id)}
                    className="btn-danger text-xs px-3 py-1.5 flex-shrink-0">
                    <Trash2 size={12} /> Withdraw
                  </button>
                )}
              </div>

              {/* Progress Steps */}
              {!['rejected','withdrawn'].includes(app.status) && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-0">
                    {['Applied','Under Review','Approved'].map((step, i) => {
                      const cur = stepMap[app.status] || 0
                      const active = i < cur
                      const current = i === cur - 1
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              active || current ? 'bg-[hsl(var(--primary))] text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {active ? '✓' : i + 1}
                            </div>
                            <p className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${current ? 'text-[hsl(var(--primary))]' : active ? 'text-gray-700' : 'text-gray-400'}`}>
                              {step}
                            </p>
                          </div>
                          {i < 2 && (
                            <div className={`flex-1 h-0.5 mx-1 transition-all ${active ? 'bg-[hsl(var(--primary))]' : 'bg-gray-100'}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
