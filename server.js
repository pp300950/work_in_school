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

// API: คืนค่า JSON ของนักศึกษาทั้งหมด (ใช้เป็นแหล่งข้อมูลเดียวสำหรับหน้าเว็บทั้งหมด)
app.get('/api/students', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY student_id');
    res.json(rows);
  } catch (err) {
    console.error('/api/students error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'DB error' });
  }
});

// หน้าแรก: โครงหน้าเปล่า ๆ — ตารางและ sidebar ทั้งหมด render ด้วย JS ฝั่ง client
// (แก้บั๊กเดิม: เดิม server render ข้อมูลมาชุดหนึ่ง แล้ว JS มา render ทับอีกชุดตอนโหลดหน้า
//  ทำให้เกิด race condition — ถ้า fetch พลาด/ช้า ปุ่มที่เห็นจะหลุดจาก state จริง และปุ่มแก้ไขค้าง)
app.get('/', async (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  const msg = req.query.msg ? String(req.query.msg) : '';

  const html = `<!doctype html>
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
    button.btn:disabled{opacity:0.5;cursor:not-allowed}

    /* table */
    table{width:100%;border-collapse:collapse;margin-top:12px}
    thead th{color:var(--muted);font-size:13px;padding:10px;text-align:left}
    tbody td{padding:12px;border-top:1px solid rgba(255,255,255,0.03)}
    .row-actions{display:flex;gap:6px;align-items:center}
    .row-actions button.danger{background:#ff6b6b;color:#fff}
    tr.editing{background:rgba(94,234,212,0.06)}

    /* sidebar */
    .sidebar{width:320px;flex-shrink:0}
    .sidebar .card{max-height:calc(100vh - 60px);overflow:auto;padding:12px;position:sticky;top:20px}
    .list-item{display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:8px;margin-bottom:8px;background:rgba(255,255,255,0.01)}
    .list-item.editing{outline:1px solid var(--accent)}
    .list-item .meta{font-size:13px;color:var(--muted)}
    .icon-btn{background:transparent;border:0;color:var(--muted);cursor:pointer;font-size:15px;padding:4px 6px;border-radius:6px}
    .icon-btn:hover{color:var(--accent);background:rgba(255,255,255,0.04)}

    .edit-form{margin-top:12px;padding:10px;background:rgba(255,255,255,0.01);border-radius:8px}
    .edit-form.hidden{display:none}
    .muted{color:var(--muted);font-size:13px}
    .msg{margin:10px 0;padding:10px;border-radius:8px;background:rgba(94,234,212,0.06);color:var(--accent)}
    .err{margin:10px 0;padding:10px;border-radius:8px;background:rgba(255,107,107,0.08);color:var(--danger)}
    .empty{color:var(--muted);padding:16px 4px}

    @media (max-width:900px){.wrap{flex-direction:column}.sidebar{width:100%;height:auto}.sidebar .card{position:static;max-height:none}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="main">
      <div class="card">
        <h1>ฐานข้อมูลงาน — นักศึกษา</h1>
        <p class="lead">ดู / เพิ่ม / แก้ไข / ลบ ข้อมูลนักศึกษาได้จากหน้านี้</p>
        ${msg ? `<div class="msg">${escapeHtml(msg)}</div>` : ''}
        <div id="loadError"></div>

        <form id="addForm" class="form-row" autocomplete="off">
          <input id="add_student_id" name="student_id" type="text" placeholder="รหัสนักศึกษา (เช่น 69319011766)" required>
          <input id="add_student_name" name="student_name" type="text" placeholder="ชื่อ-นามสกุล" required>
          <button class="btn" type="submit">เพิ่ม</button>
        </form>

        <table aria-label="students">
          <thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>จัดการ</th></tr></thead>
          <tbody id="tableBody">
            <tr><td colspan="3" class="empty">กำลังโหลดข้อมูล...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <aside class="sidebar">
      <div class="card">
        <h3>รายชื่อ (รวดเร็ว)</h3>
        <p class="muted">คลิก ✏️ เพื่อแก้ไขทางด่วน</p>
        <div id="listContainer">
          <div class="empty">กำลังโหลดข้อมูล...</div>
        </div>

        <div class="edit-form hidden" id="editFormArea">
          <h4>แก้ไขข้อมูล: <span id="editingLabel"></span></h4>
          <form id="editForm">
            <input type="hidden" name="original_student_id" id="edit_original_student_id">
            <div>
              <label class="muted" for="edit_student_id">รหัสนักศึกษา</label>
              <input id="edit_student_id" name="student_id" type="text" placeholder="รหัสนักศึกษา" required
                style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit;margin-top:4px">
            </div>
            <div style="margin-top:8px">
              <label class="muted" for="edit_student_name">ชื่อ-นามสกุล</label>
              <input id="edit_student_name" name="student_name" type="text" placeholder="ชื่อ-นามสกุล" required
                style="width:100%;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit;margin-top:4px">
            </div>
            <div style="margin-top:10px;display:flex;gap:8px">
              <button type="submit" class="btn" id="saveEditBtn">บันทึก</button>
              <button type="button" id="cancelEdit" class="btn" style="background:#888;color:#fff">ยกเลิก</button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  </div>

  <script>
    // ---------- state ----------
    let students = [];       // แหล่งข้อมูลเดียวที่ใช้ render ทั้งตารางและ sidebar
    let editingId = null;    // id ที่กำลังแก้ไขอยู่ (ถ้ามี)

    // ---------- helpers ----------
    function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    function escapeAttr(str){ return escapeHtml(str); }

    async function fetchStudents() {
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ (' + res.status + ')');
      return await res.json();
    }

    async function refresh() {
      try {
        students = await fetchStudents();
        document.getElementById('loadError').innerHTML = '';
        renderAll();
      } catch (err) {
        console.error(err);
        document.getElementById('loadError').innerHTML = '<div class="err">โหลดข้อมูลไม่สำเร็จ: ' + escapeHtml(err.message) + ' — <button class="btn" onclick="refresh()">ลองใหม่</button></div>';
      }
    }

    // ---------- render ----------
    function renderAll() {
      renderTable();
      renderSidebar();
      renderEditForm();
    }

    function renderTable() {
      const tbody = document.getElementById('tableBody');
      if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty">ยังไม่มีข้อมูลนักศึกษา</td></tr>';
        return;
      }
      tbody.innerHTML = students.map(function (s) {
        const isEditing = s.student_id === editingId;
        return '<tr data-id="' + escapeAttr(s.student_id) + '"' + (isEditing ? ' class="editing"' : '') + '>' +
          '<td>' + escapeHtml(s.student_id) + '</td>' +
          '<td>' + escapeHtml(s.student_name) + '</td>' +
          '<td class="row-actions">' +
            '<button type="button" class="btn" data-action="edit" data-id="' + escapeAttr(s.student_id) + '">แก้ไข</button>' +
            '<button type="button" class="btn danger" data-action="del" data-id="' + escapeAttr(s.student_id) + '">ลบ</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function renderSidebar() {
      const list = document.getElementById('listContainer');
      if (!students.length) {
        list.innerHTML = '<div class="empty">ยังไม่มีข้อมูลนักศึกษา</div>';
        return;
      }
      list.innerHTML = students.map(function (s) {
        const isEditing = s.student_id === editingId;
        return '<div class="list-item' + (isEditing ? ' editing' : '') + '" data-id="' + escapeAttr(s.student_id) + '">' +
          '<div><div><strong>' + escapeHtml(s.student_name) + '</strong></div><div class="meta">' + escapeHtml(s.student_id) + '</div></div>' +
          '<div>' +
            '<button type="button" class="icon-btn" data-action="edit" data-id="' + escapeAttr(s.student_id) + '" title="แก้ไข">✏️</button>' +
            '<button type="button" class="icon-btn" data-action="del" data-id="' + escapeAttr(s.student_id) + '" title="ลบ">🗑️</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderEditForm() {
      const area = document.getElementById('editFormArea');
      if (!editingId) {
        area.classList.add('hidden');
        return;
      }
      const s = students.find(function (x) { return x.student_id === editingId; });
      if (!s) { editingId = null; area.classList.add('hidden'); return; }
      area.classList.remove('hidden');
      document.getElementById('editingLabel').textContent = s.student_id;
      document.getElementById('edit_original_student_id').value = s.student_id;
      document.getElementById('edit_student_id').value = s.student_id;
      document.getElementById('edit_student_name').value = s.student_name;
    }

    function startEdit(id) {
      editingId = id;
      renderAll();
      document.getElementById('edit_student_name').focus();
      document.getElementById('editFormArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function stopEdit() {
      editingId = null;
      renderAll();
    }

    // ---------- actions ----------
    async function addStudent(student_id, student_name) {
      const res = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student_id, student_name: student_name })
      });
      const data = await res.json().catch(function () { return { ok: false, error: 'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง' }; });
      if (!data.ok) throw new Error(data.error || 'เพิ่มไม่สำเร็จ');
    }

    async function updateStudent(original_student_id, student_id, student_name) {
      const res = await fetch('/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_student_id: original_student_id, student_id: student_id, student_name: student_name })
      });
      const data = await res.json().catch(function () { return { ok: false, error: 'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง' }; });
      if (!data.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
    }

    async function deleteStudent(student_id) {
      const res = await fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student_id })
      });
      const data = await res.json().catch(function () { return { ok: false, error: 'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง' }; });
      if (!data.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');
    }

    // ---------- events ----------
    // ใช้ event delegation ผูกกับ document ครั้งเดียว ปุ่มที่ render ใหม่กี่ครั้งก็ยังทำงาน
    // (บั๊กเดิม: การผสม server-render ครั้งแรก + client re-render ทำให้บางปุ่มไม่ได้อยู่ใต้ listener ที่ถูกต้อง)
    document.addEventListener('click', async function (e) {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.getAttribute('data-action');
      const id = el.getAttribute('data-id');

      if (action === 'edit') {
        startEdit(id);
        return;
      }

      if (action === 'del') {
        const s = students.find(function (x) { return x.student_id === id; });
        const name = s ? s.student_name : id;
        if (!confirm('ต้องการลบนักศึกษา ' + name + ' ใช่หรือไม่?')) return;
        el.disabled = true;
        try {
          await deleteStudent(id);
          if (editingId === id) editingId = null;
          await refresh();
        } catch (err) {
          console.error(err);
          alert('ลบไม่สำเร็จ: ' + err.message);
          el.disabled = false;
        }
      }
    });

    document.getElementById('addForm').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const idInput = document.getElementById('add_student_id');
      const nameInput = document.getElementById('add_student_name');
      const id = idInput.value.trim();
      const name = nameInput.value.trim();
      if (!id || !name) { alert('กรอกข้อมูลให้ครบ'); return; }
      const btn = ev.target.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        await addStudent(id, name);
        idInput.value = '';
        nameInput.value = '';
        await refresh();
      } catch (err) {
        console.error(err);
        alert('เพิ่มไม่สำเร็จ: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById('editForm').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const originalId = document.getElementById('edit_original_student_id').value;
      const newId = document.getElementById('edit_student_id').value.trim();
      const name = document.getElementById('edit_student_name').value.trim();
      if (!newId || !name) { alert('กรอกข้อมูลให้ครบ'); return; }
      const btn = document.getElementById('saveEditBtn');
      btn.disabled = true;
      try {
        await updateStudent(originalId, newId, name);
        editingId = null;
        await refresh();
      } catch (err) {
        console.error(err);
        alert('บันทึกไม่สำเร็จ: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById('cancelEdit').addEventListener('click', stopEdit);

    // ---------- init ----------
    refresh();
    setInterval(function () {
      // อย่า refresh ทับตอนกำลังพิมพ์แก้ไขอยู่ ไม่งั้นฟอร์มจะโดนรีเซ็ตกลางคัน
      if (!editingId) refresh();
    }, 30000);
  </script>
</body>
</html>`;

  res.send(html);
});

// เพิ่มนักศึกษา (รับได้ทั้ง form POST เดิม และ JSON จาก fetch)
app.post('/add', async (req, res) => {
  const student_id = String((req.body && req.body.student_id) || '').trim();
  const student_name = String((req.body && req.body.student_name) || '').trim();
  const wantsJson = req.headers['content-type'] && req.headers['content-type'].includes('application/json');

  if (!student_id || !student_name) {
    if (wantsJson) return res.status(400).json({ ok: false, error: 'กรอกข้อมูลไม่ครบ' });
    return res.redirect('/?msg=' + encodeURIComponent('กรอกข้อมูลไม่ครบ'));
  }

  try {
    await pool.query('INSERT INTO students(student_id, student_name) VALUES($1, $2)', [student_id, student_name]);
    if (wantsJson) return res.json({ ok: true });
    res.redirect('/?msg=' + encodeURIComponent('เพิ่มข้อมูลสำเร็จ'));
  } catch (err) {
    console.error('POST /add error:', err && err.stack ? err.stack : err);
    const message = err && err.code === '23505' ? 'รหัสนักศึกษานี้มีอยู่แล้ว' : (err.message || String(err));
    if (wantsJson) return res.status(500).json({ ok: false, error: message });
    res.redirect('/?msg=' + encodeURIComponent('เพิ่มไม่สำเร็จ: ' + message));
  }
});

// ลบนักศึกษา (รองรับทั้ง form POST แบบเดิมและ JSON ซึ่งใช้จาก sidebar/table JS)
app.post('/delete', async (req, res) => {
  const student_id = String((req.body && req.body.student_id) || '').trim();
  const wantsJson = req.headers['content-type'] && req.headers['content-type'].includes('application/json');

  if (!student_id) {
    if (wantsJson) return res.status(400).json({ ok: false, error: 'no id' });
    return res.status(400).send('no id');
  }

  try {
    await pool.query('DELETE FROM students WHERE student_id = $1', [student_id]);
    if (wantsJson) return res.json({ ok: true });
    res.redirect('/?msg=' + encodeURIComponent('ลบข้อมูลสำเร็จ'));
  } catch (err) {
    console.error('POST /delete error:', err && err.stack ? err.stack : err);
    if (wantsJson) return res.status(500).json({ ok: false, error: String(err) });
    res.redirect('/?msg=' + encodeURIComponent('ลบไม่สำเร็จ: ' + (err.message || String(err))));
  }
});

// อัพเดตข้อมูลนักศึกษา (แก้ชื่อ และ/หรือ แก้รหัสนักศึกษา)
app.post('/update', async (req, res) => {
  const original_student_id = String((req.body && req.body.original_student_id) || '').trim();
  const student_id = String((req.body && req.body.student_id) || '').trim();
  const student_name = String((req.body && req.body.student_name) || '').trim();

  if (!original_student_id || !student_id || !student_name) {
    return res.status(400).json({ ok: false, error: 'กรอกข้อมูลไม่ครบ' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ถ้าเปลี่ยนรหัสเป็นรหัสใหม่ ให้เช็คว่ารหัสใหม่ไม่ชนกับของคนอื่นก่อน
    if (student_id !== original_student_id) {
      const { rows: existing } = await client.query(
        'SELECT 1 FROM students WHERE student_id = $1',
        [student_id]
      );
      if (existing.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ ok: false, error: 'รหัสนักศึกษานี้มีอยู่แล้ว' });
      }
    }

    const result = await client.query(
      'UPDATE students SET student_id = $1, student_name = $2 WHERE student_id = $3',
      [student_id, student_name, original_student_id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'ไม่พบรหัสนักศึกษานี้' });
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /update error:', err && err.stack ? err.stack : err);
    const message = err && err.code === '23505' ? 'รหัสนักศึกษานี้มีอยู่แล้ว' : String(err);
    res.status(500).json({ ok: false, error: message });
  } finally {
    client.release();
  }
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
server.on('error', (err) => console.error('Server error:', err && err.stack ? err.stack : err));
