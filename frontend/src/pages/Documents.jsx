import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { Upload, FileText, Trash2, X, UploadCloud } from 'lucide-react'

const DOC_TYPES = ['Passport','IELTS/PTE Score Card','Educational Certificates','Work Experience Letter','Police Clearance','Bank Statement','Photographs','Medical Certificate','Birth Certificate','Other']

export default function Documents() {
  const [docs,    setDocs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [type,    setType]    = useState(DOC_TYPES[0])
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const load = async () => {
    const { data } = await axios.get('/api/documents')
    setDocs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      await axios.post('/api/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded successfully!')
      await load()
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await axios.delete(`/api/documents/${id}`)
      toast.success('Document deleted')
      setDocs(d => d.filter(x => x.id !== id))
    } catch {
      toast.error('Delete failed')
    }
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const statusCount = (s) => docs.filter(d => d.status === s).length

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Documents</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload and manage your immigration documents.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: docs.length, color: 'text-gray-900' },
          { label: 'Verified', value: statusCount('approved'), color: 'text-[hsl(142_70%_35%)]' },
          { label: 'Pending', value: statusCount('pending'), color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="card p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-gray-900">Upload Document</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Document Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="input text-sm">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 ${
              dragging ? 'border-slate-700 bg-[hsl(var(--muted))]' : 'border-gray-200 hover:border-[hsl(var(--border))] hover:bg-gray-50'
            }`}
          >
            <UploadCloud size={32} className={dragging ? 'text-[hsl(var(--muted-fg))]' : 'text-gray-300'} />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Drop file here or click</p>
              <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG · Max 10 MB</p>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
                <span className="w-4 h-4 border-2 border-[hsl(var(--border))] border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs font-semibold">Uploading…</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={e => handleUpload(e.target.files[0])} />

          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="btn-primary w-full disabled:opacity-60">
            <Upload size={15} /> Choose File
          </button>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">My Documents</h2>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-14">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No documents uploaded yet</p>
              <p className="text-xs text-gray-300 mt-1">Upload your first document using the panel on the left.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.map(doc => (
                <div key={doc.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText size={18} className="text-[hsl(var(--muted-fg))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.original_name}</p>
                    <p className="text-xs text-gray-400">{doc.type} · {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    {doc.notes && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">Note: {doc.notes}</p>
                    )}
                  </div>
                  <StatusBadge status={doc.status} />
                  <button onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 card p-4 bg-blue-50 border-blue-100 flex gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={15} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800">Document Verification</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Uploaded documents are reviewed by our consultants. You will see the status update to "approved" or "rejected" within 1–2 business days.
          </p>
        </div>
      </div>
    </Layout>
  )
}
