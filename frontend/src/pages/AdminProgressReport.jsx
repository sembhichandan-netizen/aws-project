import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { Users, BookOpen, FileText, ClipboardList, FileCheck, TrendingUp, ChevronDown, ChevronUp, Search, X, Wifi } from 'lucide-react'

function ProgressBar({ pct, color = 'bg-[hsl(var(--primary))]' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  )
}

function ScoreBadge({ result }) {
  if (!result) return <span className="text-xs text-gray-300">—</span>
  const cls = result.includes('High') ? 'bg-[hsl(142_70%_97%)] text-[hsl(142_70%_28%)]' : result.includes('Moderate') ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
  return <span className={`badge text-[10px] ${cls}`}>{result}</span>
}

function relTime(dt) {
  if (!dt) return 'Never'
  const s = Math.floor((Date.now() - new Date(dt)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(dt).toLocaleDateString()
}

export default function AdminProgressReport() {
  const [report,  setReport]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [expanded,setExpanded]= useState(null)

  useEffect(() => {
    axios.get('/api/admin/progress-report')
      .then(r => setReport(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = report.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.nationality?.toLowerCase().includes(search.toLowerCase())
  )

  // Summary stats across all students
  const totalStudents  = report.length
  const avgLearning    = report.length ? Math.round(report.reduce((a,s) => a + s.learning_pct, 0) / report.length) : 0
  const totalApproved  = report.reduce((a,s) => a + s.approved_apps, 0)
  const totalPending   = report.reduce((a,s) => a + s.pending_apps, 0)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Student Progress Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Complete overview of every student — eligibility, learning, documents and applications.
        </p>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: Users,         label: 'Total Students',    value: totalStudents,  color: 'bg-[hsl(var(--primary))]' },
          { icon: BookOpen,      label: 'Avg Learning',      value: `${avgLearning}%`, color: 'bg-[hsl(var(--primary))]' },
          { icon: ClipboardList, label: 'Approved Apps',     value: totalApproved,  color: 'bg-[hsl(142_70%_42%)]'  },
          { icon: ClipboardList, label: 'Pending Apps',      value: totalPending,   color: 'bg-amber-500'  },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={19} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search students by name, email or nationality…"
          className="input pl-10 py-3 text-sm shadow-sm" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Student Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <Users size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No students found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="card overflow-hidden">
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full flex items-center gap-5 p-5 text-left hover:bg-gray-50 transition-colors"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 w-48 flex-shrink-0">
                  <div className="w-10 h-10 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center text-sm font-black text-[hsl(var(--fg))] flex-shrink-0">
                    {s.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.nationality || 'Unknown'}</p>
                  </div>
                </div>

                {/* Eligibility Score */}
                <div className="w-28 flex-shrink-0">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Eligibility</p>
                  {s.latest_score !== null
                    ? <div>
                        <p className="text-base font-black text-gray-900">{s.latest_score}<span className="text-xs text-gray-400 font-normal">/100</span></p>
                        <ScoreBadge result={s.latest_result} />
                      </div>
                    : <p className="text-xs text-gray-300 italic">Not taken</p>
                  }
                </div>

                {/* Learning Progress */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">Learning</p>
                  <ProgressBar pct={s.learning_pct}
                    color={s.learning_pct >= 70 ? 'bg-[hsl(142_70%_42%)]' : s.learning_pct >= 40 ? 'bg-[hsl(var(--primary))]' : 'bg-amber-400'} />
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.modules_completed}/{s.modules_total} modules</p>
                </div>

                {/* Documents */}
                <div className="w-32 flex-shrink-0">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Documents</p>
                  <p className="text-sm font-bold text-gray-900">{s.verified_docs}<span className="text-xs text-gray-400 font-normal">/{s.doc_count} verified</span></p>
                  {s.pending_docs > 0 && <p className="text-[10px] text-amber-600 font-semibold">{s.pending_docs} pending review</p>}
                </div>

                {/* Applications */}
                <div className="w-28 flex-shrink-0">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Applications</p>
                  <p className="text-sm font-bold text-gray-900">{s.application_count} total</p>
                  {s.approved_apps > 0 && <p className="text-[10px] text-[hsl(142_70%_35%)] font-semibold">{s.approved_apps} approved</p>}
                </div>

                {/* Online status */}
                <div className="w-24 flex-shrink-0 text-right">
                  {s.last_seen && (Date.now() - new Date(s.last_seen)) < 5 * 60 * 1000
                    ? <div className="flex items-center gap-1 justify-end"><Wifi size={11} className="text-green-500"/><p className="text-[10px] text-[hsl(142_70%_35%)] font-semibold">Online</p></div>
                    : <p className="text-[10px] text-gray-400">{relTime(s.last_seen)}</p>
                  }
                  {s.current_page && <p className="text-[9px] text-gray-300 truncate">{s.current_page}</p>}
                </div>

                {expanded === s.id
                  ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
                  : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
                }
              </button>

              {/* Expanded detail */}
              {expanded === s.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 animate-slide-up">
                  <div className="grid md:grid-cols-2 gap-5">

                    {/* Applications detail */}
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Applications</p>
                      {s.applications.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No applications submitted</p>
                      ) : (
                        <div className="space-y-2">
                          {s.applications.map(app => (
                            <div key={app.id} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-100">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{app.program_name}</p>
                                <p className="text-[10px] text-gray-400">{app.country} · {new Date(app.submitted_at).toLocaleDateString()}</p>
                              </div>
                              <StatusBadge status={app.status} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact + meta */}
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Student Info</p>
                      <div className="space-y-1.5 text-xs text-gray-600">
                        <p><span className="font-semibold text-gray-700">Email:</span> {s.email}</p>
                        {s.phone && <p><span className="font-semibold text-gray-700">Phone:</span> {s.phone}</p>}
                        {s.nationality && <p><span className="font-semibold text-gray-700">Nationality:</span> {s.nationality}</p>}
                        <p><span className="font-semibold text-gray-700">Joined:</span> {new Date(s.created_at).toLocaleDateString()}</p>
                        {s.last_assessed && <p><span className="font-semibold text-gray-700">Last Assessment:</span> {new Date(s.last_assessed).toLocaleDateString()}</p>}
                        {s.current_page && <p><span className="font-semibold text-gray-700">Currently on:</span> {s.current_page}</p>}
                      </div>
                    </div>
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
