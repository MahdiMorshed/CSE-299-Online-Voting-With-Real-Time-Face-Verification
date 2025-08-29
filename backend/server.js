const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const util = require('util');

const app = express();
app.use(express.json());
app.use(cors());

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Onlinevote'
});

database.connect((err) => {
  if (err) console.error('Database connection failed:', err);
  else console.log('Connected to the database');
});

const queryAsync = util.promisify(database.query).bind(database);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mahdimorshedasif02@gmail.com',
    pass: 'ugkryvfuwdpqtkfu',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection failed:', error);
  } else {
    console.log('SMTP server is ready to send messages');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register route
app.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, address, nid_number } = req.body;

    const nidResults = await queryAsync('SELECT * FROM nid WHERE nid_number = ? AND email = ?', [nid_number, email]);
    if (nidResults.length === 0) {
      return res.status(400).json({ error: 'Provided NID and Email do not match our records.' });
    }

    const dupResults = await queryAsync('SELECT * FROM Register WHERE email = ? OR nid_number = ?', [email, nid_number]);
    if (dupResults.length > 0) {
      if (dupResults.find(row => row.email === email)) {
        return res.status(409).json({ error: 'This email is already registered.' });
      }
      if (dupResults.find(row => row.nid_number === nid_number)) {
        return res.status(409).json({ error: 'This NID has already been used for registration.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await queryAsync(
      'INSERT INTO Register (full_name, email, password, address, nid_number) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, address, nid_number]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signin route
app.post('/signin', async (req, res) => {
  try {
    const { email, password, nid_number } = req.body;

    const results = await queryAsync('SELECT * FROM Register WHERE email = ? AND nid_number = ?', [email, nid_number]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or NID number' });
    }

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await queryAsync('INSERT INTO OTPs (email, otp, expiry_time) VALUES (?, ?, ?)', [email, otp, expiry]);

    await transporter.sendMail({
      from: 'mahdimorshedasif02@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp} (valid for 5 minutes)`,
    });

    res.status(200).json({ success: true, requiresOTP: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP route
app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const results = await queryAsync('SELECT * FROM OTPs WHERE email = ? ORDER BY id DESC LIMIT 1', [email]);
    if (results.length === 0) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }

    const savedOtp = results[0].otp;
    const expiryTime = new Date(results[0].expiry_time);
    const now = new Date();

    if (now > expiryTime) {
      return res.status(401).json({ error: 'OTP expired' });
    }

    if (otp !== savedOtp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    await queryAsync('DELETE FROM OTPs WHERE email = ?', [email]);

    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile route
app.get('/profile', async (req, res) => {
  try {
    const nid_number = req.query.nid_number;
    if (!nid_number) {
      return res.status(400).json({ error: 'nid_number query param is required' });
    }

    const result = await queryAsync('SELECT * FROM nid WHERE nid_number = ?', [nid_number]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply candidate route
app.post('/apply-candidate', async (req, res) => {
  try {
    const { nid_number, political_party, occupation, about, agenda } = req.body;

    if (!nid_number || !political_party || !occupation || !about || !agenda) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await queryAsync('SELECT * FROM candidate_primary WHERE nid_number = ?', [nid_number]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Candidate already applied" });
    }

    await queryAsync(
      `INSERT INTO candidate_primary (nid_number, political_party, occupation, about, agenda) VALUES (?, ?, ?, ?, ?)`,
      [nid_number, political_party, occupation, about, agenda]
    );

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error('Apply candidate error:', err);
    res.status(500).json({ message: "Database error" });
  }
});

// NID upload route
app.post('/nid', upload.single('photo'), async (req, res) => {
  try {
    const {
      nid_number, first_name, last_name, father_name, mother_name,
      date_of_birth, sex, blood_group, marital_status,
      phone_number, email, house, road, union_or_ward,
      upazila, district, division, post_code
    } = req.body;

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const existingEmail = await queryAsync('SELECT email FROM nid_final WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    await queryAsync(
      `INSERT INTO nid_final 
      (nid_number, first_name, last_name, father_name, mother_name, 
      date_of_birth, sex, blood_group, marital_status, phone_number, email, house, 
      road, union_or_ward, upazila, district, division, post_code, photo_path) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nid_number, first_name, last_name, father_name, mother_name,
        date_of_birth, sex, blood_group, marital_status, phone_number, email,
        house, road, union_or_ward, upazila, district, division, post_code, photoPath]
    );

    res.status(201).json({ message: 'NID info saved successfully' });
  } catch (err) {
    console.error('NID upload error:', err);
    res.status(500).json({ error: 'Database error on insert' });
  }
});

// Vote route
app.post('/vote', upload.single('webcamImage'), async (req, res) => {
  try {
    const { nid_number } = req.body;
    if (!nid_number || !req.file) {
      return res.status(400).json({ error: 'NID number and webcam image are required' });
    }

    const results = await queryAsync('SELECT photo_path FROM nid WHERE nid_number = ?', [nid_number]);
    if (results.length === 0) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'NID not found' });
    }

    const nidPhotoPath = path.join(__dirname, results[0].photo_path);
    if (!fs.existsSync(nidPhotoPath)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'Stored NID photo not found on server' });
    }

    const form = new FormData();
    form.append('image1', fs.createReadStream(nidPhotoPath));
    form.append('image2', fs.createReadStream(req.file.path));

    const flaskResponse = await axios.post('http://localhost:5001/verify', form, {
      headers: form.getHeaders(),
      timeout: 60000,
    });

    await fs.promises.unlink(req.file.path).catch(() => {});

    const { similarity, match, threshold } = flaskResponse.data;
    const confidence = (similarity * 100).toFixed(2) + '%';

    const DEBUG_LOG_DIR = path.join(__dirname, 'logs');
    if (!fs.existsSync(DEBUG_LOG_DIR)) fs.mkdirSync(DEBUG_LOG_DIR);

    const logLine = `${new Date().toISOString()} | NID: ${nid_number} | Similarity: ${similarity} | Match: ${match}\n`;
    fs.appendFileSync(path.join(DEBUG_LOG_DIR, 'vote_logs.txt'), logLine);

    res.status(200).json({ match, similarity, confidence, threshold });
  } catch (error) {
    console.error('Vote error:', error);
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Get candidates route

app.get('/candidate', (req, res) => {
  const sql = `
    SELECT 
      c.candidate_id,
      c.nid_number,
      n.first_name,
      n.last_name,
      n.father_name,
      n.mother_name,
      n.date_of_birth,
      n.sex,
      n.blood_group,
      n.marital_status,
      n.phone_number,
      n.email,
      n.house,
      n.road,
      n.union_or_ward,
      n.upazila,
      n.district,
      n.division,
      n.post_code,
      n.photo_path,
      c.political_party,
      c.occupation,
      c.about,
      c.agenda
    FROM candidate c
    JOIN nid n ON c.nid_number = n.nid_number
    ORDER BY c.candidate_id;
  `;

  database.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});





// Submit vote
app.post('/submitVote', (req, res) => {
  const { nid_number, candidateId } = req.body;

  if (!nid_number || !candidateId) {
    return res.status(400).json({ error: 'NID number and candidateId are required' });
  }

  database.query(
    'SELECT * FROM vote WHERE nid_number = ?',
    [nid_number],
    (err, results) => {
      if (err) {
        console.error('Database SELECT error:', err);
        return res.status(500).json({ error: 'Database error while checking votes' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User has already voted' });
      }

      database.query(
        'INSERT INTO vote (nid_number, candidate_id) VALUES (?, ?)',
        [nid_number, candidateId],
        (err2) => {
          if (err2) {
            console.error('Database INSERT error:', err2);
            return res.status(500).json({ error: 'Database error while submitting vote' });
          }

          res.json({ message: 'Vote submitted successfully' });
        }
      );
    }
  );
});



let adminOtpStore = {
  otp: null,
  expiry: null,
};

// Admin send OTP
app.post('/api/admin/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || email !== 'mahdimorshedasif01@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized admin email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    adminOtpStore = { otp, expiry };

    await transporter.sendMail({
      from: 'mahdimorshedasif02@gmail.com',
      to: email,
      subject: 'Admin OTP Verification',
      text: `Your OTP is: ${otp} (valid for 5 minutes)`,
    });

    res.json({ message: 'OTP sent to admin email' });
  } catch (err) {
    console.error('Admin OTP send error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Admin verify OTP
app.post('/api/admin/verify-otp', (req, res) => {
  try {
    const { otp } = req.body;

    if (!adminOtpStore.otp || !adminOtpStore.expiry) {
      return res.status(400).json({ success: false, message: 'No OTP requested' });
    }

    if (new Date() > adminOtpStore.expiry) {
      return res.status(401).json({ success: false, message: 'OTP expired' });
    }

    if (otp !== adminOtpStore.otp) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    adminOtpStore = { otp: null, expiry: null };

    res.json({ success: true, message: 'Admin verified successfully' });
  } catch (err) {
    console.error('Admin OTP verify error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin get NID requests
app.get('/api/admin/nid-requests', async (req, res) => {
  try {
    const results = await queryAsync('SELECT * FROM nid_final');
    res.json(results);
  } catch (err) {
    console.error('Admin NID requests error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin grant NID
app.post('/api/admin/grant-nid', async (req, res) => {
  try {
    const { nid_number } = req.body;
    if (!nid_number) {
      return res.status(400).json({ message: 'NID number is required' });
    }

    const rows = await queryAsync('SELECT * FROM nid_final WHERE nid_number = ?', [nid_number]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'NID not found' });
    }

    const nid = rows[0];
    await queryAsync(`
      INSERT INTO nid (
        nid_number, first_name, last_name, father_name, mother_name,
        date_of_birth, sex, blood_group, marital_status,
        phone_number, email, house, road, union_or_ward,
        upazila, district, division, post_code, photo_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nid.nid_number, nid.first_name, nid.last_name, nid.father_name, nid.mother_name,
        nid.date_of_birth, nid.sex, nid.blood_group, nid.marital_status,
        nid.phone_number, nid.email, nid.house, nid.road, nid.union_or_ward,
        nid.upazila, nid.district, nid.division, nid.post_code, nid.photo_path
      ]
    );

    await queryAsync('DELETE FROM nid_final WHERE nid_number = ?', [nid_number]);

    res.json({ message: 'NID granted successfully' });
  } catch (err) {
    console.error('Admin grant NID error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Admin get candidate requests
app.get('/api/admin/candidate-requests', async (req, res) => {
  try {
    const results = await queryAsync(`
      SELECT 
        cp.*, 
        CONCAT(n.first_name, ' ', n.last_name) AS name,
        n.email,
        CONCAT(
          n.house, ', ', n.road, ', ', n.union_or_ward, ', ', n.upazila, ', ', 
          n.district, ', ', n.division, ' - ', n.post_code
        ) AS address,
        n.photo_path AS photo
      FROM candidate_primary cp
      JOIN nid n ON cp.nid_number = n.nid_number
    `);

    res.json(results);
  } catch (err) {
    console.error('Admin candidate requests error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin grant candidate
app.post('/api/admin/grant-candidate', async (req, res) => {
  try {
    const { nid_number } = req.body;
    if (!nid_number) {
      return res.status(400).json({ message: 'NID number is required' });
    }

    const rows = await queryAsync('SELECT * FROM candidate_primary WHERE nid_number = ?', [nid_number]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Candidate application not found' });
    }

    const candidate = rows[0];
    await queryAsync(`
      INSERT INTO candidate (
        nid_number, political_party, occupation, about, agenda
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        candidate.nid_number,
        candidate.political_party,
        candidate.occupation,
        candidate.about,
        candidate.agenda,
      ]
    );

    await queryAsync('DELETE FROM candidate_primary WHERE nid_number = ?', [nid_number]);

    res.json({ message: 'Candidate granted successfully' });
  } catch (err) {
    console.error('Admin grant candidate error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});
