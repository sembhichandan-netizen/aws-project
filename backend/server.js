// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5001;

// require('./db/database');

// app.use(cors({ origin: ['http://localhost:5173','https://av-aimmigration-frontend.vercel.app'], credentials: true }));
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/auth',            require('./routes/auth'));
// app.use('/api/visa-programs',   require('./routes/visa'));
// app.use('/api/eligibility',     require('./routes/eligibility'));
// app.use('/api/documents',       require('./routes/documents'));
// app.use('/api/learning',        require('./routes/learning'));
// app.use('/api/applications',    require('./routes/applications'));
// app.use('/api/admin',           require('./routes/admin'));
// app.use('/api/resources',       require('./routes/resources'));
// app.use('/api/messages',        require('./routes/messages'));
// app.use('/api/activity',        require('./routes/activity'));
// app.use('/api/services',        require('./routes/services'));
// app.use('/api/b2b',             require('./routes/b2b'));

// app.listen(PORT, () => {
//   console.log(`\n🚀 AVA Immigration Solutions`);
//   console.log(`   Server: http://localhost:${PORT}\n`);
//   console.log(`   Admin:      admin@ava.com       / admin123`);
//   console.log(`   Consultant: consultant@ava.com        / consultant123\n`);
// });


const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

require('./db/database');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://aws-project-sepia.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/visa-programs', require('./routes/visa'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/services', require('./routes/services'));
app.use('/api/b2b', require('./routes/b2b'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AVA Immigration Backend is Live 🚀'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AVA Immigration Solutions`);
  console.log(`Server: http://localhost:${PORT}`);
});