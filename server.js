// ใช้ Express + pg เพื่อสร้างเว็บหน้าแอด/แก้/ลบข้อมูลนักศึกษา พร้อม UI สวยงามและ sidebar รายชื่อ
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

// สร้างตาราง students ถ้ายังไม่มี
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

// API: คืนค่า JSON ของนักศึกษาทั้งหมด (สำหรับ sidebar หรือ AJAX refresh)
app.get('/api/students', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY student_id');
    res.json(rows);
  } catch (err) {
    console.error('/api/students error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'DB error' });
  }
});

// หน้าแรก: แสดงตารางนักศึกษา + ฟอร์มเพิ่ม และ sidebar ที่สามารถเลือกแก้/ลบ
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
    :root{--bg:#071024;--card:#071827;--muted:#9aa6b2;--accent:#5eead4;--danger:#ff6b6b}
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans Thai', sans-serif;background:linear-gradient(180deg,#031026 0%, #071024 100%);color:#e6eef6;padding:20px}
    .wrap{max-width:1100px;margin:0 auto;display:flex;gap:18px}
    .main{flex:1}
    .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03);padding:18px;border-radius:12px;box-shadow:0 8px 30px rgba(2,6,23,0.6)}
    h1{margin:0 0 8px;font-size:20px}
    p.lead{color:var(--muted);margin:0 0 12px}

    /* form */
    .form-row{display:flex;gap:8px;margin-top:12px}
    input[type=text]{flex:1;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit}
    button.btn{padding:10px 12px;border-radius:8px;border:0;background:var(--accent);color:#051018;font-weight:700;cursor:pointer}

    /* table */
    table{width:100%;border-collapse:collapse;margin-top:12px}
    thead th{color:var(--muted);font-size:13px;padding:10px;text-align:left}
    tbody td{padding:12px;border-top:1px solid rgba(255,255,255,0.03)}
    .row-actions button{margin-left:8px}

    /* sidebar */
    .sidebar{width:320px;flex-shrink:0}
    .sidebar .card{height:calc(100vh - 60px);overflow:auto;padding:12px}
    .list-item{display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:8px;margin-bottom:8px;background:rgba(255,255,255,0.01)}
    .list-item .meta{font-size:13px;color:var(--muted)}
    .icon-btn{background:transparent;border:0;color:var(--muted);cursor:pointer}
    .icon-btn:hover{color:var(--accent)}

    .edit-form{margin-top:12px;padding:10px;background:rgba(255,255,255,0.01);border-radius:8px}
    .muted{color:var(--muted);font-size:13px}
    .msg{margin:10px 0;padding:10px;border-radius:8px;background:rgba(94,234,212,0.06);color:var(--accent)}

    @media (max-width:900px){.wrap{flex-direction:column}.sidebar{width:100%;height:auto}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="main">
      <div class="card">
        <h1>ฐานข้อมูลงาน — นักศึกษา</h1>
        <p class="lead">ดู / เพิ่ม / แก้ไข / ลบ ข้อมูลนักศึกษาได้จากหน้านี้</p>
        ${msg ? `<div class="msg">${escapeHtml(msg)}</div>` : ''}

        <form id="addForm" action="/add" method="post" class="form-row" autocomplete="off">
          <input name="student_id" type="text" placeholder="รหัสนักศึกษา (เช่น 69319011766)" required>
          <input name="student_name" type="text" placeholder="ชื่อ-นามสกุล" required>
          <button class="btn" type="submit">เพิ่ม</button>
        </form>

        <table aria-label="students">
          <thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>จัดการ</th></tr></thead>
          <tbody id="tableBody">
`;

    for (const row of rows) {
      html += `<tr data-id="${escapeAttr(row.student_id)}"><td>${escapeHtml(row.student_id)}</td><td>${escapeHtml(row.student_name)}</td><td class="row-actions"><button class="btn" data-action="edit" data-id="${escapeAttr(row.student_id)}">แก้ไข</button><form style="display:inline" action="/delete" method="post" onsubmit="return confirm('ต้องการลบนักศึกษา ${escapeJs(row.student_name)} ใช่หรือไม่?');"><input type="hidden" name="student_id" value="${escapeAttr(row.student_id)}"><button class="btn" type="submit" style="background:#ff6b6b;color:#fff;margin-left:6px">ลบ</button></form></td></tr>`;
    }

    html += `</tbody></table>
      </div>
    </div>

    <aside class="sidebar">
      <div class="card">
        <h3>รายชื่อ (รวดเร็ว)</h3>
        <p class="muted">คลิกชื่อเพื่อแก้ไขทางด่วน หรือเลือกจากตาราง</p>
        <div id="listContainer">
`;
    for (const row of rows) {
      html += `<div class="list-item"><div><div><strong>${escapeHtml(row.student_name)}</strong></div><div class="meta">${escapeHtml(row.student_id)}</div></div><div><button class="icon-btn" data-action="pick" data-id="${escapeAttr(row.student_id)}" title="เลือก">✏️</button><button class="icon-btn" data-action="del" data-id="${escapeAttr(row.student_id)}" title="ลบ">🗑️</button></div></div>`;
    }

    html += `</div>

        <div class="edit-form" id="editFormArea">
          <h4>แก้ไขข้อมูล</h4>
          <form id="editForm">
            <input type="hidden" name="student_id" id="edit_student_id">
            <div style="margin-top:8px"><input id="edit_student_name" name="student_name" type="text" placeholder="ชื่อ-นามสกุล" style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit"></div>
            <div style="margin-top:10px;display:flex;gap:8px"><button type="submit" class="btn">บันทึก</button><button type="button" id="cancelEdit" class="btn" style="background:#888;color:#fff">ยกเลิก</button></div>
          </form>
        </div>

      </div>
    </aside>
  </div>

  <script>
    // ช่วย fetch รายชื่อนักศึกษาใหม่ (refresh sidebar & table)
    async function fetchStudents() {
      const res = await fetch('/api/students');
      if (!res.ok) return [];
      return await res.json();
    }

    // render helper: update DOM list & table
    function renderAll(students) {
      const list = document.getElementById('listContainer');
      list.innerHTML = '';
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';
      for (const s of students) {
        const li = document.createElement('div'); li.className = 'list-item';
        li.innerHTML = `<div><div><strong>${escapeHtml(s.student_name)}</strong></div><div class="meta">${escapeHtml(s.student_id)}</div></div><div><button class="icon-btn" data-action="pick" data-id="${escapeAttr(s.student_id)}">✏️</button><button class="icon-btn" data-action="del" data-id="${escapeAttr(s.student_id)}">🗑️</button></div>`;
        list.appendChild(li);

        const tr = document.createElement('tr'); tr.setAttribute('data-id', s.student_id);
        tr.innerHTML = `<td>${escapeHtml(s.student_id)}</td><td>${escapeHtml(s.student_name)}</td><td class="row-actions"><button class="btn" data-action="edit" data-id="${escapeAttr(s.student_id)}">แก้ไข</button><form style="display:inline" action="/delete" method="post" onsubmit="return confirm('ต้องการลบนักศึกษา ${escapeJs(s.student_name)} ใช่หรือไม่?');"><input type="hidden" name="student_id" value="${escapeAttr(s.student_id)}"><button class="btn" type="submit" style="background:#ff6b6b;color:#fff;margin-left:6px">ลบ</button></form></td>`;
        tbody.appendChild(tr);
      }
    }

    // HTML-escape (client side) - minimal
    function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    function escapeAttr(str){ return escapeHtml(str); }
    function escapeJs(str){ return String(str||'').replace(/'/g, "\\'"); }

    // เมื่อกดปุ่มแก้ไขจากตาราง หรือกดปุ่ม pick ใน sidebar
    function startEdit(student_id, student_name){
      document.getElementById('edit_student_id').value = student_id;
      document.getElementById('edit_student_name').value = student_name || '';
      document.getElementById('edit_student_name').focus();
    }

    // attach delegated events
    document.addEventListener('click', async (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.getAttribute('data-action');
      const id = el.getAttribute('data-id');
      if (action === 'pick' || action === 'edit') {
        // get student data
        const students = await fetchStudents();
        const s = students.find(x => x.student_id === id);
        if (s) startEdit(s.student_id, s.student_name);
      } else if (action === 'del') {
        if (!confirm('ต้องการลบนักศึกษารายนี้ใช่หรือไม่?')) return;
        // send delete via fetch (so page won't navigate)
        try {
          const res = await fetch('/delete', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ student_id: id }) });
          const text = await res.text();
          // reload data
          const students = await fetchStudents(); renderAll(students);
        } catch (err) { console.error(err); alert('ลบไม่สำเร็จ'); }
      }
    });

    // handle edit submit (AJAX)
    document.getElementById('editForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const id = document.getElementById('edit_student_id').value;
      const name = document.getElementById('edit_student_name').value.trim();
      if (!id || !name) { alert('กรอกข้อมูลให้ครบ'); return; }
      try {
        const res = await fetch('/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ student_id: id, student_name: name }) });
        const data = await res.json();
        if (data.ok) {
          const students = await fetchStudents(); renderAll(students);
          alert('บันทึกเรียบร้อย');
        } else {
          alert('บันทึกไม่สำเร็จ: ' + (data.error || ''));
        }
      } catch (err) { console.error(err); alert('บันทึกไม่สำเร็จ'); }
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
      document.getElementById('edit_student_id').value = '';
      document.getElementById('edit_student_name').value = '';
    });

    // initial render and periodic refresh
    (async () => {
      const students = await fetchStudents(); renderAll(students);
      // auto-refresh every 30s
      setInterval(async () => { const s = await fetchStudents(); renderAll(s); }, 30000);
    })();
  </script>
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
    const message = err && err.code === '23505' ? 'รหัสนักศึกษานี้มีอยู่แล้ว' : (err.message || String(err));
    res.redirect('/?msg=' + encodeURIComponent('เพิ่มไม่สำเร็จ: ' + message));
  }
});

// ลบนักศึกษา (รองรับทั้ง form POST แบบเดิมและ JSON ซึ่งใช้จาก sidebar JS)
app.post('/delete', async (req, res) => {
  const student_id = String((req.body && req.body.student_id) || '').trim();
  if (!student_id) return res.status(400).send('no id');

  try {
    await pool.query('DELETE FROM students WHERE student_id = $1', [student_id]);
    // หากเป็นเรียกแบบ JSON ให้ส่งสถานะกลับเป็น text/JSON
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.json({ ok: true });
    }
    res.redirect('/?msg=' + encodeURIComponent('ลบข้อมูลสำเร็จ'));
  } catch (err) {
    console.error('POST /delete error:', err && err.stack ? err.stack : err);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(500).json({ ok: false, error: String(err) });
    }
    res.redirect('/?msg=' + encodeURIComponent('ลบไม่สำเร็จ: ' + (err.message || String(err))));
  }
});

// อัพเดตข้อมูลนักศึกษา (แก้ชื่อ)
app.post('/update', async (req, res) => {
  const student_id = String((req.body && req.body.student_id) || '').trim();
  const student_name = String((req.body && req.body.student_name) || '').trim();
  if (!student_id || !student_name) return res.status(400).json({ ok: false, error: 'missing' });

  try {
    await pool.query('UPDATE students SET student_name = $1 WHERE student_id = $2', [student_name, student_id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /update error:', err && err.stack ? err.stack : err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
server.on('error', (err) => console.error('Server error:', err && err.stack ? err.stack : err));
