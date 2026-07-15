import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import VideoCard from '../components/VideoCard'
import { useAuth } from '../context/AuthContext'
import { ClipboardList, FileText, BookOpen, Globe, ArrowRight, Plus, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const NOTE_COLORS = {
  yellow: { bg:'#fefce8', border:'#fef08a' },
  blue:   { bg:'#eff6ff', border:'#bfdbfe' },
  green:  { bg:'#f0fdf4', border:'#bbf7d0' },
  pink:   { bg:'#fdf2f8', border:'#f9a8d4' },
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [apps,     setApps]     = useState([])
  const [docs,     setDocs]     = useState([])
  const [modules,  setModules]  = useState([])
  const [progress, setProgress] = useState({})
  const [videos,   setVideos]   = useState([])
  const [notes,    setNotes]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [noteModal,setNoteModal]= useState(false)
  const [newNote,  setNewNote]  = useState({ title:'', content:'', color:'yellow' })

  useEffect(() => {
    Promise.all([
      axios.get('/api/applications'), axios.get('/api/documents'),
      axios.get('/api/learning'), axios.get('/api/learning/progress'),
      axios.get('/api/resources?type=video'), axios.get('/api/resources/notes'),
    ]).then(([a,d,m,p,v,n]) => {
      setApps(a.data); setDocs(d.data); setModules(m.data)
      const map={}; p.data.forEach(r=>{map[r.module_id]=r}); setProgress(map)
      setVideos(v.data.slice(0,4)); setNotes(n.data)
    }).finally(()=>setLoading(false))
  }, [])

  const completedModules = Object.values(progress).filter(p=>p.completed).length

  const saveNote = async () => {
    if (!newNote.title.trim()) { toast.error('Title required'); return }
    const { data } = await axios.post('/api/resources/notes', newNote)
    setNotes(n=>[data,...n]); setNoteModal(false); setNewNote({title:'',content:'',color:'yellow'})
    toast.success('Note saved')
  }

  const deleteNote = async (id) => {
    await axios.delete(`/api/resources/notes/${id}`)
    setNotes(n=>n.filter(x=>x.id!==id))
    toast.success('Deleted')
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Good day, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted">Here's your immigration overview.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label:'Applications', value:apps.length,         to:'/applications', icon:ClipboardList },
          { label:'Documents',    value:docs.length,         to:'/documents',    icon:FileText },
          { label:'Modules done', value:completedModules,    to:'/learning',     icon:BookOpen },
          { label:'Pending docs', value:docs.filter(d=>d.status==='pending').length, to:'/documents', icon:FileText },
        ].map(({ label, value, to, icon:Icon }) => (
          <Link key={label} to={to} className="card p-4 flex items-start gap-3 hover:shadow-md transition-shadow" style={{textDecoration:'none'}}>
            <Icon size={16} style={{ color:'hsl(var(--muted-fg))', marginTop:'2px' }} />
            <div>
              <p className="text-xl font-bold" style={{ color:'hsl(var(--fg))' }}>{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Videos */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Learning Videos</h2>
            <Link to="/learning" className="text-xs" style={{color:'hsl(var(--primary))'}}>View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i=><div key={i} className="h-36 rounded-lg bg-gray-100 animate-pulse"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {videos.map(v=><VideoCard key={v.id} video={v}/>)}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4">Learning Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted">Overall</span>
              <span className="font-semibold">{completedModules}/{modules.length} modules</span>
            </div>
            <div className="h-1.5 rounded-full" style={{background:'hsl(var(--muted))'}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{width:modules.length?`${(completedModules/modules.length)*100}%`:'0%',background:'hsl(var(--primary))'}}>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
            {modules.slice(0,6).map(m=>{
              const p=progress[m.id]; const pct=p?.progress_percent||0; const done=p?.completed
              return (
                <Link key={m.id} to={`/learning/module/${m.id}`}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors"
                  style={{textDecoration:'none',color:'hsl(var(--fg))'}}
                  onMouseEnter={e=>e.currentTarget.style.background='hsl(var(--muted))'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{background:done?'hsl(142 70% 45%)':'hsl(var(--primary))',opacity:pct>0?1:0.3}}/>
                  <p className="text-xs flex-1 truncate">{m.title}</p>
                  <span className="text-[10px] text-muted">{pct}%</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Applications */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Recent Applications</h2>
            <Link to="/applications" className="text-xs" style={{color:'hsl(var(--primary))'}}>View all →</Link>
          </div>
          {apps.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted mb-3">No applications yet.</p>
              <Link to="/programs" className="btn-primary text-xs px-3 py-1.5">Browse programs</Link>
            </div>
          ) : apps.slice(0,5).map(app => (
            <div key={app.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{borderColor:'hsl(var(--border))'}}>
              <Globe size={14} style={{color:'hsl(var(--muted-fg))',flexShrink:0}}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{app.program_name}</p>
                <p className="text-xs text-muted">{app.country} · {new Date(app.submitted_at).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={app.status}/>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">My Notes</h2>
            <button onClick={()=>setNoteModal(true)} className="btn-secondary px-2.5 py-1 text-xs">
              <Plus size={12}/> Add
            </button>
          </div>

          {notes.length===0 ? (
            <p className="text-xs text-muted text-center py-8">No notes yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {notes.slice(0,5).map(note=>{
                const c=NOTE_COLORS[note.color]||NOTE_COLORS.yellow
                return (
                  <div key={note.id} className="relative p-3 rounded-lg group"
                    style={{background:c.bg,border:`1px solid ${c.border}`}}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold">{note.title}</p>
                      <button onClick={()=>deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{background:'none',border:'none',cursor:'pointer',color:'hsl(var(--muted-fg))'}}>
                        <X size={11}/>
                      </button>
                    </div>
                    {note.content && <p className="text-xs mt-1 text-muted leading-relaxed line-clamp-2">{note.content}</p>}
                    <p className="text-[9px] text-muted mt-1.5 flex items-center gap-1">
                      <Clock size={8}/>{new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'hsl(0 0% 0% / 0.4)'}}>
          <div className="card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Note</h3>
              <button onClick={()=>setNoteModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'hsl(var(--muted-fg))'}}>
                <X size={16}/>
              </button>
            </div>
            <div className="space-y-3">
              <input value={newNote.title} onChange={e=>setNewNote(n=>({...n,title:e.target.value}))}
                placeholder="Note title…" className="input" autoFocus/>
              <textarea value={newNote.content} onChange={e=>setNewNote(n=>({...n,content:e.target.value}))}
                placeholder="Content…" rows={4} className="input resize-none"/>
              <div className="flex gap-2">
                {Object.entries(NOTE_COLORS).map(([color,c])=>(
                  <button key={color} onClick={()=>setNewNote(n=>({...n,color}))}
                    className="w-6 h-6 rounded-full transition-transform"
                    style={{background:c.bg,border:`2px solid ${newNote.color===color?'hsl(var(--fg))':c.border}`,
                      transform:newNote.color===color?'scale(1.2)':'scale(1)',cursor:'pointer'}}/>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setNoteModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveNote} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
