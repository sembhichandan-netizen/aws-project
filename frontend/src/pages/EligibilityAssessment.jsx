import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { ChevronRight, ChevronLeft, CheckCircle, Award, TrendingUp, AlertCircle } from 'lucide-react'

export default function EligibilityAssessment() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers]     = useState({})
  const [step, setStep]           = useState(0)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [history, setHistory]     = useState([])

  useEffect(() => {
    Promise.all([
      axios.get('/api/eligibility/questions'),
      axios.get('/api/eligibility/history'),
    ]).then(([q, h]) => {
      setQuestions(q.data)
      setHistory(h.data)
    }).finally(() => setFetching(false))
  }, [])

  const current = questions[step]
  const progress = questions.length ? ((step) / questions.length) * 100 : 0

  const handleAnswer = (val) => {
    setAnswers(a => ({ ...a, [current.field_name]: val }))
  }

  const next = () => {
    if (!answers[current.field_name]) { toast.error('Please answer this question to continue'); return }
    if (step < questions.length - 1) setStep(s => s + 1)
  }

  const submit = async () => {
    if (!answers[current.field_name]) { toast.error('Please answer this question'); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/eligibility/assess', { answers })
      setResult(data)
      const h = await axios.get('/api/eligibility/history')
      setHistory(h.data)
      toast.success('Assessment completed!')
    } catch {
      toast.error('Assessment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setAnswers({}); setStep(0) }

  const resultConfig = {
    'High Eligibility':     { color: 'text-[hsl(142_70%_35%)]',  bg: 'bg-[hsl(142_70%_97%)]',  border: 'border-green-100', icon: CheckCircle, msg: "Excellent! You have a strong profile for immigration. We recommend applying to top-tier programs." },
    'Moderate Eligibility': { color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100', icon: TrendingUp,  msg: "Good profile! With some improvements to language scores or experience, you can boost your chances significantly." },
    'Low Eligibility':      { color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100',   icon: AlertCircle, msg: "Your profile needs strengthening. Focus on language tests, gaining more work experience, or upgrading education." },
  }

  if (fetching) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Eligibility Assessment</h1>
        <p className="text-gray-500 text-sm mt-0.5">Answer {questions.length} questions to discover your immigration eligibility.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Assessment */}
        <div className="lg:col-span-2">
          {result ? (
            /* Result Card */
            <div className="card p-8 animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sm">
                  <span className="text-3xl font-black text-white">{result.score}</span>
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Score out of 100</p>
                <h2 className="text-2xl font-black text-gray-900 mb-1">{result.result}</h2>

                {(() => {
                  const cfg = resultConfig[result.result]
                  const Icon = cfg?.icon
                  return (
                    <div className={`inline-flex items-start gap-3 mt-4 p-4 rounded-xl border text-left ${cfg?.bg} ${cfg?.border}`}>
                      {Icon && <Icon size={18} className={`${cfg?.color} flex-shrink-0 mt-0.5`} />}
                      <p className={`text-sm leading-relaxed ${cfg?.color}`}>{cfg?.msg}</p>
                    </div>
                  )
                })()}
              </div>

              {/* Score breakdown */}
              <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-gray-700">Your Answers</p>
                {questions.map(q => (
                  <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-xs text-gray-500 flex-1 pr-4">{q.question}</p>
                    <p className="text-xs font-semibold text-gray-800 flex-shrink-0">{answers[q.field_name] || '–'}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="btn-secondary flex-1">Take Again</button>
                <a href="/programs" className="btn-primary flex-1">View Visa Programs</a>
              </div>
            </div>
          ) : (
            /* Question Card */
            <div className="card p-8 animate-fade-in">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Question {step + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {current && (
                <div key={step} className="animate-slide-up">
                  <p className="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-3">
                    Question {step + 1}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{current.question}</h2>

                  {current.type === 'number' ? (
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={answers[current.field_name] || ''}
                      onChange={e => handleAnswer(e.target.value)}
                      placeholder="Enter a number…"
                      className="input text-lg font-semibold max-w-xs"
                      autoFocus
                    />
                  ) : (
                    <div className="grid gap-2.5">
                      {current.options?.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 text-sm font-medium ${
                            answers[current.field_name] === opt
                              ? 'border-slate-700 bg-[hsl(var(--muted))] text-[hsl(var(--fg))]'
                              : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            answers[current.field_name] === opt ? 'border-slate-700 bg-[hsl(var(--primary))]' : 'border-gray-300'
                          }`}>
                            {answers[current.field_name] === opt && <span className="w-2 h-2 bg-white rounded-full" />}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    {step > 0 && (
                      <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
                        <ChevronLeft size={16} /> Back
                      </button>
                    )}
                    {step < questions.length - 1 ? (
                      <button onClick={next} className="btn-primary flex-1">
                        Next <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button onClick={submit} disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                        {loading
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Award size={16} /> Get My Results</>}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Panel */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Assessment History</h3>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No past assessments yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${
                      h.result?.includes('High') ? 'text-[hsl(142_70%_35%)]'
                      : h.result?.includes('Moderate') ? 'text-amber-600'
                      : 'text-red-600'
                    }`}>{h.result}</span>
                    <span className="text-xs font-black text-gray-700">{h.score}/100</span>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
