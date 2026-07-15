import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { MessageSquare, Send, User, Headset, Clock, Search, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const { user } = useAuth()
  const [threads,  setThreads]  = useState([])
  const [active,   setActive]   = useState(null)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [msgLoad,  setMsgLoad]  = useState(false)
  const bottomRef = useRef(null)

  const loadThreads = async () => {
    const { data } = await axios.get('/api/messages/threads')
    setThreads(data); setLoading(false)
  }

  const loadMessages = async (thread) => {
    setActive(thread); setMsgLoad(true)
    const { data } = await axios.get(`/api/messages/${thread.thread_id}`)
    setMessages(data); setMsgLoad(false)
    loadThreads()
  }

  useEffect(() => { loadThreads() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])
  useEffect(() => {
    const t = setInterval(() => {
      loadThreads()
      if (active) axios.get(`/api/messages/${active.thread_id}`).then(r => setMessages(r.data)).catch(()=>{})
    }, 8_000)
    return () => clearInterval(t)
  }, [active])

  const send = async () => {
    if (!input.trim() || !active) return
    try {
      const { data } = await axios.post('/api/messages', { content:input.trim(), thread_id:active.thread_id })
      setMessages(m => [...m, data]); setInput(''); loadThreads()
    } catch { toast.error('Failed to send') }
  }

  const fmt = dt => new Date(dt).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  const filtered = threads.filter(t => !search || t.student_name?.toLowerCase().includes(search.toLowerCase()) || t.student_email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-gray-900">Student Messages</h1>
        <p className="text-gray-500 text-sm mt-0.5">Read and reply to all student conversations.</p>
      </div>

      <div className="card overflow-hidden flex" style={{ height:'640px' }}>
        {/* Thread list */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"
                className="w-full pl-8 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600" />
              {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} className="text-gray-400" /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No messages yet</p>
              </div>
            ) : filtered.map(t => (
              <button key={t.thread_id} onClick={() => loadMessages(t)}
                className={`w-full text-left p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${active?.thread_id===t.thread_id?'bg-[hsl(var(--muted))]':''}`}>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-[hsl(var(--fg))]">
                    {t.student_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-800 truncate">{t.student_name}</p>
                      {t.unread_count > 0 && (
                        <span className="w-4 h-4 bg-[hsl(var(--primary))] text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{t.unread_count}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{t.student_email}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{t.last_message}</p>
                    {t.last_at && <p className="text-[9px] text-gray-300 mt-0.5">{fmt(t.last_at)}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message area */}
        <div className="flex-1 flex flex-col">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select a student to view their messages</p>
              </div>
            </div>
          ) : <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
              <div className="w-9 h-9 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center font-bold text-[hsl(var(--fg))] text-sm">
                {active.student_name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{active.student_name}</p>
                <p className="text-xs text-gray-400">{active.student_email} {active.nationality ? `· ${active.nationality}` : ''}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-hide">
              {msgLoad ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : messages.map(msg => {
                const isStaff = msg.sender_role !== 'user'
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isStaff?'flex-row-reverse':'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isStaff?'bg-[hsl(var(--primary))]':'bg-[hsl(var(--muted))]'}`}>
                      {isStaff ? <Headset size={11} className="text-white" /> : <User size={11} className="text-[hsl(var(--fg))]" />}
                    </div>
                    <div className="max-w-[75%]">
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${isStaff?'bg-[hsl(var(--primary))] text-white rounded-tr-sm':'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                      <p className={`text-[9px] text-gray-400 mt-0.5 flex items-center gap-1 ${isStaff?'justify-end':''}`}>
                        <Clock size={8} /> {fmt(msg.created_at)} · {msg.sender_name}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-end">
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() } }}
                placeholder="Reply to student… (Enter to send)"
                rows={1} className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-600 transition-all placeholder-gray-400 max-h-24"
                onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,96)+'px' }} />
              <button onClick={send} disabled={!input.trim()}
                className="w-9 h-9 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all active:scale-95">
                <Send size={14} />
              </button>
            </div>
          </>}
        </div>
      </div>
    </Layout>
  )
}
