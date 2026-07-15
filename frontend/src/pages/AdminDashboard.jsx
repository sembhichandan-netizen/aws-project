import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { Users, ClipboardList, FileText, Globe, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back, Administrator. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard icon={Users}         label="Total Users"           value={stats.users}               color="bg-[hsl(var(--primary))]" sub="Registered applicants" />
        <StatCard icon={ClipboardList} label="Total Applications"    value={stats.applications}        color="bg-[hsl(var(--primary))]" sub={`${stats.pendingApplications} pending`} />
        <StatCard icon={FileText}      label="Documents"             value={stats.documents}           color="bg-blue-500"   sub={`${stats.pendingDocuments} to review`} />
        <StatCard icon={Globe}         label="Active Programs"       value={stats.programs}            color="bg-[hsl(160_60%_40%)]"sub={`${stats.assessments} assessments taken`} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Approved',  value: stats.approvedApplications,  icon: CheckCircle, color: 'text-[hsl(142_70%_35%)] bg-[hsl(142_70%_97%)]' },
          { label: 'Rejected',  value: stats.rejectedApplications,  icon: XCircle,     color: 'text-red-600 bg-red-50'   },
          { label: 'Docs Verified', value: stats.verifiedDocuments, icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
          { label: 'Docs Pending',  value: stats.pendingDocuments,  icon: Clock,       color: 'text-amber-600 bg-amber-50'},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`card p-4 flex items-center gap-3 ${color.split(' ')[1]} border-0`}>
            <Icon size={20} className={color.split(' ')[0]} />
            <div>
              <p className={`text-xl font-black ${color.split(' ')[0]}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Recent Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
            <a href="/applications" className="text-xs text-[hsl(var(--primary))] font-semibold hover:underline">Manage all</a>
          </div>

          {stats.recentApplications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[hsl(var(--primary))]">{a.user_name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.user_name}</p>
                    <p className="text-xs text-gray-400 truncate">{a.program_name} · {a.country}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">New Users</h2>
            <a href="/admin/users" className="text-xs text-[hsl(var(--primary))] font-semibold hover:underline">Manage all</a>
          </div>

          {stats.recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-600">{u.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`badge text-[10px] ${u.role === 'admin' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--fg))]' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
