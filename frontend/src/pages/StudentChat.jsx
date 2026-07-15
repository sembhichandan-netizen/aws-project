import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Send, MessageSquare, User, Headset, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const threadId   = `student_${user?.id}`

  const load = async () => {
    try {
      const { data } = await axios.get(`/api/messages/${threadId}`)
      setMessages(data)
    } catch { /* empty thread is fine */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Auto-scroll & poll every 10s
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  useEffect(() => {
    const t = setInterval(load, 10_000)
    return () => clearInterval(t)
  }, [])

  const send = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const { data } = await axios.post('/api/messages', { content })
      setMessages(m => [...m, data])
      setInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    } catch { toast.error('Failed to send message') }
    setSending(false)
  }

  const fmt = (dt) => {
    const d = new Date(dt)
    return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) + ' · ' + d.toLocaleDateString()
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Chat with Consultant</h1>
        <p className="text-gray-500 text-sm mt-0.5">Ask questions about your application, documents or visa program. Our team will reply shortly.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Chat Panel */}
        <div className="lg:col-span-2 card flex flex-col" style={{ height:'600px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-[hsl(var(--primary))] rounded-t-2xl">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Headset size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">AVA Consultants</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <p className="text-[hsl(var(--border))] text-xs">Online · typically replies within 1 hour</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center mb-3">
                  <MessageSquare size={24} className="text-[hsl(var(--muted-fg))]" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">No messages yet</p>
                <p className="text-xs text-gray-400 max-w-xs">Send your first message below. Our consultants will respond as soon as possible.</p>
              </div>
            ) : messages.map(msg => {
              const isMe = msg.from_user_id === user?.id
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe?'flex-row-reverse':'flex-row'} animate-fade-in`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isMe?'bg-[hsl(var(--primary))]':'bg-white border border-gray-200 shadow-sm'}`}>
                    {isMe
                      ? <User size={13} className="text-white" />
                      : <Headset size={13} className="text-[hsl(var(--primary))]" />}
                  </div>
                  <div className="max-w-[75%]">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe ? 'bg-[hsl(var(--primary))] text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 flex items-center gap-1 ${isMe?'justify-end':''}`}>
                      <Clock size={9} /> {fmt(msg.created_at)}
                      {!isMe && <span className="font-semibold text-[hsl(var(--muted-fg))]">· {msg.sender_name}</span>}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() } }}
                placeholder="Type your message… (Enter to send)"
                rows={1}
                disabled={sending}
                className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-600 transition-all placeholder-gray-400 max-h-28"
                onInput={e => { e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,112)+'px' }}
              />
              <button onClick={send} disabled={!input.trim()||sending}
                className="w-10 h-10 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0">
                <Send size={15} className={sending?'opacity-50':''} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">What can we help with?</h3>
            <div className="space-y-2.5">
              {[
                ['🌏','Visa program eligibility and requirements'],
                ['📄','Document checklist and attestation'],
                ['📊','Understanding your CRS score'],
                ['💰','Financial planning and settlement funds'],
                ['🎯','IELTS score improvement advice'],
                ['📋','Application status updates'],
                ['✈️','Pre-departure guidance'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="flex-shrink-0">{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-amber-50 border-amber-100">
            <p className="text-xs font-bold text-amber-800 mb-1">⏰ Response Time</p>
            <p className="text-xs text-amber-700 leading-relaxed">Our consultants typically respond within 1–2 hours during working hours (Mon–Sat, 9am–6pm IST).</p>
          </div>

          <div className="card p-4 bg-[hsl(var(--muted))] border-[hsl(var(--border))]">
            <p className="text-xs font-bold text-slate-900 mb-1">📧 Direct Contact</p>
            <p className="text-xs text-[hsl(var(--fg))]">support@avaimmigration.com</p>
            <p className="text-xs text-[hsl(var(--fg))]">+91 183-000-0000</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
