import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { FileCheck, CheckCircle, Clock, XCircle, Upload, Globe, ChevronRight, AlertCircle } from 'lucide-react'

const PROGRAMS = [
  { country: 'Canada',         flag: '🇨🇦', visa: 'Express Entry PR' },
  { country: 'Australia',      flag: '🇦🇺', visa: 'Skilled Migration 189' },
  { country: 'United Kingdom', flag: '🇬🇧', visa: 'Skilled Worker Visa' },
  { country: 'Germany',        flag: '🇩🇪', visa: 'Job Seeker Visa' },
]

function StatusIcon({ status, uploaded }) {
  if (!uploaded)        return <XCircle size={16} className="text-red-400 flex-shrink-0" />
  if (status === 'approved') return <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
  if (status === 'rejected') return <XCircle size={16} className="text-red-500 flex-shrink-0" />
  return <Clock size={16} className="text-amber-500 flex-shrink-0" />
}

function StatusLabel({ status, uploaded }) {
  if (!uploaded)        return <span className="badge bg-red-50 text-red-600 text-[10px]">Missing</span>
  if (status === 'approved') return <span className="badge bg-[hsl(142_70%_97%)] text-[hsl(142_70%_28%)] text-[10px]">Verified ✓</span>
  if (status === 'rejected') return <span className="badge bg-red-50 text-red-600 text-[10px]">Rejected</span>
  return <span className="badge bg-amber-50 text-amber-700 text-[10px]">Pending Review</span>
}

export default function DocumentReadiness() {
  const [selected, setSelected] = useState(PROGRAMS[0])
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)

  const load = async (prog) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/documents/readiness/${encodeURIComponent(prog.country)}`)
      setData(data)
    } catch { setData(null) }
    setLoading(false)
  }

  useEffect(() => { load(selected) }, [selected])

  const pctColor = pct =>
    pct >= 80 ? 'text-[hsl(142_70%_35%)]' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
  const barColor = pct =>
    pct >= 80 ? 'from-green-400 to-green-500' : pct >= 50 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500'

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Document Readiness</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Track which documents you still need to upload and get verified for each program.
        </p>
      </div>

      {/* Program Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {PROGRAMS.map(prog => (
          <button key={prog.country} onClick={() => setSelected(prog)}
            className={`card p-4 text-left hover:shadow-md transition-all flex items-center gap-3 ${selected.country === prog.country ? 'border-slate-600 bg-[hsl(var(--muted))]' : ''}`}>
            <span className="text-2xl">{prog.flag}</span>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${selected.country === prog.country ? 'text-[hsl(var(--fg))]' : 'text-gray-800'}`}>{prog.country}</p>
              <p className="text-[10px] text-gray-400 truncate">{prog.visa}</p>
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : data && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <div className="card p-6 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-3">{selected.flag}</span>
            <h2 className="text-base font-bold text-gray-900 mb-1">{selected.country}</h2>
            <p className="text-xs text-gray-400 mb-5">{selected.visa}</p>

            {/* Circular progress */}
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={data.readiness_pct >= 80 ? '#22c55e' : data.readiness_pct >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3.8"
                  strokeDasharray={`${data.readiness_pct} ${100 - data.readiness_pct}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${pctColor(data.readiness_pct)}`}>{data.readiness_pct}%</span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full text-center mb-5">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-lg font-black text-gray-900">{data.total}</p>
                <p className="text-[10px] text-gray-400">Required</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2">
                <p className="text-lg font-black text-amber-600">{data.uploaded}</p>
                <p className="text-[10px] text-gray-400">Uploaded</p>
              </div>
              <div className="bg-[hsl(142_70%_97%)] rounded-xl p-2">
                <p className="text-lg font-black text-[hsl(142_70%_35%)]">{data.verified}</p>
                <p className="text-[10px] text-gray-400">Verified</p>
              </div>
            </div>

            {data.readiness_pct < 100 && (
              <Link to="/documents" className="btn-primary w-full text-xs py-2.5">
                <Upload size={13} /> Upload Missing Documents
              </Link>
            )}
            {data.readiness_pct === 100 && (
              <div className="w-full py-2.5 bg-[hsl(142_70%_97%)] border border-green-100 rounded-xl text-center text-xs font-bold text-[hsl(142_70%_28%)]">
                🎉 All Documents Ready!
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Document Checklist — {selected.country}
            </h3>

            <div className="space-y-3">
              {data.checklist.map((item, i) => (
                <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                  item.status === 'approved' ? 'bg-[hsl(142_70%_97%)] border-green-100'
                  : item.status === 'rejected' ? 'bg-red-50 border-red-100'
                  : item.uploaded ? 'bg-amber-50 border-amber-100'
                  : 'bg-gray-50 border-gray-100 hover:border-red-200'
                }`}>
                  <StatusIcon status={item.status} uploaded={item.uploaded} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.type}</p>
                    {item.filename && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        📎 {item.filename}
                      </p>
                    )}
                    {!item.uploaded && (
                      <p className="text-xs text-red-500 mt-0.5 font-medium">
                        Not uploaded yet
                      </p>
                    )}
                  </div>

                  <StatusLabel status={item.status} uploaded={item.uploaded} />
                </div>
              ))}
            </div>

            {/* Summary tip */}
            {data.uploaded < data.total && (
              <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800">
                    {data.total - data.uploaded} document{data.total - data.uploaded !== 1 ? 's' : ''} still missing
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                    Upload all missing documents and wait for consultant verification before applying. Incomplete documentation is the #1 reason for delays.
                  </p>
                  <Link to="/documents" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-700 hover:underline">
                    Go to Documents <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
