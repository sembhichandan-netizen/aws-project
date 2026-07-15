const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'ava.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    role TEXT DEFAULT 'user', phone TEXT, nationality TEXT,
    last_seen DATETIME, current_page TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS visa_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, country TEXT NOT NULL, type TEXT NOT NULL,
    description TEXT, requirements TEXT, processing_time TEXT, fee TEXT,
    success_rate INTEGER DEFAULT 80, active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS eligibility_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL, field_name TEXT NOT NULL, type TEXT NOT NULL,
    options TEXT, order_num INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, program_id INTEGER,
    score INTEGER DEFAULT 0, result TEXT, answers TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS learning_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, category TEXT NOT NULL,
    description TEXT, content TEXT,
    duration_minutes INTEGER DEFAULT 30, level TEXT DEFAULT 'Beginner',
    active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS learning_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, module_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0, progress_percent INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (module_id) REFERENCES learning_modules(id),
    UNIQUE(user_id, module_id)
  );
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, type TEXT NOT NULL,
    filename TEXT NOT NULL, original_name TEXT,
    status TEXT DEFAULT 'pending', notes TEXT,
    verified_by INTEGER, uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME, FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, program_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', notes TEXT, admin_notes TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (program_id) REFERENCES visa_programs(id)
  );
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER, category TEXT NOT NULL, type TEXT NOT NULL,
    title TEXT NOT NULL, description TEXT, video_id TEXT, content TEXT,
    order_num INTEGER DEFAULT 0, active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES learning_modules(id)
  );
  CREATE TABLE IF NOT EXISTS user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, module_id INTEGER,
    title TEXT NOT NULL, content TEXT,
    color TEXT DEFAULT 'yellow', pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL, to_user_id INTEGER,
    thread_id TEXT NOT NULL, content TEXT NOT NULL,
    read_by_recipient INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, action TEXT NOT NULL, detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    title TEXT NOT NULL, category TEXT NOT NULL,
    description TEXT, price TEXT, currency TEXT DEFAULT 'INR',
    duration TEXT, countries TEXT, tags TEXT,
    active INTEGER DEFAULT 1, featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultant_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS service_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL, student_id INTEGER NOT NULL,
    message TEXT, status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS b2b_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL, to_user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    UNIQUE(from_user_id, to_user_id)
  );
  CREATE TABLE IF NOT EXISTS b2b_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL, to_user_id INTEGER NOT NULL,
    content TEXT NOT NULL, read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
  );
`);

const uc = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (uc.c === 0) {
  db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)').run('Administrator','admin@ava.com',bcrypt.hashSync('admin123',10),'admin');
  db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)').run('AVA Consultant','consultant@ava.com',bcrypt.hashSync('consultant123',10),'consultant');
}

const pc = db.prepare('SELECT COUNT(*) as c FROM visa_programs').get();
if (pc.c === 0) {
  const ip = db.prepare('INSERT INTO visa_programs(name,country,type,description,requirements,processing_time,fee,success_rate) VALUES(?,?,?,?,?,?,?,?)');
  [
    ['Canada Express Entry','Canada','Skilled Worker','Points-based permanent residency managed through the federal pool.','IELTS CLB 7+ | 1 year skilled work experience | ECA for foreign degrees | Police clearance | Medical exam','6-12 months','CAD $1,525',88],
    ['UK Skilled Worker Visa','United Kingdom','Work Visa','Work in the UK with a confirmed job offer from a licensed sponsor.','Job offer from licensed sponsor | English B1 | Salary GBP 26,200+','3-8 weeks','GBP £719',82],
    ['Australia Skilled 189','Australia','Skilled Migration','Points-tested permanent visa. No job offer required.','Skills assessment | IELTS 6.0+ | 65+ points | Under 45','8-12 months','AUD $4,640',79],
    ['Germany Job Seeker Visa','Germany','Job Seeker','Six-month visa to search for employment in Germany.','Recognised degree | German B1 or English C1 | EUR 947/month proof','4-6 weeks','EUR €75',71],
    ['New Zealand Skilled Migrant','New Zealand','Skilled Resident','Points-based residence for skilled migrants.','160+ EOI points | English | Health and character | Under 56','12-18 months','NZD $3,310',76],
    ['USA EB-3 Visa','United States','Employment Based','Employer-sponsored immigrant visa for skilled workers.','US employer sponsorship | PERM | Job offer | Bachelor degree','12-36 months','USD $700',68],
    ['Canada Provincial Nominee','Canada','Provincial Nominee','Province nominates candidates. Adds 600 CRS points.','Province-specific requirements | Job offer | Language proficiency','8-16 months','CAD $1,365',84],
    ['Australia TSS 482','Australia','Temp Skill Shortage','Employer-sponsored temporary work visa.','Approved sponsor | Shortage list | Skills assessment | IELTS 5.0+','1-3 months','AUD $3,115',87],
  ].forEach(r => ip.run(...r));
}

const eqc = db.prepare('SELECT COUNT(*) as c FROM eligibility_questions').get();
if (eqc.c === 0) {
  const iq = db.prepare('INSERT INTO eligibility_questions(question,field_name,type,options,order_num) VALUES(?,?,?,?,?)');
  [
    ['What is your current age?','age','number',null,1],
    ['What is your highest level of education?','education','select','["High School","Diploma","Bachelor\'s Degree","Master\'s Degree","PhD"]',2],
    ['How many years of skilled work experience do you have?','experience','number',null,3],
    ['What is your IELTS overall band score?','language_score','number',null,4],
    ['Which country are you most interested in?','destination','select','["Canada","Australia","United Kingdom","Germany","New Zealand","United States"]',5],
    ['What are your approximate liquid savings (USD)?','financial','select','["Under $5,000","$5,000 - $20,000","$20,000 - $50,000","Above $50,000"]',6],
    ['Have you previously applied for immigration?','previous_application','select','["No, first time","Yes - Approved","Yes - Rejected","Yes - Pending"]',7],
    ['Do you have relatives abroad (citizen or PR)?','relatives','select','["No","Yes - Citizen","Yes - Permanent Resident","Yes - Work Visa"]',8],
  ].forEach(q => iq.run(...q));
}

const mc = db.prepare('SELECT COUNT(*) as c FROM learning_modules').get();
if (mc.c === 0) {
  const im = db.prepare('INSERT INTO learning_modules(title,category,description,content,duration_minutes,level) VALUES(?,?,?,?,?,?)');
  [
    ['IELTS Complete Preparation','IELTS','Master all 4 IELTS sections with proven strategies.','**LISTENING** — 4 sections, 40 questions, heard once. Read questions before audio. Answers in order.\n\n**READING** — 60 min, 40 questions. TFNG: False=contradicts, Not Given=absent. Skim then scan.\n\n**WRITING** — Task 1: 150+ words describe data. Task 2: 250+ word essay. Never use contractions.\n\n**SPEAKING** — Part 1: 2-3 sentence answers. Part 2: 2-min long turn. Part 3: abstract discussion.',120,'Beginner'],
    ['Canada Immigration Procedure','Country Guide','Complete step-by-step guide from IELTS to landing in Canada.','1. Take IELTS — aim CLB 9 (IELTS 7.0) for maximum CRS points.\n2. ECA through WES — CAD $239, 7-20 business days.\n3. Calculate CRS Score — use IRCC tool.\n4. Create Express Entry Profile — valid 12 months.\n5. Receive ITA — 60 days to submit complete application.\n6. Gather Documents — passport, IELTS, WES, reference letters, bank statements (CAD $13,757+), police clearance, medicals.\n7. Medical Exam — IRCC-approved panel physician.\n8. Biometrics — CAD $85, book early.\n9. COPR and Landing — land before expiry date.',90,'Beginner'],
    ['IELTS Speaking Strategies','IELTS','Score Band 7+ in IELTS Speaking.','Part 1: Give 2-3 sentence answers with reason + example.\n\nPart 2: Use 1 min prep. Structure: scene → describe → feelings → significance.\n\nPart 3: Show critical thinking. Use: "From my perspective..." / "It could be argued..."\n\nCriteria: Fluency, Vocabulary, Grammar Range, Pronunciation.\n\nNEVER memorise scripts — examiners detect and penalise it.',75,'Intermediate'],
    ['IELTS Writing Templates','IELTS','Band 7+ templates for both Task 1 and Task 2.','TASK 1 Structure: Introduction (paraphrase) → Overview (2 main trends) → Body 1 → Body 2.\nKey verbs: rose/fell/remained stable/peaked at/bottomed out.\n\nTASK 2 Opinion Essay: Intro (thesis) → Body 1 (reason + example) → Body 2 (reason + example) → Conclusion.\nRules: no contractions, no informal language, plan before writing, minimum 250 words.',90,'Intermediate'],
    ['IELTS Listening Strategies','IELTS','Score 35+/40 with proven techniques.','Read ALL questions before audio starts — most important strategy.\nAnswers come in ORDER — never look back.\nWatch for DISTRACTORS — speaker may correct themselves; last answer is correct.\nSpelling counts — every misspelling = wrong.\nWord limit: "NO MORE THAN TWO WORDS" means exactly that.',60,'Beginner'],
    ['IELTS Reading All Types','IELTS','Master every IELTS Reading question type.','Time: 17/20/23 min per passage. Never exceed budget.\nTFNG: True=agrees | False=contradicts | Not Given=not mentioned.\nMatching Headings: read all headings first, match main idea not details.\nSentence Completion: exact words from passage, respect word limit.\nSynonyms: questions always paraphrase the passage.',60,'Intermediate'],
    ['Visa Interview Preparation','Interview','Complete guide for immigration and embassy interviews.','BEFORE: Know your application, dress formally, arrive 30 min early.\n\nKEY QUESTIONS:\n1. Tell me about yourself.\n2. Why do you want to immigrate?\n3. How will you support yourself?\n4. Have you ever been refused a visa? (always be honest)\n5. What are your long-term plans?\n\nBODY LANGUAGE: Eye contact, upright posture, measured pace. Never lie.',75,'Intermediate'],
    ['Document Preparation Guide','Documentation','Complete checklist with attestation process.','UNIVERSAL: Passport, Birth certificate, Police clearance (all countries), Medical exam, Photos.\nEDUCATION: Degree certificates, transcripts, WES/ECA report.\nEMPLOYMENT: Experience letters (letterhead), pay slips (6 months), ITR (2-3 years).\nFINANCIAL: Bank statements (6 months), FD certificates.\n\nATTESTATION (India): Notary → State HRD/GAD → MEA → Embassy. Allow 3-4 weeks.',60,'Beginner'],
    ['Financial Planning','Finance','Budget your complete immigration journey.','FEES: Canada PR: CAD $1,925 total | Australia 189: AUD $4,640 | UK SW: GBP £719 | Germany: EUR €75.\n\nSETTLEMENT FUNDS: Canada: CAD $13,757 (1 person) | Germany: EUR €11,208 blocked account.\n\nINDIA TO CANADA ESTIMATE:\nIELTS: ₹17K/attempt | WES: ₹15K | Attestation: ₹30K | Medical: ₹12K | PR fee: ₹1.2L | Ticket: ₹80K\nTotal: approx ₹3.5-4.5 Lakhs (excluding settlement funds)',50,'Intermediate'],
  ].forEach(m => im.run(...m));
}

const rc = db.prepare('SELECT COUNT(*) as c FROM resources').get();
if (rc.c === 0) {
  const ir = db.prepare('INSERT INTO resources(module_id,category,type,title,description,video_id,content,order_num) VALUES(?,?,?,?,?,?,?,?)');
  [
    [1,'IELTS','video','IELTS Full Preparation — All 4 Skills','Complete IELTS overview for all 4 sections.','HDhlXPBXwFA','',1],
    [1,'IELTS','video','IELTS Speaking Actual Test 2024','Real test with full sample answers.','rn9_WlLpI6k','',2],
    [1,'IELTS','video','IELTS Speaking Topics 2024','Latest questions with model answers.','PTkE0Hycv6M','',3],
    [3,'IELTS','video','IELTS Speaking Mock Test — Band 8','Full mock test with commentary.','ZDv9njERj0s','',1],
    [3,'IELTS','video','IELTS Speaking Part 2 Mastery','Long turn structure and delivery.','5cPersJXICE','',2],
    [4,'IELTS','video','IELTS Writing — Band 7+ Guide','Full guide for both tasks.','ZNjVQDF3qTE','',1],
    [5,'IELTS','video','The ONLY IELTS Listening Course','Comprehensive listening strategies.','q7xCHfDRdug','',1],
    [5,'IELTS','video','Get Band 9 IELTS Listening Tips','Proven tips from a Band 9 scorer.','lpF5_EZIKVE','',2],
    [6,'IELTS','video','IELTS Reading TFNG — IELTS Liz','Essential strategy from top IELTS channel.','WYl9PX7Ua_Q','',1],
    [6,'IELTS','video','IELTS Reading TFNG — E2 IELTS','Worked through step by step.','hoOVjmKf_xw','',2],
    [2,'Country Guide','video','Canada Express Entry 2024 Guide','Full Express Entry guide with latest draws.','AaujXQUzE4o','',1],
    [2,'Country Guide','video','Create Express Entry Profile 2024','Step-by-step EE profile walkthrough.','tYmim-D1PPI','',2],
    [2,'Country Guide','video','Canada Express Entry 2025 Update','Updated 2025 guide.','2uk5DrnsrKM','',3],
    [7,'Interview','video','Visa Interview — Former Visa Officer','Real questions from former officer.','mdK0HktXVYg','',1],
    [7,'Interview','video','How to Answer Visa Questions','Strategy for confident answers.','6-QKxM1vPxI','',2],
    [7,'Interview','video','Correct Answers — Ex Consular Officer','Former Consular Officer advice.','3Rw9Pzkelf0','',3],
    [8,'Documentation','video','WES ECA for Canada — 2025 Guide','Step-by-step WES application.','KkELasOUAFY','',1],
    [8,'Documentation','video','WES Evaluation — Full Guide','End-to-end WES process.','Fj9fKYkIlbM','',2],
    [9,'Finance','video','Canada Immigration Cost Breakdown','Every fee explained clearly.','gLTL4TmxJYU','',1],
    [null,'Country Guide','video','UK Skilled Worker Visa 2024','Complete UK visa guide.','PdM4gNIGKo4','',1],
    [null,'Country Guide','video','Australia Skilled Visa 189','Subclass 189 full guide.','C8E4bqRmKBs','',2],
  ].forEach(r => ir.run(...r));
}

console.log('✅ Database initialized');
module.exports = db;
