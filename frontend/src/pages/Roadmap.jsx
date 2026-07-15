import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { ArrowLeft, Map, CheckCircle, Clock, FileText, Globe, GraduationCap, Stethoscope, Plane, Home, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

const PROGRAMS = ['Canada Express Entry', 'UK Skilled Worker', 'Australia Skilled 189', 'Germany Job Seeker']

const ROADMAPS = {
  'Canada Express Entry': [
    { step:1, title:'Language Test (IELTS/CELPIP)', icon:GraduationCap, time:'4-6 weeks', status:'start',
      color:'bg-[hsl(var(--primary))]', desc:'Take IELTS Academic or CELPIP. Need minimum CLB 7 per skill for FSW. Higher = more CRS points. Results valid 2 years.',
      tasks:['Book IELTS at least 4-6 weeks ahead','Prepare with our IELTS Prep Hub','Aim for minimum 7.0 overall (higher = more points)','Receive results in 13 days (paper-based)','CLB 9 = 136 pts, CLB 10 = 148 pts per language']},
    { step:2, title:'Educational Credential Assessment (ECA)', icon:FileText, time:'7-20 days', status:'start',
      color:'bg-[hsl(var(--primary))]', desc:'Get your foreign degree evaluated by a designated organization (WES is most popular). Required before creating EE profile.',
      tasks:['Apply to WES (World Education Services) online','Submit original transcripts + degree directly from university','Pay approx. CAD $239 + courier fees','WES sends report directly to IRCC','Process takes 7-10 days (fast-track) or 20 days (standard)']},
    { step:3, title:'Calculate CRS Score & Create EE Profile', icon:Globe, time:'1-2 days', status:'start',
      color:'bg-blue-500', desc:'Use the official IRCC CRS calculator. If score is competitive (typically 480-530+), create your Express Entry profile.',
      tasks:['Use IRCC CRS tool to calculate your score','Create profile on IRCC account online','Enter education, language, work experience exactly','Profile is valid for 12 months (can update)','PNP nomination adds 600 points instantly']},
    { step:4, title:'Receive Invitation to Apply (ITA)', icon:Map, time:'Varies (weeks-months)', status:'wait',
      color:'bg-sky-500', desc:'IRCC runs draws periodically. Candidates above the cutoff score receive an ITA. Score cutoffs change each draw.',
      tasks:['Monitor IRCC draw results regularly','Cutoff scores typically 470-530+ (check latest)','Provincial draws happen more frequently','Consider Provincial Nominee Program (PNP) for +600 pts','ITA gives you 60 days to submit complete application']},
    { step:5, title:'Gather & Submit Documents', icon:FileText, time:'30-60 days', status:'active',
      color:'bg-amber-500', desc:'After receiving ITA, you have 60 days to gather all documents and submit your complete PR application. DO NOT miss this deadline.',
      tasks:['Valid passport (all pages)','IELTS score report','WES evaluation report','Reference letters (10+ pages, on letterhead)','Bank statements showing CAD $13,757+ (1 person)','Police clearance certificates from all countries lived in','Birth certificate (attested)','Marriage certificate (if applicable)']},
    { step:6, title:'Medical Examination', icon:Stethoscope, time:'1-2 weeks', status:'active',
      color:'bg-rose-500', desc:'Book with an IRCC-designated panel physician BEFORE submitting your application. Results go directly to IRCC.',
      tasks:['Find designated physician at IRCC website','Book appointment in advance (2-4 week wait in some cities)','Bring: passport, glasses (if worn), vaccination records','Complete blood test, X-ray, physical exam','Results electronically sent to IRCC (valid 12 months)','Estimated cost: ₹8,000-15,000 per person']},
    { step:7, title:'Biometrics', icon:FileText, time:'1 day appointment', status:'active',
      color:'bg-teal-500', desc:'Provide biometrics (fingerprints + photo) at a designated Application Support Centre (ASC) or VAC.',
      tasks:['Receive biometrics request from IRCC','Book appointment at nearest VAC/ASC','Bring passport and reference number','Biometrics fee: CAD $85 per person','Valid for 10 years','Book well in advance — wait times can be 4-8 weeks']},
    { step:8, title:'COPR & Landing in Canada', icon:Plane, time:'Final step!', status:'final',
      color:'bg-[hsl(142_70%_42%)]', desc:'Receive your Confirmation of Permanent Residence (COPR). Land in Canada before the expiry date. Welcome home!',
      tasks:['Receive COPR document via email/mail','Note the validity date — land BEFORE expiry','Book one-way ticket to Canada 🍁','At port of entry: present passport + COPR + all documents','Complete landing process with CBSA officer','Apply for SIN (Social Insurance Number) immediately','Apply for provincial health card','Open Canadian bank account']},
  ],
  'UK Skilled Worker': [
    { step:1, title:'Get a Job Offer from Approved Employer', icon:Globe, time:'Varies', status:'start', color:'bg-[hsl(var(--primary))]',
      desc:'You need a confirmed job offer from a UK employer with a valid Sponsor Licence. The job must be on the eligible occupations list.',
      tasks:['Search jobs on LinkedIn, Indeed, Reed.co.uk','Confirm employer has Sponsor Licence (UKVI register)','Ensure salary meets threshold (GBP £26,200+ or going rate)','Receive a Certificate of Sponsorship (CoS) reference number','CoS must be issued within 3 months of application']},
    { step:2, title:'English Language Requirement', icon:GraduationCap, time:'4-6 weeks', status:'start', color:'bg-[hsl(var(--primary))]',
      desc:'Prove English at B1 level or above. IELTS UKVI (Secure English Language Test) is the standard route.',
      tasks:['Take IELTS for UKVI (Academic or General)','Need minimum B1 (CEFR) = IELTS 4.0+ per skill','Degree-level qualification taught in English also qualifies','Nationals of English-speaking countries exempt','Valid for 2 years']},
    { step:3, title:'Apply Online (UK Visas & Immigration)', icon:FileText, time:'1-3 days', status:'active', color:'bg-blue-500',
      desc:'Submit application online through the official UKVI portal. Pay fees and immigration health surcharge upfront.',
      tasks:['Create UKVI account and complete online application','Pay visa fee: GBP £719 (up to 3 years)','Pay IHS (Immigration Health Surcharge): GBP £1,035/year','Upload all documents digitally','Complete declaration honestly']},
    { step:4, title:'Biometrics & Document Check', icon:FileText, time:'1 day', status:'active', color:'bg-amber-500',
      desc:'Attend appointment at a Visa Application Centre (VAC) for biometrics and document verification.',
      tasks:['Book earliest VAC appointment in your city','Bring: passport, CoS number, all required documents','Provide fingerprints and photograph','Documents reviewed — ensure all are certified copies','Decision typically within 3-8 weeks after biometrics']},
    { step:5, title:'Receive BRP & Travel to UK', icon:Plane, time:'Final step!', status:'final', color:'bg-[hsl(142_70%_42%)]',
      desc:'If approved, you\'ll receive a vignette sticker in your passport. Travel to UK and collect your Biometric Residence Permit (BRP).',
      tasks:['Receive approval — vignette sticker in passport','Must travel to UK within 30 days of vignette issue','Collect BRP within 10 days of arrival at specified post office','Begin working for your sponsor employer','Register with NHS if required by your local surgery']},
  ],
  'Australia Skilled 189': [
    { step:1, title:'Skills Assessment', icon:GraduationCap, time:'8-16 weeks', status:'start', color:'bg-[hsl(var(--primary))]',
      desc:'Get your skills assessed by the relevant assessing authority for your occupation. This must be done before submitting EOI.',
      tasks:['Identify your occupation on the MLTSSL list','Find your assessing authority (Engineers Australia, AITSL, ACS, etc.)','Submit educational qualifications + employment evidence','Assessment takes 8-16 weeks depending on authority','Positive assessment valid for 3 years']},
    { step:2, title:'English Test (IELTS/PTE/TOEFL)', icon:FileText, time:'4-6 weeks', status:'start', color:'bg-[hsl(var(--primary))]',
      desc:'Achieve minimum "Competent English" — IELTS 6.0 in all bands. Higher scores earn more points.',
      tasks:['IELTS 6.0 all bands = Competent English (0 bonus points)','IELTS 7.0 all bands = Proficient English (+10 points)','IELTS 8.0 all bands = Superior English (+20 points)','PTE and TOEFL also accepted','Score valid for 3 years']},
    { step:3, title:'Calculate Points & Lodge EOI in SkillSelect', icon:Globe, time:'1-2 days', status:'active', color:'bg-blue-500',
      desc:'Submit Expression of Interest (EOI) in the SkillSelect system. You need minimum 65 points. Higher points = more invitations.',
      tasks:['Use DIBP points calculator','Minimum 65 points required to submit EOI','190 points common for invitations (varies by occupation)','Submit EOI with accurate information','EOI valid for 24 months (can update anytime)']},
    { step:4, title:'Receive Invitation to Apply', icon:Map, time:'Varies', status:'wait', color:'bg-sky-500',
      desc:'Department of Home Affairs issues invitations in rounds. Popular occupations get invitations in weeks; others can wait months.',
      tasks:['Monitor occupation-specific invite scores','Invitation rounds happen every 2-8 weeks','Critical skills (healthcare, IT, engineering) invited frequently','Apply for state nomination (Subclass 190) for +5 points','Once invited, 60 days to submit PR application']},
    { step:5, title:'Health Checks & Police Clearance', icon:Stethoscope, time:'2-4 weeks', status:'active', color:'bg-rose-500',
      desc:'Complete required health examinations through a panel physician and obtain police clearances from all countries lived in.',
      tasks:['Book DIBP-approved panel physician','Complete medical: blood tests, chest X-ray, physical','Health results submitted electronically to DIBP','Police clearance from India (Passport Seva Portal)','Police clearance from every country lived in for 12+ months']},
    { step:6, title:'Submit Application & Receive VISA Grant', icon:Plane, time:'8-12 months', status:'final', color:'bg-[hsl(142_70%_42%)]',
      desc:'Lodge your formal Subclass 189 application online. Processing typically takes 8-12 months. Grant is permanent on landing.',
      tasks:['Submit application online through ImmiAccount','Pay AUD $4,240 application fee (per applicant)','Include all requested documents','Respond promptly to any DIBP requests','Receive visa grant via email','Visa valid 5 years — must make first entry within this period']},
  ],
  'Germany Job Seeker': [
    { step:1, title:'Qualification Recognition', icon:GraduationCap, time:'4-12 weeks', status:'start', color:'bg-[hsl(var(--primary))]',
      desc:'Get your foreign qualifications recognized in Germany through anabin database or formal recognition procedure.',
      tasks:['Check anabin.kmk.org if your degree is recognized','If not listed: apply for formal recognition','Contact relevant authority (e.g., Chamber of Commerce for trades)','Recognition may be full, partial, or with conditions','Anabin H+ = direct recognition, H- = requires procedure']},
    { step:2, title:'Language Proficiency', icon:FileText, time:'6-12 months study', status:'start', color:'bg-[hsl(var(--primary))]',
      desc:'German B1 is minimum for most Job Seeker visas. English B2+ accepted for some sectors (tech, academia). Start learning now!',
      tasks:['Enroll in Goethe-Institut German course','A1-A2 (basic) → B1 (intermediate) → B2 (upper-intermediate)','Take Goethe-Zertifikat exam (widely accepted)','English-speaking sectors (IT, research) may accept English C1','Practice with Duolingo, Babbel, Goethe Online courses']},
    { step:3, title:'Apply at German Embassy', icon:Globe, time:'4-6 weeks processing', status:'active', color:'bg-blue-500',
      desc:'Apply for Job Seeker Visa at the German Embassy/Consulate in your country. Valid for 6 months to search for work.',
      tasks:['Book appointment at German Embassy/Consulate','Prepare documents: degree, recognition, language cert, CV, finances','Show proof of finances: EUR €947/month (blocked account)','Pay visa fee: EUR €75','Processing: 4-6 weeks','Valid for 6 months once issued']},
    { step:4, title:'Travel to Germany & Job Search', icon:Plane, time:'Up to 6 months', status:'active', color:'bg-amber-500',
      desc:'Arrive in Germany and actively search for work. Register at local Bürgeramt. Use employment services and networking.',
      tasks:['Register at Bürgeramt within 14 days of arrival (required by law)','Open German bank account','Use Make it in Germany portal for job search','Register with Bundesagentur für Arbeit (employment agency)','Network at industry events, job fairs','Apply to tech startups, engineering firms, healthcare companies']},
    { step:5, title:'Convert to Work Permit & Settle', icon:Home, time:'Final step!', status:'final', color:'bg-[hsl(142_70%_42%)]',
      desc:'Once you receive a job offer, your employer applies for your work permit/residence permit. After 5 years → permanent residence.',
      tasks:['Secure job contract from German employer','Apply for Aufenthaltserlaubnis (residence permit)','Employer files necessary paperwork','After 2 years: EU Blue Card possible (for qualified professionals)','After 4-5 years: Permanent Residence (Niederlassungserlaubnis)','After 8 years: German Citizenship possible']},
  ],
}

const statusIcon = { start:'🟢', wait:'🟡', active:'🔵', final:'⭐' }

export default function Roadmap() {
  const [program, setProgram] = useState('Canada Express Entry')
  const [openStep, setOpenStep] = useState(0)
  const steps = ROADMAPS[program] || []

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[hsl(var(--primary))] mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Learning Hub
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Map size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Immigration Roadmap</h1>
            <p className="text-gray-500 text-sm">Step-by-step guide from start to landing in your dream country.</p>
          </div>
        </div>
      </div>

      {/* Program Selector */}
      <div className="card p-4 mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Select Your Immigration Pathway</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PROGRAMS.map(p => (
            <button key={p} onClick={() => { setProgram(p); setOpenStep(0) }}
              className={`p-3 rounded-xl text-xs font-semibold text-center transition-all border ${
                program === p ? 'bg-[hsl(var(--primary))] text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[hsl(var(--border))] hover:text-[hsl(var(--primary))]'
              }`}>{p}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pb-1">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center flex-shrink-0">
              <button onClick={() => setOpenStep(i)}
                className={`flex flex-col items-center gap-1 px-2 transition-all group ${openStep === i ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}>
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="text-white text-sm font-black">{s.step}</span>
                </div>
                <p className="text-[9px] font-semibold text-gray-600 text-center leading-tight max-w-[60px]">
                  {s.title.split(' ').slice(0,2).join(' ')}
                </p>
              </button>
              {i < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 flex-shrink-0 mx-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps Detail */}
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.step} className={`card overflow-hidden transition-all duration-300 ${openStep === i ? 'shadow-md border-[hsl(var(--border))]' : ''}`}>
            <button onClick={() => setOpenStep(openStep === i ? -1 : i)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-400">Step {s.step}</span>
                  <span className="text-[10px]">{statusIcon[s.status]}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {s.time}
                </p>
              </div>
              {openStep === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
            </button>

            {openStep === i && (
              <div className="px-5 pb-5 border-t border-gray-50 animate-slide-up">
                <p className="text-sm text-gray-600 leading-relaxed my-3">{s.desc}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Action Checklist</p>
                <div className="space-y-1.5">
                  {s.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700 leading-relaxed">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-5 card p-4 bg-amber-50 border-amber-100 flex gap-3">
        <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">Important Note</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Immigration rules change frequently. Always verify current requirements on official government websites. Processing times and fees mentioned are approximate (2024-25). Consult a regulated immigration consultant for personal advice.
          </p>
        </div>
      </div>
    </Layout>
  )
}
