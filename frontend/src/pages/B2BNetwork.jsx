import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Users, UserPlus, Check, X, MessageSquare, Send, Briefcase, Clock } from 'lucide-react'

function fmt(dt) {
  return new Date(dt).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function B2BNetwork() {
  const { user } = useAuth()
  const [tab,         setTab]         = useState('discover')
  const [consultants, setConsultants] = useState([])
  const [connections, setConnections] = useState([])
  const [requests,    setRequests]    = useState([])
  const [chatWith,    setChatWith]    = useState(null)
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const bottomRef = useRef(null)

  const load = async () => {
    try {
      const [c, conn, req] = await Promise.all([
        axios.get('/api/b2b/consultants'),
        axios.get('/api/b2b/connections'),
        axios.get('/api/b2b/requests'),
      ])
      setConsultants(c.data)
      setConnections(conn.data)
      setRequests(req.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const openChat = async (partner) => {
    setChatWith(partner)
    const id = partner.partner_id || partner.id
    const { data } = await axios.get(`/api/b2b/messages/${id}`)
    setMessages(data)
  }

  const sendMsg = async () => {
    if (!input.trim() || !chatWith) return
    const id = chatWith.partner_id || chatWith.id
    const { data } = await axios.post(`/api/b2b/messages/${id}`, { content: input.trim() })
    setMessages(m => [...m, data])
    setInput('')
  }

  const connect = async (id) => {
    try {
      await axios.post(`/api/b2b/connect/${id}`)
      toast.success('Request sent!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    }
  }

  const respond = async (fromId, action) => {
    await axios.put(`/api/b2b/connect/${fromId}/${action}`)
    toast.success(action === 'accept' ? 'Connected!' : 'Declined')
    load()
  }

  const TABS = [
    { key:'discover',    label:'Discover',    count: consultants.length },
    { key:'connections', label:'Connections', count: connections.length },
    { key:'requests',    label:'Requests',    count: requests.length },
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Consultant Network</h1>
        <p className="text-sm text-muted">Connect with other consultants, share leads, and grow together.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom:'1px solid hsl(var(--border))', paddingBottom:'0' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding:'0.5rem 0.75rem', background:'none', border:'none', cursor:'pointer',
              fontSize:'0.875rem', fontWeight: tab===t.key ? '600' : '400',
              color: tab===t.key ? 'hsl(var(--primary))' : 'hsl(var(--muted-fg))',
              borderBottom: tab===t.key ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              marginBottom:'-1px', transition:'color 0.15s',
            }}>
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{ background:'hsl(var(--muted))', color:'hsl(var(--muted-fg))' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sliding chat panel */}
      {chatWith && (
        <div className="fixed bottom-6 right-6 z-50 w-80 card flex flex-col" style={{ height:'420px' }}>
          {/* Chat header */}
          <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
            style={{ borderBottom:'1px solid hsl(var(--border))' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background:'hsl(var(--primary))', color:'hsl(var(--primary-fg))' }}>
              {(chatWith.partner_name || chatWith.name)?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{chatWith.partner_name || chatWith.name}</p>
              <p className="text-xs text-muted">Consultant</p>
            </div>
            <button onClick={() => setChatWith(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'hsl(var(--muted-fg))' }}>
              <X size={15}/>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hide" style={{ background:'hsl(var(--muted))' }}>
            {messages.length === 0 && (
              <p className="text-xs text-muted text-center py-8">Start a conversation.</p>
            )}
            {messages.map(m => {
              const isMe = m.from_user_id === user?.id
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed"
                    style={{
                      background: isMe ? 'hsl(var(--primary))' : 'hsl(var(--bg))',
                      color: isMe ? 'hsl(var(--primary-fg))' : 'hsl(var(--fg))',
                      border: isMe ? 'none' : '1px solid hsl(var(--border))',
                    }}>
                    {m.content}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="p-2.5 flex gap-2 flex-shrink-0" style={{ borderTop:'1px solid hsl(var(--border))' }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') sendMsg() }}
              placeholder="Type a message…" className="input flex-1 text-xs py-2"/>
            <button onClick={sendMsg} disabled={!input.trim()} className="btn-primary px-3 py-2" style={{ fontSize:'12px' }}>
              <Send size={13}/>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor:'hsl(var(--border))', borderTopColor:'hsl(var(--primary))' }}/>
        </div>
      ) : (
        <>
          {/* Discover */}
          {tab === 'discover' && (
            <div>
              {consultants.length === 0 ? (
                <div className="card p-10 text-center">
                  <Users size={28} className="mx-auto mb-3 text-muted"/>
                  <p className="text-sm text-muted">No other consultants on the platform yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {consultants.map(c => (
                    <div key={c.id} className="card p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                          style={{ background:'hsl(var(--primary))', color:'hsl(var(--primary-fg))' }}>
                          {c.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-xs text-muted truncate">{c.email}</p>
                          {c.nationality && <p className="text-xs text-muted">{c.nationality}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted mb-4">
                        <Briefcase size={11} className="inline mr-1"/>{c.service_count} services listed
                      </p>
                      {c.connection_status === 'accepted' ? (
                        <button onClick={() => openChat(c)} className="btn-primary w-full text-xs py-2">
                          <MessageSquare size={12}/> Message
                        </button>
                      ) : c.connection_status === 'pending' ? (
                        <div className="w-full py-2 text-center text-xs text-muted" style={{ background:'hsl(var(--muted))', borderRadius:'var(--radius)' }}>
                          {c.is_sender ? '⏳ Request sent' : '📩 Request received'}
                        </div>
                      ) : (
                        <button onClick={() => connect(c.id)} className="btn-secondary w-full text-xs py-2">
                          <UserPlus size={12}/> Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Connections */}
          {tab === 'connections' && (
            <div>
              {connections.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-sm text-muted">No connections yet. Go to Discover to connect with other consultants.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map(c => (
                    <div key={c.id} className="card p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                          style={{ background:'hsl(142 55% 40%)', color:'white' }}>
                          {c.partner_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{c.partner_name}</p>
                          <p className="text-xs text-muted">{c.partner_email}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'hsl(142 55% 95%)', color:'hsl(142 55% 30%)' }}>Connected</span>
                      </div>
                      <button onClick={() => openChat(c)} className="btn-primary w-full text-xs py-2">
                        <MessageSquare size={12}/> Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests */}
          {tab === 'requests' && (
            <div className="space-y-3 max-w-lg">
              {requests.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-sm text-muted">No pending connection requests.</p>
                </div>
              ) : requests.map(r => (
                <div key={r.id} className="card p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                    style={{ background:'hsl(var(--primary))', color:'hsl(var(--primary-fg))' }}>
                    {r.from_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{r.from_name}</p>
                    <p className="text-xs text-muted">{r.from_email}</p>
                    {r.message && <p className="text-xs text-muted italic mt-0.5">"{r.message}"</p>}
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Clock size={9}/>{fmt(r.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => respond(r.from_user_id, 'accept')}
                      className="btn-primary px-3 py-1.5 text-xs">
                      <Check size={13}/> Accept
                    </button>
                    <button onClick={() => respond(r.from_user_id, 'reject')}
                      className="btn-secondary px-3 py-1.5 text-xs">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
