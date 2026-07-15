import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Activity, Users, Eye, Clock, ChevronRight, Wifi, WifiOff } from 'lucide-react'

const ACTION_LABELS = {
  page_visit:    { label:'Visited page',  color:'bg-blue-50 text-blue-700' },
  message_sent:  { label:'Sent message', color:'bg-[hsl(var(--muted))] text-[hsl(var(--fg))]' },
}

function relativeTime(dt) {
  const s = Math.floor((Date.now() - new Date(dt)) / 1000)
  if (s < 60)  return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400)return `${Math.floor(s/3600)}h ago`
  return new Date(dt).toLocaleDateString()
}

export default function AdminActivity() {
  const [online, setOnline] = useState([])
  const [feed,   setFeed]   = useState([])
  const [loading,setLoading]= useState(true)

  const load = async () => {
    const [o, f] = await Promise.all([
      axios.get('/api/activity/online'),
      axios.get('/api/activity/feed'),
    ])
    setOnline(o.data); setFeed(f.data); setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 15_000); return () => clearInterval(t) }, [])

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Student Activity</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live tracking of what students are doing. Refreshes every 15 seconds.</p>
        </div>
        <div className="flex items-center gap-2 card px-4 py-2.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-gray-700">{online.length} online now</span>
        </div>
      </div>

      {/* Online Now */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wifi size={16} className="text-green-500" />
          <h2 className="text-base font-bold text-gray-900">Online Now</h2>
          <span className="text-xs text-gray-400">(active in last 5 minutes)</span>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : online.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <WifiOff size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No students online right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {online.map(u => (
              <div key={u.id} className="p-3.5 bg-[hsl(142_70%_97%)] border border-green-100 rounded-xl flex items-start gap-3">
                <div className="w-9 h-9 bg-[hsl(142_70%_42%)] rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  {u.current_page && (
                    <div className="flex items-center gap-1 mt-1">
                      <Eye size={10} className="text-[hsl(142_70%_35%)]" />
                      <p className="text-[11px] text-[hsl(142_70%_28%)] font-medium">{u.current_page}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">Last seen {relativeTime(u.last_seen)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-[hsl(var(--primary))]" />
          <h2 className="text-base font-bold text-gray-900">Recent Activity Feed</h2>
          <span className="text-xs text-gray-400">(last 50 events)</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Activity size={28} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No activity yet. Activity is logged as students use the platform.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-hide">
            {feed.map(evt => {
              const cfg = ACTION_LABELS[evt.action] || { label: evt.action, color: 'bg-gray-100 text-gray-600' }
              return (
                <div key={evt.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
                    {evt.user_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800">{evt.user_name}</span>
                    <span className="text-sm text-gray-500"> — {evt.detail || cfg.label}</span>
                  </div>
                  <span className={`badge text-[10px] flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                    <Clock size={9} /> {relativeTime(evt.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
