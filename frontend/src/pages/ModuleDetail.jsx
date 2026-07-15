import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Layout from '../components/Layout'
import VideoCard from '../components/VideoCard'
import { BookOpen, CheckCircle, Clock, ArrowLeft, StickyNote, Plus, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const NOTE_COLORS = { yellow:'bg-amber-50 border-amber-200', blue:'bg-blue-50 border-blue-200', green:'bg-emerald-50 border-emerald-200', pink:'bg-pink-50 border-pink-200' }

export default function ModuleDetail() {
  const { id } = useParams()
  const [module,  setModule]  = useState(null)
  const [videos,  setVideos]  = useState([])
  const [notes,   setNotes]   = useState([])
  const [progress,setProgress]= useState(null)
  const [loading, setLoading] = useState(true)
  const [noteForm,setNoteForm]= useState(null)
  const [newNote, setNewNote] = useState({ title:'', content:'', color:'yellow' })

  useEffect(() => {
    Promise.all([
      axios.get('/api/learning'),
      axios.get(`/api/resources?module_id=${id}&type=video`),
      axios.get('/api/resources/notes'),
      axios.get('/api/learning/progress'),
    ]).then(([ms, vs, ns, ps]) => {
      setModule(ms.data.find(m => m.id === parseInt(id)))
      setVideos(vs.data)
      setNotes(ns.data.filter(n => n.module_id === parseInt(id)))
      const p = ps.data.find(p => p.module_id === parseInt(id))
      setProgress(p || null)
    }).finally(() => setLoading(false))
  }, [id])

  const updateProg = async (pct, done) => {
    await axios.post(`/api/learning/${id}/progress`, { progress_percent: pct, completed: done })
    const p = await axios.get('/api/learning/progress')
    const found = p.data.find(x => x.module_id === parseInt(id))
    setProgress(found || null)
    toast.success(done ? 'Module completed! 🎉' : 'Progress saved!')
  }

  const saveNote = async () => {
    if (!newNote.title.trim()) { toast.error('Title required'); return }
    const { data } = await axios.post('/api/resources/notes', { ...newNote, module_id: parseInt(id) })
    setNotes(n => [data, ...n]); setNoteForm(null); setNewNote({ title:'', content:'', color:'yellow' })
    toast.success('Note saved!')
  }

  const deleteNote = async (nid) => {
    await axios.delete(`/api/resources/notes/${nid}`)
    setNotes(n => n.filter(x => x.id !== nid)); toast.success('Note deleted')
  }

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" /></div></Layout>
  if (!module) return <Layout><div className="text-center py-20"><p className="text-gray-400">Module not found.</p></div></Layout>

  const pct  = progress?.progress_percent || 0
  const done = progress?.completed || false

  const contentSections = module.content?.split('\n\n').filter(Boolean) || []

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[hsl(var(--primary))] mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Learning Hub
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-[hsl(var(--muted))] text-[hsl(var(--fg))] text-[10px]">{module.category}</span>
              <span className="badge bg-gray-100 text-gray-600 text-[10px]">{module.level}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10}/> {module.duration_minutes} min</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">{module.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{module.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!done && <button onClick={() => updateProg(100, true)} className="btn-primary text-sm py-2 px-4"><CheckCircle size={14}/> Mark Complete</button>}
            {done && <span className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(142_70%_35%)] bg-[hsl(142_70%_97%)] border border-green-100 px-4 py-2 rounded-xl"><CheckCircle size={14}/> Completed</span>}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 card p-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${done?'bg-[hsl(142_70%_42%)]':'bg-[hsl(var(--primary))]'}`} style={{ width:`${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-600 flex-shrink-0">{pct}%</span>
          {!done && (
            <div className="flex gap-1.5 flex-shrink-0">
              {[33,66,100].map(p => (
                <button key={p} onClick={() => updateProg(p, p===100)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${pct>=p?'bg-[hsl(var(--primary))] text-white':'bg-gray-100 text-gray-500 hover:bg-[hsl(var(--muted))]'}`}>{p}%</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Module Content */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-[hsl(var(--primary))]" /> Module Content
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              {contentSections.map((section, i) => {
                const lines = section.split('\n')
                const heading = lines[0]
                const body = lines.slice(1).join('\n')
                const isBold = heading.startsWith('**') && heading.endsWith('**')
                return (
                  <div key={i} className="border-l-2 border-[hsl(var(--border))] pl-4">
                    {isBold ? (
                      <p className="text-sm font-black text-[hsl(var(--fg))] mb-2 uppercase tracking-wide text-xs">
                        {heading.replace(/\*\*/g,'')}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-gray-800 mb-1">{heading}</p>
                    )}
                    {body && (
                      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {body.split('\n').map((line, j) => (
                          <p key={j} className={`mb-0.5 ${line.startsWith('□') ? 'font-medium text-gray-700' : line.startsWith('✓') ? 'text-[hsl(142_70%_28%)]' : line.startsWith('✗') ? 'text-red-600' : ''}`}>
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Videos */}
          {videos.length > 0 && (
            <div className="card p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px]">▶</span>
                </span>
                Video Resources ({videos.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {videos.map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Notes */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <StickyNote size={14} className="text-amber-500" /> My Notes
              </h3>
              <button onClick={() => setNoteForm(true)}
                className="w-7 h-7 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center hover:bg-[hsl(var(--primary))] transition-colors">
                <Plus size={13} className="text-white" />
              </button>
            </div>

            {noteForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <input value={newNote.title} onChange={e => setNewNote(n=>({...n,title:e.target.value}))}
                  placeholder="Note title" className="input text-xs py-2" autoFocus />
                <textarea value={newNote.content} onChange={e => setNewNote(n=>({...n,content:e.target.value}))}
                  placeholder="Write your note…" rows={3} className="input text-xs py-2 resize-none" />
                <div className="flex gap-1.5">
                  {Object.keys(NOTE_COLORS).map(c => (
                    <button key={c} onClick={() => setNewNote(n=>({...n,color:c}))}
                      className={`w-5 h-5 rounded-full border-2 ${NOTE_COLORS[c].split(' ')[0]} ${newNote.color===c?'border-gray-700':'border-transparent'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setNoteForm(null)} className="btn-secondary flex-1 text-xs py-1.5">Cancel</button>
                  <button onClick={saveNote} className="btn-primary flex-1 text-xs py-1.5">Save</button>
                </div>
              </div>
            )}

            {notes.length === 0 && !noteForm ? (
              <p className="text-xs text-gray-400 text-center py-6">No notes for this module yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto scrollbar-hide">
                {notes.map(note => (
                  <div key={note.id} className={`relative p-3 rounded-xl border ${NOTE_COLORS[note.color]||NOTE_COLORS.yellow} group`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-gray-800">{note.title}</p>
                      <button onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                        <X size={11} />
                      </button>
                    </div>
                    {note.content && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{note.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Module */}
          <div className="card p-4 bg-[hsl(var(--muted))] border-[hsl(var(--border))]">
            <p className="text-xs font-bold text-[hsl(var(--fg))] mb-2">Continue Learning</p>
            <Link to="/learning" className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--fg))] transition-colors">
              <BookOpen size={14} /> Back to All Modules <ChevronRight size={13} className="ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
