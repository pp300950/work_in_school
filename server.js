// ใช้ Express + pg เพื่อสร้างเว็บหน้าแอด/ลบข้อมูลนักศึกษา พร้อม UI สวยงามเล็กน้อย
const express = require('express');
const { Pool } = require('pg');

// ตั้งค่า pool โดยอ่าน DATABASE_URL จาก environment (Railway จะตั้งให้อัตโนมัติ)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// จับ error ที่ไม่ได้ถูกจัดการเพื่อให้เห็นใน logs
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
});

// สร้างตาราง students ถ้ายังไม่มี (จะช่วยให้ไม่ต้องสร้างมือลง DB ก่อน)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        student_id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL
      )
    `);
    console.log('Ensured students table exists');
  } catch (err) {
    console.error('Error ensuring students table:', err && err.stack ? err.stack : err);
  }
})();

// หน้าแรก: แสดงตารางนักศึกษา + ฟอร์มเพิ่ม และปุ่มลบแต่ละแถว
app.get('/', async (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  try {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY student_id');
    const msg = req.query.msg ? String(req.query.msg) : '';

    let html = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ฐานข้อมูลงาน — students</title>
  <style>
    :root{--bg:#0f1720;--card:#0b1220;--muted:#9aa6b2;--accent:#5eead4;--panel:#0d141a}
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans Thai', sans-serif;background:linear-gradient(180deg,#071024 0%, #0b1220 100%);color:#e6eef6;padding:28px;}
    .container{max-width:920px;margin:0 auto}
    .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03);padding:20px;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,0.6)}
    h1{margin:0 0 12px;font-size:22px}
    p.lead{color:var(--muted);margin:0 0 18px}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    table thead th{background:rgba(255,255,255,0.02);padding:10px;text-align:left;color:var(--muted);font-size:13px}
    table tbody td{padding:12px;border-top:1px solid rgba(255,255,255,0.03)}
    .form-row{display:flex;gap:8px;margin-top:12px}
    input[type=text]{flex:1;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit}
    button{padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:var(--accent);color:#051018;font-weight:600;cursor:pointer}
    .muted{color:var(--muted);font-size:13px}
    .msg{margin:10px 0;padding:10px;border-radius:8px;background:rgba(94,234,212,0.06);color:var(--accent)}
    .actions form{display:inline}
    .danger{background:#ff6b6b;color:#140606;border-color:transparent}
    @media (max-width:600px){.form-row{flex-direction:column}}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>ฐานข้อมูลงาน — นักศึกษา</h1>
      <p class="lead">ดู / เพิ่ม / ลบ ข้อมูลนักศึกษาได้จากหน้านี้</p>
      ${msg ? `<div class="msg">${escapeHtml(msg)}</div>` : ''}

      <form action="/add" method="post" class="form-row" autocomplete="off">
        <input name="student_id" type="text" placeholder="รหัสนักศึกษา (เช่น 69319011766)" required>
        <input name="student_name" type="text" placeholder="ชื่อ-นามสกุล" required>
        <button type="submit">เพิ่ม</button>
      </form>

      <table aria-label="students">
        <thead>
          <tr><th>รหัสนักศึกษา</th><th>ชื่อ-นามสกุล</th><th>จัดการ</th></tr>
        </thead>
        <tbody>
`;

    for (const row of rows) {
      html += `<tr><td>${escapeHtml(row.student_id)}</td><td>${escapeHtml(row.student_name)}</td><td class="actions">
        <form action="/delete" method="post" onsubmit="return confirm('ต้องการลบนักศึกษา ${escapeJs(row.student_name)} ใช่หรือไม่?');">
          <input type="hidden" name="student_id" value="${escapeAttr(row.student_id)}">
          <button type="submit" class="danger">ลบ</button>
        </form>
      </td></tr>`;
    }

    html += `</tbody></table>
    </div>
  </div>
</body>
</html>`;

    res.send(html);
  } catch (err) {
    console.error('GET / error:', err && err.stack ? err.stack : err);
    res.status(500).send(`<h1>เกิดข้อผิดพลาด</h1><pre>${escapeHtml(err.message || String(err))}</pre>`);
  }
});

// เพิ่มนักศึกษา (POST)
app.post('/add', async (req, res) => {
  const student_id = String(req.body.student_id || '').trim();
  const student_name = String(req.body.student_name || '').trim();
  if (!student_id || !student_name) return res.redirect('/?msg=' + encodeURIComponent('กรอกข้อมูลไม่ครบ'));

  try {
    await pool.query('INSERT INTO students(student_id, student_name) VALUES($1, $2)', [student_id, student_name]);
    res.redirect('/?msg=' + encodeURIComponent('เพิ่มข้อมูลสำเร็จ'));
  } catch (err) {
    console.error('POST /add error:', err && err.stack ? err.stack : err);
    // ถ้า primary key ซ้ำ ให้แจ้งผู้ใช้
    const message = err && err.code === '23505' ? 'รหัสนักศึกษานี้มีอยู่แล้ว' : (err.message || String(err));
    res.redirect('/?msg=' + encodeURIComponent('เพิ่มไม่สำเร็จ: ' + message));
  }
});

// ลบนักศึกษา (POST)
app.post('/delete', async (req, res) => {
  const student_id = String(req.body.student_id || '').trim();
  if (!student_id) return res.redirect('/?msg=' + encodeURIComponent('ไม่พบรหัสนักศึกษา'));

  try {
    await pool.query('DELETE FROM students WHERE student_id = $1', [student_id]);
    res.redirect('/?msg=' + encodeURIComponent('ลบข้อมูลสำเร็จ'));
  } catch (err) {
    console.error('POST /delete error:', err && err.stack ? err.stack : err);
    res.redirect('/?msg=' + encodeURIComponent('ลบไม่สำเร็จ: ' + (err.message || String(err))));
  }
});

// ฟังก์ชันช่วยหลีกเลี่ยง XSS ตอนแทรกค่าใน HTML
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(str) { return escapeHtml(str); }
function escapeJs(str) { return String(str || '').replace(/'/g, "\\'"); }

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
server.on('error', (err) => console.error('Server error:', err && err.stack ? err.stack : err));
