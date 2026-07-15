import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'

const CAT_COLORS = {
  'IELTS':         '#dbeafe',
  'Country Guide': '#dcfce7',
  'Interview':     '#f3e8ff',
  'Documentation': '#fef3c7',
  'Finance':       '#ffe4e6',
}

export default function VideoCard({ video, compact = false }) {
  const [thumbErr, setThumbErr] = useState(false)
  if (!video?.video_id) return null

  const thumb = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`
  const openYT = () => window.open(`https://www.youtube.com/watch?v=${video.video_id}`, '_blank', 'noopener,noreferrer')
  const bg = CAT_COLORS[video.category] || '#f3f4f6'

  if (compact) {
    return (
      <button onClick={openYT} className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors"
        style={{background:'hsl(var(--bg))',border:'1px solid hsl(var(--border))',cursor:'pointer'}}
        onMouseEnter={e=>e.currentTarget.style.background='hsl(var(--muted))'}
        onMouseLeave={e=>e.currentTarget.style.background='hsl(var(--bg))'}>
        <div className="relative w-16 h-11 rounded flex-shrink-0 overflow-hidden" style={{background:bg}}>
          {!thumbErr && <img src={thumb} alt="" className="w-full h-full object-cover" onError={()=>setThumbErr(true)}/>}
          <div className="absolute inset-0 flex items-center justify-center" style={{background:'hsl(0 0% 0% / 0.2)'}}>
            <Play size={10} style={{color:'white'}} fill="white"/>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium line-clamp-2" style={{color:'hsl(var(--fg))'}}>{video.title}</p>
          <p className="text-[10px] mt-0.5 text-muted">{video.category}</p>
        </div>
      </button>
    )
  }

  return (
    <div className="card overflow-hidden" style={{cursor:'pointer'}} onClick={openYT}>
      <div className="relative h-36 overflow-hidden" style={{background:bg}}>
        {!thumbErr && <img src={thumb} alt={video.title} className="w-full h-full object-cover" onError={()=>setThumbErr(true)}/>}
        <div className="absolute inset-0 flex items-center justify-center transition-colors"
          style={{background:'hsl(0 0% 0% / 0.25)'}}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'hsl(var(--bg))'}}>
            <Play size={16} fill="hsl(var(--primary))" style={{color:'hsl(var(--primary))',marginLeft:'2px'}}/>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-medium line-clamp-2 mb-2" style={{color:'hsl(var(--fg))'}}>{video.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{color:'hsl(var(--muted-fg))'}}>{video.category}</span>
          <span className="flex items-center gap-1 text-[10px]" style={{color:'hsl(var(--primary))'}}>
            <ExternalLink size={10}/> YouTube
          </span>
        </div>
      </div>
    </div>
  )
}
