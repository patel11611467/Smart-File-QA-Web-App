require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { OpenAI } = require('openai');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const Together = require('together-ai');
const textract = require('textract');


const app = express();
const upload = multer({ dest: 'uploads/' });
const db = new sqlite3.Database('data.db');
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY
});

function extractText(path, mimeType) {
console.log("mimeType",path);
  return new Promise((res, rej) =>
    textract.fromFileWithMime(mimeType, path, (e, txt) =>
      e ? rej(e) : res(txt || '[No text]')
    )
  );
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize tables
db.run(`CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY, path TEXT, type TEXT, created_at TEXT
)`);
db.run(`CREATE TABLE IF NOT EXISTS qa (
  id INTEGER PRIMARY KEY,
  file_id INTEGER,
  prompt TEXT,
  answer TEXT,
  created_at TEXT,
  email_id TEXT
)`);

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const { path, mimetype } = req.file;
  db.run(
    `INSERT INTO files(path, type, created_at) VALUES (?, ?, datetime('now'))`,
    [path, mimetype],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ fileId: this.lastID });
      //console.log("fileId",fileId);
    }
  );
});

// Ask endpoint
// After switching to require at the top:


app.post('/ask', (req, res) => {
  const { fileId, prompt } = req.body;

  db.get(`SELECT path, type FROM files WHERE id = ?`, [fileId], async (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'File not found' });
    let content = '';
    try {
      // content = fs.readFileSync(row.path, 'utf-8');
      content = fs.readFileSync(row.path, 'utf-8');
      console.log("content",content);
    } catch {
      content = '[Non-text file or reading failed]';
    }
    // Use Together API here
    let answer;
    try {
      const response = await together.chat.completions.create({
        model: 'meta-llama/Llama-Vision-Free',
        messages: [
          { role: 'system', content: "Answer using only the uploaded file's content." },
          { role: 'user', content: `Content:\n${content}\n\nQ: ${prompt}` }
        ]
      });
      answer = response.choices[0].message.content;
    } catch (err2) {
      console.error('TogetherAPI error:', err2);
      return res.status(500).json({ error: err2.message });
    }

    db.run(
      `INSERT INTO qa (file_id, prompt, answer, created_at, email_id) VALUES (?, ?, ?, datetime('now'), ?)`,
      [fileId, prompt, answer, req.body.email],
      function (dbErr) {
        if (dbErr) {
          console.error('DB error:', dbErr);
          return res.status(500).json({ error: dbErr.message });
        }
        res.json({ answer });
      }
    );
  });
});


// Export & Email endpoint
app.post('/export', (req, res) => {
  const { fileId, email } = req.body;
  console.log("abc:", fileId, "email", email);

  db.all(`SELECT prompt, answer FROM qa WHERE file_id = ?`, [fileId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const doc = new PDFDocument();
    const outPath = `report-${fileId}.pdf`;
    const writeStream = fs.createWriteStream(outPath);

    doc.pipe(writeStream);
    doc.fontSize(16).text('Q&A Report', { align: 'center' }).moveDown();
    rows.forEach((r, i) => {
      doc.fontSize(12).text(`Q${i+1}: ${r.prompt}`);
      doc.text(`A: ${r.answer}`).moveDown();
    });
    doc.end();

    console.log("----2-----------------------");

    writeStream.on('finish', () => {
      console.log("---------3------------------");
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log("---------4------------------");

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Q&A Report',
        text: 'Here is your report.',
        attachments: [{ filename: outPath, path: outPath }]
      }, (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ status: 'sent' });
      });
    });

    writeStream.on('error', (e) => {
      console.error("Write stream error:", e);
      res.status(500).json({ error: e.message });
    });
  });
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
