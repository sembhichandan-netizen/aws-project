import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { FileText, CheckCircle, XCircle, Search, Filter, X, Eye } from 'lucide-react'

export default function AdminDocuments() {
  const [docs,    setDocs]    = useState([])
  const [filter,  setFilter]  = useState('pending')
  const [search,  setSearch]  = useState('')
  const [notes,   setNotes]   = useState({})
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState({})

  const load = async () => {
    const { data } = await axios.get('/api/documents')
    setDocs(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const verify = async (id, status) => {
    setVerifying(v => ({ ...v, [id]: true }))
    try {
      await axios.put(`/api/documents/${id}/verify`, { status, notes: notes[id] || '' })
      toast.success(`Document ${status}!`)
      setNotes(n => { const c = {...n}; delete c[id]; return c })
      load()
    } catch {
      toast.error('Verification failed')
    } finally {
      setVerifying(v => { const c = {...v}; delete c[id]; return c })
    }
  }

  const FILTERS = ['all','pending','approved','rejected']
  const filtered = docs
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d =>
      d.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      d.type?.toLowerCase().includes(search.toLowerCase()) ||
      d.original_name?.toLowerCase().includes(search.toLowerCase())
    )

  const counts = { all: docs.length, pending: 0, approved: 0, rejected: 0 }
  docs.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++ })

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Document Verification</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review and verify applicant documents.</p>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
          <FileText size={15} className="text-amber-500" />
          <span className="text-sm font-bold text-gray-700">{counts.pending} Pending</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === f ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[hsl(var(--border))]'
            }`}>
            {f} <span className={`font-bold ${filter === f ? 'text-[hsl(var(--border))]' : 'text-gray-400'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by user, document type…"
          className="input pl-10 py-3 text-sm shadow-sm" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No {filter !== 'all' ? filter : ''} documents found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(doc => (
            <div key={doc.id} className="card p-5 hover:shadow-md transition-all duration-200 animate-fade-in">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className={
                    doc.status === 'approved' ? 'text-green-500'
                    : doc.status === 'rejected' ? 'text-red-400'
                    : 'text-[hsl(var(--muted-fg))]'
                  } />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{doc.original_name}</p>
                    <StatusBadge status={doc.status} />
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{doc.user_name}</span>
                    {' · '}{doc.user_email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Type: {doc.type} · Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                  {doc.notes && (
                    <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-3 py-1.5 italic">
                      Note: {doc.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Row - only for pending */}
              {doc.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3 flex-wrap">
                  <input
                    value={notes[doc.id] || ''}
                    onChange={e => setNotes(n => ({ ...n, [doc.id]: e.target.value }))}
                    placeholder="Add reviewer note (optional)…"
                    className="input flex-1 min-w-48 text-sm py-2"
                  />
                  <button
                    onClick={() => verify(doc.id, 'approved')}
                    disabled={verifying[doc.id]}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(142_70%_42%)] hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                  >
                    {verifying[doc.id]
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><CheckCircle size={14} /> Approve</>}
                  </button>
                  <button
                    onClick={() => verify(doc.id, 'rejected')}
                    disabled={verifying[doc.id]}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-100 transition-all disabled:opacity-60"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
