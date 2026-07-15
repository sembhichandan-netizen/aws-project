import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Globe, MessageSquare, Clock, ChevronRight, ArrowRight, FileCheck } from 'lucide-react'

const FLAG = { Canada:'🇨🇦', Australia:'🇦🇺', 'United Kingdom':'🇬🇧', Germany:'🇩🇪', 'New Zealand':'🇳🇿', 'United States':'🇺🇸' }

export default function ConsultantDashboard() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [threads,  setThreads]  = useState([])
  const [stats,    setStats]    = useState({ totalApps:0, pendingDocs:0 })
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/visa-programs'),
      axios.get('/api/messages/threads'),
      axios.get('/api/applications'),
      axios.get('/api/documents'),
    ]).then(([p, th, apps, docs]) => {
      setPrograms(p.data)
      setThreads(th.data)
      setStats({
        totalApps: apps.data.length,
        pendingDocs: docs.data.filter(d => d.status === 'pending').length,
      })
    }).finally(() => setLoading(false))
  }, [])

  const unread = threads.reduce((s, t) => s + (t.unread_count || 0), 0)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Consultant Dashboard — manage programs and student enquiries.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon:Globe,        label:'Active Programs',   value:programs.length,    color:'bg-[hsl(var(--primary))]' },
          { icon:MessageSquare,label:'Student Threads',   value:threads.length,     color:'bg-[hsl(var(--primary))]' },
          { icon:MessageSquare,label:'Unread Messages',   value:unread,             color:'bg-rose-500' },
          { icon:FileCheck,    label:'Pending Documents', value:stats.pendingDocs,  color:'bg-amber-500' },
        ].map(({ icon:Icon, label, value, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {unread > 0 && (
        <Link to="/consultant/messages" className="card p-4 mb-6 flex items-center gap-3 bg-[hsl(var(--muted))] border-[hsl(var(--border))] hover:shadow-md transition-all animate-slide-up">
          <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">You have {unread} unread message{unread>1?'s':''}</p>
            <p className="text-xs text-[hsl(var(--primary))]">Click to view and reply to student messages</p>
          </div>
          <ArrowRight size={16} className="text-[hsl(var(--muted-fg))]" />
        </Link>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visa Programs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Visa Programs We Offer</h2>
            <span className="text-xs text-gray-400">{programs.length} active</span>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : (
            <div className="space-y-3">
              {programs.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-xl flex-shrink-0">{FLAG[p.country]||'🌐'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.country} · {p.type} · {p.processing_time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600">{p.fee}</p>
                    <div className={`badge text-[10px] mt-0.5 ${p.success_rate>=80?'bg-[hsl(142_70%_97%)] text-[hsl(142_70%_28%)]':'bg-amber-50 text-amber-700'}`}>
                      {p.success_rate}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Student Threads */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Student Conversations</h2>
            <Link to="/consultant/messages" className="text-xs text-[hsl(var(--primary))] font-semibold hover:underline">View all</Link>
          </div>

          {threads.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No student messages yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {threads.slice(0,6).map(t => (
                <Link key={t.thread_id} to="/consultant/messages"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group">
                  <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-[hsl(var(--fg))]">
                    {t.student_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{t.student_name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.last_message}</p>
                  </div>
                  {t.unread_count > 0 && (
                    <span className="w-5 h-5 bg-[hsl(var(--primary))] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {t.unread_count}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-[hsl(var(--muted-fg))] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Program detail cards */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Program Details — Share with Students</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {programs.slice(0,4).map(p => (
            <div key={p.id} className="card p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{FLAG[p.country]||'🌐'}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.type}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <p><span className="font-semibold">Fee:</span> {p.fee}</p>
                <p><span className="font-semibold">Processing:</span> {p.processing_time}</p>
                <p><span className="font-semibold">Success:</span> {p.success_rate}%</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[hsl(var(--primary))] rounded-full" style={{ width:`${p.success_rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
