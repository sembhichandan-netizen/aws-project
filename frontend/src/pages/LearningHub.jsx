import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import VideoCard from '../components/VideoCard'
import { BookOpen, CheckCircle, Clock, ChevronRight, GraduationCap, Mic, Map, BarChart2, Play, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'

const CATS = ['All','IELTS','Country Guide','Interview','Documentation','Finance']
const levelColor = { Beginner:'bg-[hsl(142_70%_97%)] text-[hsl(142_70%_28%)]', Intermediate:'bg-amber-50 text-amber-700', Advanced:'bg-red-50 text-red-700' }

const HUB_CARDS = [
  { to:'/learning/ielts',     icon:GraduationCap, title:'IELTS Preparation Hub', desc:'All 4 skills with videos, notes & strategies', color:'from-[hsl(var(--primary))] to-[hsl(220_70%_15%)]', tag:'Most Popular' },
  { to:'/learning/interview', icon:Mic,           title:'Interview Preparation',  desc:'50 Q&A, model answers, body language tips',   color:'from-stone-600 to-stone-800', tag:'Essential' },
  { to:'/learning/roadmap',   icon:Map,           title:'Immigration Roadmap',    desc:'Step-by-step procedure from start to landing', color:'from-blue-500 to-blue-700',   tag:'Plan First' },
]

export default function LearningHub() {
  const [modules,  setModules]  = useState([])
  const [progress, setProgress] = useState({})
  const [videos,   setVideos]   = useState([])
  const [filter,   setFilter]   = useState('All')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/learning'),
      axios.get('/api/learning/progress'),
      axios.get('/api/resources?type=video'),
    ]).then(([m,p,v]) => {
      setModules(m.data)
      const map = {}; p.data.forEach(r => { map[r.module_id] = r }); setProgress(map)
      setVideos(v.data)
    }).finally(() => setLoading(false))
  }, [])

  const updateProgress = async (modId, pct, done) => {
    try {
      await axios.post(`/api/learning/${modId}/progress`, { progress_percent: pct, completed: done })
      const p = await axios.get('/api/learning/progress')
      const map = {}; p.data.forEach(r => { map[r.module_id] = r }); setProgress(map)
      if (done) toast.success('Module completed! 🎉')
      else toast.success('Progress updated!')
    } catch { toast.error('Failed to update progress') }
  }

  const filtered = filter === 'All' ? modules : modules.filter(m => m.category === filter)
  const completed = Object.values(progress).filter(p => p.completed).length

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Learning Hub</h1>
          <p className="text-gray-500 text-sm mt-0.5">Complete resources for your immigration success.</p>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
          <BarChart2 size={15} className="text-[hsl(var(--primary))]" />
          <span className="text-sm font-bold text-gray-700">{completed}/{modules.length} Complete</span>
        </div>
      </div>

      {/* Hub Feature Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-7">
        {HUB_CARDS.map(({ to, icon: Icon, title, desc, color, tag }) => (
          <Link key={to} to={to} className="relative overflow-hidden rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-full">{tag}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{title}</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center gap-1 text-white/90 text-xs font-semibold group-hover:gap-2 transition-all">
                Open <ChevronRight size={13} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Videos */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-red-500" fill="currentColor" />
            <h2 className="text-base font-bold text-gray-900">Featured Videos</h2>
          </div>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-52 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.slice(0, 8).map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {modules.length > 0 && (
        <div className="card p-4 mb-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold text-gray-700">Overall Learning Progress</span>
              <span className="font-bold text-[hsl(var(--primary))]">{Math.round((completed/modules.length)*100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] rounded-full transition-all duration-700"
                style={{ width: `${(completed/modules.length)*100}%` }} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black text-gray-900">{completed}/{modules.length}</p>
            <p className="text-xs text-gray-400">modules done</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATS.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === c ? 'bg-[hsl(var(--primary))] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[hsl(var(--border))] hover:text-[hsl(var(--primary))]'
            }`}>{c}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(mod => {
          const p = progress[mod.id]; const pct = p?.progress_percent||0; const done = p?.completed
          return (
            <div key={mod.id} className={`card p-5 flex flex-col hover:shadow-md transition-all duration-200 group ${done?'border-green-100':''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done?'bg-[hsl(142_70%_97%)]':'bg-[hsl(var(--muted))]'}`}>
                  {done ? <CheckCircle size={18} className="text-green-500" /> : <BookOpen size={18} className="text-[hsl(var(--primary))]" />}
                </div>
                <span className={`badge text-[10px] ${levelColor[mod.level]}`}>{mod.level}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{mod.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed flex-1">{mod.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <Clock size={10} /> {mod.duration_minutes} min &nbsp;·&nbsp; {mod.category}
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full ${done?'bg-[hsl(142_70%_42%)]':'bg-[hsl(var(--primary))]'}`} style={{ width:`${pct}%` }} />
              </div>
              <div className="flex gap-2">
                <Link to={`/learning/module/${mod.id}`} className="btn-primary flex-1 text-xs py-2 justify-center">
                  {done ? 'Review' : pct > 0 ? 'Continue' : 'Start'}
                </Link>
                {!done && (
                  <button onClick={() => updateProgress(mod.id, 100, true)}
                    className="px-3 py-2 bg-[hsl(142_70%_97%)] hover:bg-green-100 text-[hsl(142_70%_35%)] text-xs font-semibold rounded-xl border border-green-100 transition-all flex-shrink-0">
                    ✓ Done
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
