import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import VideoCard from '../components/VideoCard'
import { ArrowLeft, GraduationCap, Headphones, BookOpen, PenTool, Mic } from 'lucide-react'

const SKILLS = [
  { key:'all',       label:'All',       icon: GraduationCap, color:'indigo',
    band:'9.0', time:'—', questions:'—', desc:'Complete overview of all 4 IELTS sections' },
  { key:'listening', label:'Listening', icon: Headphones,    color:'blue',
    band:'7-8', time:'30 min', questions:'40 Q', desc:'4 sections, heard once — focus on prediction & keyword spotting' },
  { key:'reading',   label:'Reading',   icon: BookOpen,      color:'emerald',
    band:'7+',  time:'60 min', questions:'40 Q', desc:'3 passages — skim, scan, and manage time per passage' },
  { key:'writing',   label:'Writing',   icon: PenTool,       color:'amber',
    band:'7+',  time:'60 min', questions:'2 Tasks', desc:'Task 1: graph description; Task 2: essay — use academic vocabulary' },
  { key:'speaking',  label:'Speaking',  icon: Mic,           color:'rose',
    band:'7+',  time:'11-14 min', questions:'3 Parts', desc:'Face-to-face with examiner — fluency, vocabulary, grammar, pronunciation' },
]

const NOTES = {
  listening: [
    '📝 Read questions BEFORE the audio starts',
    '🎯 Predict the type of answer (name, number, date)',
    '⚠️ Answers come in ORDER — follow along',
    '🔍 Watch for distractors (speaker changes answer)',
    '✏️ Spelling counts — double-check all written answers',
    '⏰ Use 10 min transfer time to check spelling & grammar',
    '📻 Section 4 (academic lecture) is hardest — stay focused',
  ],
  reading: [
    '⏰ 17 min Passage 1 → 20 min Passage 2 → 23 min Passage 3',
    '🔍 TFNG: False = contradicts text | Not Given = not mentioned',
    '📌 Matching headings: read all headings first',
    '✍️ Sentence completion: use EXACT words from passage',
    '🔄 Questions paraphrase the passage — identify synonyms',
    '⚡ Don\'t get stuck — skip and return to hard questions',
    '📖 Skim first paragraph and last sentence of each para',
  ],
  writing: [
    '📊 Task 1: 150+ words in 20 min — describe main trends only',
    '✍️ Task 2: 250+ words in 40 min — plan before writing',
    '🎯 Always write an overview in Task 1 (most missed!)',
    '🔗 Use discourse markers: Furthermore / However / As a result',
    '❌ Never use contractions: don\'t, can\'t, I\'ve',
    '📏 Under word count = automatic band reduction',
    '📋 Task 2 essay types: Opinion / Discussion / Problem-Solution',
  ],
  speaking: [
    '💬 Part 1: Give 2-3 sentence answers with reasons',
    '📝 Part 2: Use 1 min prep time, speak 1-2 minutes',
    '🤔 Part 3: Show critical thinking — agree/disagree with reasons',
    '🔁 Paraphrase the question before answering',
    '✅ Self-correct naturally — don\'t over-apologize',
    '🎭 Pronunciation > accent — speak clearly',
    '🚫 Never memorize scripts — examiners detect it',
  ],
}

const BAND_TIPS = {
  listening: { b6: 'Score 23+/40', b7: 'Score 30+/40', b8: 'Score 35+/40', b9: 'Score 39-40/40' },
  reading:   { b6: 'Score 23+/40', b7: 'Score 30+/40', b8: 'Score 35+/40', b9: 'Score 39-40/40' },
  writing:   { b6: 'Adequate content, some errors', b7: 'Clear position, few errors', b8: 'Sophisticated vocabulary', b9: 'Expert-level writing' },
  speaking:  { b6: 'Communicates effectively', b7: 'Fluent with minor errors', b8: 'Very fluent, precise', b9: 'Complete mastery' },
}

export default function IELTSPrep() {
  const [videos,  setVideos]  = useState([])
  const [skill,   setSkill]   = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/resources?category=IELTS&type=video')
      .then(r => setVideos(r.data))
      .finally(() => setLoading(false))
  }, [])

  const skillVideos = skill === 'all' ? videos : videos.filter(v =>
    v.title.toLowerCase().includes(skill) ||
    v.description?.toLowerCase().includes(skill)
  )

  const activeSkill = SKILLS.find(s => s.key === skill)

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[hsl(var(--primary))] mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Learning Hub
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">IELTS Preparation Hub</h1>
            <p className="text-gray-500 text-sm">All 4 skills covered with videos, notes and strategies.</p>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div className="card p-5 mb-6 bg-gradient-to-r from-slate-50 to-violet-50 border-[hsl(var(--border))]">
        <div className="grid sm:grid-cols-4 gap-4 text-center">
          {[['7 hrs', 'Total Test Time'], ['4', 'Test Sections'], ['120', 'Total Questions'], ['0-9', 'Band Scale']].map(([v,l]) => (
            <div key={l}>
              <p className="text-2xl font-black text-[hsl(var(--fg))]">{v}</p>
              <p className="text-xs text-[hsl(var(--muted-fg))] font-medium">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SKILLS.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setSkill(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              skill === key ? 'bg-[hsl(var(--primary))] text-white shadow-md shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-[hsl(var(--border))] hover:text-[hsl(var(--primary))]'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Active Skill Info */}
      <div className="card p-5 mb-6 border-l-4 border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {activeSkill && <activeSkill.icon size={16} className="text-[hsl(var(--primary))]" />}
              <h2 className="text-base font-bold text-gray-900">
                {skill === 'all' ? 'IELTS Overview' : `${activeSkill?.label} Section`}
              </h2>
            </div>
            <p className="text-sm text-gray-500">{activeSkill?.desc}</p>
          </div>
          {skill !== 'all' && (
            <div className="flex gap-4 text-right flex-shrink-0 ml-4">
              <div><p className="text-xs text-gray-400">Duration</p><p className="text-sm font-bold text-gray-800">{activeSkill?.time}</p></div>
              <div><p className="text-xs text-gray-400">Questions</p><p className="text-sm font-bold text-gray-800">{activeSkill?.questions}</p></div>
              <div><p className="text-xs text-gray-400">Target Band</p><p className="text-sm font-bold text-[hsl(var(--primary))]">{activeSkill?.band}</p></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Videos */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            📹 {skill === 'all' ? 'All IELTS Videos' : `${activeSkill?.label} Videos`} ({skillVideos.length})
          </h2>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-52 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
            </div>
          ) : skillVideos.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-sm text-gray-400">No specific videos for this skill. Try selecting "All".</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {skillVideos.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          )}
        </div>

        {/* Strategy Notes & Band Guide */}
        <div className="space-y-4">
          {skill !== 'all' && NOTES[skill] && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">✏️ Key Strategies</h3>
              <ul className="space-y-2">
                {NOTES[skill].map((tip, i) => (
                  <li key={i} className="text-xs text-gray-700 leading-relaxed p-2 bg-gray-50 rounded-lg">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {skill !== 'all' && BAND_TIPS[skill] && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">🎯 Band Score Guide</h3>
              <div className="space-y-2">
                {[['9','bg-[hsl(142_70%_42%)]'],['8','bg-blue-500'],['7','bg-amber-500'],['6','bg-orange-500']].map(([b, color]) => (
                  <div key={b} className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-black">{b}</span>
                    </div>
                    <p className="text-xs text-gray-600">{BAND_TIPS[skill][`b${b}`]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skill === 'all' && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">📋 IELTS Quick Facts</h3>
              <div className="space-y-2 text-xs text-gray-600">
                {['Valid for 2 years', 'Accepted in 140+ countries', 'Academic vs General Training', 'Score scale: 1-9 bands', 'Can retake anytime', 'Online & Paper-based options', 'Results in 13 days (paper)'].map((f,i) => (
                  <p key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full flex-shrink-0" />{f}
                  </p>
                ))}
              </div>
            </div>
          )}

          <Link to="/learning/module/1" className="card p-4 flex items-center gap-3 hover:shadow-md hover:border-[hsl(var(--border))] transition-all group">
            <div className="w-9 h-9 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Full IELTS Module</p>
              <p className="text-xs text-gray-400">Read complete study guide</p>
            </div>
            <ArrowLeft size={14} className="ml-auto rotate-180 text-gray-300 group-hover:text-[hsl(var(--muted-fg))] transition-colors" />
          </Link>
        </div>
      </div>
    </Layout>
  )
}
