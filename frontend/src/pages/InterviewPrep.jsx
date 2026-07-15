import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import VideoCard from '../components/VideoCard'
import { ArrowLeft, Mic, ChevronDown, ChevronUp, CheckCircle, XCircle, Play } from 'lucide-react'

const QA = [
  { cat:'Personal',     q:'Tell me about yourself.',                  a:'Keep it professional. Cover: nationality, education, work experience, and why you want to immigrate. Limit to 2-3 minutes. End with your immigration goal.' },
  { cat:'Personal',     q:'Why do you want to immigrate to [country]?', a:'Be specific: professional opportunities, quality of life, family ties, education. Show you researched the country. Never say "just for money" — connect to career/life goals.' },
  { cat:'Personal',     q:'What are your long-term plans?',           a:'Show genuine intent to settle and contribute. Mention integration plans, career path, community involvement. If asked about returning — be honest about plans.' },
  { cat:'Work',         q:'Describe your current/most recent job.',   a:'Role title, company type, key responsibilities, achievements. Use STAR method: Situation → Task → Action → Result. Keep it 2-3 minutes.' },
  { cat:'Work',         q:'Do you have a job offer in [country]?',    a:'If yes: provide employer name, role, salary. If no: explain your job-search plan, your skills in demand, industry connections.' },
  { cat:'Work',         q:'Why did you leave your previous job?',     a:'Keep it positive — growth opportunity, relocation, career change. Never badmouth former employers. Focus on what you gained.' },
  { cat:'Financial',    q:'How will you support yourself financially?', a:'Show settlement funds bank statement, job offer salary, or sponsor details. Quote exact amounts. Show you have a realistic financial plan.' },
  { cat:'Financial',    q:'How much money are you bringing with you?', a:'State the exact amount and the source (savings, sale of property, etc.). Show 6-month bank statements. Show funds are legitimate.' },
  { cat:'Immigration',  q:'Have you ever been refused a visa?',       a:'Be honest — they can check. If yes: explain the reason, what changed, how you addressed the issue. Dishonesty leads to permanent ban.' },
  { cat:'Immigration',  q:'Do you have family/friends in [country]?', a:'Be honest. Having family there is generally positive — shows support system. Explain your relationship and their status.' },
  { cat:'Immigration',  q:'Have you visited [country] before?',       a:'If yes: when, why, how long, legal departure. If no: explain what you know about the country (research shows genuine interest).' },
  { cat:'Education',    q:'Describe your educational background.',    a:'Institutions attended, degrees obtained, relevant subjects, grades/achievements. Explain how your education qualifies you for your target career.' },
  { cat:'Education',    q:'Is your degree recognized in [country]?',  a:'If yes: state the evaluation body (WES, NARIC, etc.) and outcome. If pending: explain timeline. Show you are taking the right steps.' },
]

const TIPS = [
  { icon:'📁', tip:'Organize documents in clear sections with labels/dividers' },
  { icon:'👔', tip:'Dress formally — business professional, clean, conservative' },
  { icon:'⏰', tip:'Arrive 30 minutes early — account for security and queues' },
  { icon:'👁️', tip:'Maintain natural eye contact — look at the officer, not the floor' },
  { icon:'🗣️', tip:'Speak clearly at moderate speed — do not rush answers' },
  { icon:'✅', tip:'Answer only what is asked — do not over-explain or volunteer extra info' },
  { icon:'🚫', tip:'Never lie or exaggerate — officers are highly trained to detect dishonesty' },
  { icon:'😌', tip:'Stay calm — nerves are normal, breathe and take a moment before answering' },
  { icon:'📵', tip:'Switch phone to silent before entering — interruptions look unprofessional' },
  { icon:'📋', tip:'Know your application file thoroughly — review all submitted details' },
]

const CATS = ['All', 'Personal', 'Work', 'Financial', 'Immigration', 'Education']

export default function InterviewPrep() {
  const [videos,  setVideos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(null)
  const [cat,     setCat]     = useState('All')

  useEffect(() => {
    axios.get('/api/resources?category=Interview&type=video')
      .then(r => setVideos(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = cat === 'All' ? QA : QA.filter(q => q.cat === cat)

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[hsl(var(--primary))] mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Learning Hub
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-700 rounded-xl flex items-center justify-center">
            <Mic size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Interview Preparation</h1>
            <p className="text-gray-500 text-sm">50 Q&A, model answers, videos, tips for visa and embassy interviews.</p>
          </div>
        </div>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[['50+','Practice Questions'],['4','Video Guides'],['10','Expert Tips'],['5','Categories']].map(([v,l])=>(
          <div key={l} className="card p-3 text-center">
            <p className="text-xl font-black text-[hsl(var(--fg))]">{v}</p>
            <p className="text-xs text-gray-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Q&A */}
        <div className="lg:col-span-2 space-y-5">
          {/* Videos */}
          <div className="card p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Play size={15} className="text-red-500" fill="currentColor" /> Interview Videos
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i=><div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {videos.map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            )}
          </div>

          {/* Q&A Section */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Common Interview Questions</h2>
              <span className="text-xs text-gray-400">{filtered.length} questions</span>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-4">
              {CATS.map(c => (
                <button key={c} onClick={() => { setCat(c); setOpen(null) }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    cat === c ? 'bg-stone-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]'
                  }`}>{c}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filtered.map((item, i) => (
                <div key={i} className={`border rounded-xl overflow-hidden transition-all ${open===i?'border-[hsl(var(--border))] shadow-sm':'border-gray-100'}`}>
                  <button onClick={() => setOpen(open===i ? null : i)}
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`badge text-[10px] flex-shrink-0 ${
                        item.cat==='Personal'?'bg-blue-50 text-blue-700':
                        item.cat==='Work'?'bg-[hsl(142_70%_97%)] text-[hsl(142_70%_28%)]':
                        item.cat==='Financial'?'bg-amber-50 text-amber-700':
                        item.cat==='Immigration'?'bg-[hsl(var(--muted))] text-[hsl(var(--fg))]':
                        'bg-rose-50 text-rose-700'
                      }`}>{item.cat}</span>
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.q}</p>
                    </div>
                    {open===i ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0 ml-2"/> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0 ml-2"/>}
                  </button>
                  {open===i && (
                    <div className="px-4 pb-4 pt-1 bg-[hsl(var(--muted))]/50 border-t border-stone-100 animate-slide-up">
                      <p className="text-xs font-bold text-[hsl(var(--fg))] mb-2 uppercase tracking-wide">Model Answer Approach</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">✅ Interview Do's</h3>
            <div className="space-y-2">
              {TIPS.slice(0,5).map((t,i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-[hsl(142_70%_97%)] rounded-xl border border-green-100">
                  <span className="text-base flex-shrink-0">{t.icon}</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">❌ Common Mistakes</h3>
            <div className="space-y-2">
              {TIPS.slice(5).map((t,i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-red-50/70 rounded-xl border border-red-100">
                  <XCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 bg-[hsl(var(--muted))] border-stone-100">
            <p className="text-xs font-bold text-[hsl(var(--fg))] mb-2">📄 Documents to Carry</p>
            <ul className="space-y-1.5">
              {['Original passport + copy','Visa application reference number','All original documents + 2 sets of copies','Offer letter (if applicable)','Financial statements','Appointment letter/email'].map((d,i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[hsl(var(--fg))]">
                  <CheckCircle size={10} className="text-[hsl(var(--muted-fg))] flex-shrink-0" /> {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
