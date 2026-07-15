import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { Globe, Plus, Edit2, Trash2, X, Save } from 'lucide-react'

const EMPTY = { name:'', country:'', type:'', description:'', requirements:'', processing_time:'', fee:'', success_rate:80 }

export default function AdminVisa() {
  const [programs, setPrograms] = useState([])
  const [modal,    setModal]    = useState(null) // null | 'add' | {program obj}
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)

  const load = async () => {
    const { data } = await axios.get('/api/visa-programs')
    setPrograms(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setForm({ ...p }); setModal(p) }
  const closeModal = () => { setModal(null); setForm(EMPTY) }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name || !form.country || !form.type) { toast.error('Name, country and type are required'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await axios.post('/api/visa-programs', form)
        toast.success('Program added!')
      } else {
        await axios.put(`/api/visa-programs/${form.id}`, { ...form, active: 1 })
        toast.success('Program updated!')
      }
      closeModal(); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, name) => {
    if (!confirm(`Deactivate program "${name}"?`)) return
    try {
      await axios.delete(`/api/visa-programs/${id}`)
      toast.success('Program deactivated')
      load()
    } catch { toast.error('Failed') }
  }

  const FLAG = { Canada:'🇨🇦', Australia:'🇦🇺', 'United Kingdom':'🇬🇧', Germany:'🇩🇪', 'New Zealand':'🇳🇿', 'United States':'🇺🇸' }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Visa Programs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage immigration programs.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Program
        </button>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={closeModal}>
          <div className="card max-w-2xl w-full p-7 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">
                {modal === 'add' ? 'Add New Program' : 'Edit Program'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Program Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Canada Express Entry" className="input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Country *</label>
                <input value={form.country} onChange={e => set('country', e.target.value)}
                  placeholder="e.g. Canada" className="input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Type *</label>
                <input value={form.type} onChange={e => set('type', e.target.value)}
                  placeholder="e.g. Skilled Worker" className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={2} className="input resize-none" placeholder="Brief program description…" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Requirements</label>
                <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)}
                  rows={3} className="input resize-none" placeholder="List key requirements…" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Processing Time</label>
                <input value={form.processing_time} onChange={e => set('processing_time', e.target.value)}
                  placeholder="e.g. 6-12 months" className="input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Government Fee</label>
                <input value={form.fee} onChange={e => set('fee', e.target.value)}
                  placeholder="e.g. CAD $1,500" className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Success Rate: {form.success_rate}%
                </label>
                <input type="range" min="0" max="100" value={form.success_rate}
                  onChange={e => set('success_rate', parseInt(e.target.value))}
                  className="w-full accent-[hsl(var(--primary))]" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Save size={15} /> {modal === 'add' ? 'Add Program' : 'Save Changes'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Programs Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {programs.map(p => (
            <div key={p.id} className="card p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{FLAG[p.country] || '🌐'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.country} · {p.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(p)}
                    className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] text-gray-400 hover:text-[hsl(var(--primary))] transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => remove(p.id, p.name)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{p.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span>⏱ {p.processing_time}</span>
                <span>💰 {p.fee}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mr-3">
                  <div className="h-full bg-[hsl(var(--primary))] rounded-full" style={{ width: `${p.success_rate}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-600">{p.success_rate}% success</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
