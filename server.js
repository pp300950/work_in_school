// รวม 2 โปรเจกต์: หน้า terminal/intro (ซ้าย) + ระบบ CRUD ฐานข้อมูลนักศึกษาด้วย Express + pg (ขวา)
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

// หน้าแรก: ฝั่งซ้าย = terminal/intro (เดิม), ฝั่งขวา = กล่อง CRUD ฐานข้อมูลนักศึกษา
// ตารางและ sidebar ฝั่งขวา render ด้วย JS ฝั่ง client ทั้งหมด (ไม่ผสม server-render ซ้ำ กัน race condition)
app.get('/', async (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  const msg = req.query.msg ? String(req.query.msg) : '';

  res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>server.js — รหัสนักศึกษา 69319011766</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0e14;
    --bg-grid: #0f141c;
    --panel: #10161f;
    --panel-border: #1e2733;
    --teal: #5eead4;
    --amber: #f5a962;
    --text: #e8ecef;
    --muted: #7c8798;
    --red: #ff6b6b;
    --yellow: #f5c964;
    --green: #5eead4;
    --danger: #ff6b6b;
  }

  * { box-sizing: border-box; }

  html {
    background: var(--bg);
  }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    color: var(--text);
    font-family: 'Noto Sans Thai', 'JetBrains Mono', monospace;
  }

  body {
    position: relative;
    background: var(--bg);
    background-image:
      radial-gradient(circle at 1px 1px, rgba(94, 234, 212, 0.07) 1px, transparent 0);
    background-size: 28px 28px;
    background-attachment: fixed;
    padding: 40px 20px;
    overflow-x: hidden;
  }

  .glow {
    position: fixed;
    top: -10%;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(94, 234, 212, 0.10) 0%, transparent 65%);
    pointer-events: none;
    z-index: -1;
  }

  /* ----- layout: ซ้าย terminal / ขวา CRUD ----- */
  .page-wrap {
    position: relative;
    z-index: 1;
    max-width: 1560px;
    margin: 0 auto;
    display: flex;
    gap: 28px;
    align-items: flex-start;
    flex-wrap: wrap;
    width: 100%;
  }

  .col-left {
    flex: 1 1 520px;
    min-width: 320px;
    max-width: 640px;
  }

  .col-right {
    flex: 1.3 1 560px;
    min-width: 340px;
    max-width: 100%;
  }

  /* ----- terminal (ฝั่งซ้าย, ของเดิม) ----- */
  .terminal {
    width: 100%;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    box-shadow:
      0 0 0 1px rgba(94, 234, 212, 0.04),
      0 30px 60px -20px rgba(0, 0, 0, 0.6),
      0 0 80px -30px rgba(94, 234, 212, 0.15);
    overflow: hidden;
    opacity: 0;
    animation: rise 0.6s ease-out forwards;
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .titlebar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: #0d131b;
    border-bottom: 1px solid var(--panel-border);
  }

  .dots { display: flex; gap: 8px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #febc2e; }
  .dot.g { background: #28c840; }

  .titlebar-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  .term-body {
    padding: 28px 28px 32px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 1.75;
  }

  .line { display: flex; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
  .prompt { color: var(--teal); user-select: none; flex-shrink: 0; }
  .cmd { color: var(--text); }
  .out-muted { color: var(--muted); }
  .out-ok { color: var(--green); }

  .divider {
    border: none;
    border-top: 1px dashed var(--panel-border);
    margin: 18px 0;
  }

  .hero {
    font-family: 'Noto Sans Thai', sans-serif;
    margin: 22px 0 6px;
  }

  .hero h1 {
    margin: 0 0 8px;
    font-size: clamp(20px, 4vw, 28px);
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .hero h1 .cursor-blink {
    display: inline-block;
    width: 3px;
    height: 1em;
    background: var(--teal);
    margin-left: 6px;
    vertical-align: -0.15em;
    animation: blink 1s steps(1) infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .hero p {
    margin: 0;
    color: var(--muted);
    font-size: 14.5px;
  }

  .card {
    margin-top: 22px;
    background: #0d131b;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 18px 20px;
    font-family: 'Noto Sans Thai', sans-serif;
  }

  .card-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--amber);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-eyebrow::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 8px var(--amber);
  }

  .field {
    display: grid;
    grid-template-columns: 128px 1fr;
    gap: 4px 12px;
    padding: 7px 0;
    font-size: 14.5px;
  }

  .field + .field {
    border-top: 1px solid rgba(255,255,255,0.04);
  }

  .field .k {
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    padding-top: 2px;
  }

  .field .v {
    color: var(--text);
    font-weight: 500;
  }

  .badges {
    margin-top: 20px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid var(--panel-border);
    color: var(--muted);
    background: rgba(255,255,255,0.02);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .badge .pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .actions {
    margin-top: 24px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  button.btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 16px;
    border-radius: 7px;
    border: 1px solid var(--panel-border);
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  button.btn:hover {
    border-color: var(--teal);
    color: var(--teal);
    background: rgba(94, 234, 212, 0.06);
    transform: translateY(-1px);
  }

  button.btn:active { transform: translateY(0); }
  button.btn:disabled { opacity: 0.5; cursor: not-allowed; }

  button.btn.primary {
    background: var(--teal);
    color: #0a0e14;
    border-color: var(--teal);
    font-weight: 700;
  }

  button.btn.primary:hover {
    background: #7ff3dc;
    color: #0a0e14;
    box-shadow: 0 0 20px rgba(94, 234, 212, 0.35);
  }

  button.btn.danger {
    background: var(--red);
    color: #fff;
    border-color: var(--red);
  }

  button:focus-visible {
    outline: 2px solid var(--teal);
    outline-offset: 2px;
  }

  #clockOut {
    color: var(--teal);
    font-weight: 600;
  }

  .video-card { margin-top: 18px; }

  .video-frame {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    border-radius: 6px;
    overflow: hidden;
    background: #000;
    border: 1px solid var(--panel-border);
  }

  .video-frame iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .video-card .actions { margin-top: 14px; }

  .footer-line {
    margin-top: 26px;
    padding-top: 16px;
    border-top: 1px solid var(--panel-border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--muted);
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* ----- CRUD box (ฝั่งขวา) ----- */
  .crud-card {
    position: relative;
    z-index: 1;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    padding: 18px 20px;
    border-radius: 10px;
    box-shadow:
      0 0 0 1px rgba(94, 234, 212, 0.04),
      0 30px 60px -20px rgba(0, 0, 0, 0.6);
    font-family: 'Noto Sans Thai', sans-serif;
    opacity: 0;
    animation: rise 0.6s ease-out 0.1s forwards;
  }

  .crud-card h2 {
    margin: 0 0 6px;
    font-size: 19px;
    color: var(--text);
  }

  .crud-card p.lead {
    color: var(--muted);
    margin: 0 0 12px;
    font-size: 13.5px;
  }

  .form-row { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

  input[type=text] {
    flex: 1;
    min-width: 140px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--panel-border);
    background: rgba(255,255,255,0.02);
    color: inherit;
    font-family: 'Noto Sans Thai', sans-serif;
  }
  input[type=text]:focus {
    outline: none;
    border-color: var(--teal);
  }

  table { width: 100%; border-collapse: collapse; margin-top: 14px; }
  thead th {
    color: var(--muted);
    font-size: 12.5px;
    padding: 10px;
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  tbody td { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
  .row-actions { display: flex; gap: 6px; align-items: center; }
  tr.editing { background: rgba(94, 234, 212, 0.06); }

  .sub-card {
    margin-top: 20px;
    background: #0d131b;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 14px 16px;
  }
  .sub-card h3 { margin: 0 0 4px; font-size: 15px; }
  .sub-card .muted { color: var(--muted); font-size: 12.5px; margin: 0 0 10px; }

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: rgba(255,255,255,0.02);
  }
  .list-item.editing { outline: 1px solid var(--teal); }
  .list-item .meta { font-size: 12.5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
  .icon-btn {
    background: transparent;
    border: 0;
    color: var(--muted);
    cursor: pointer;
    font-size: 15px;
    padding: 4px 6px;
    border-radius: 6px;
  }
  .icon-btn:hover { color: var(--teal); background: rgba(255,255,255,0.04); }

  .edit-form { margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; }
  .edit-form.hidden { display: none; }
  .edit-form label.muted { color: var(--muted); font-size: 12.5px; }
  .edit-form input[type=text] { width: 100%; margin-top: 4px; }

  .msg {
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    background: rgba(94, 234, 212, 0.08);
    color: var(--teal);
    font-size: 13.5px;
  }
  .err {
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    background: rgba(255, 107, 107, 0.1);
    color: var(--danger);
    font-size: 13.5px;
  }
  .empty { color: var(--muted); padding: 16px 4px; font-size: 13.5px; }

  @media (max-width: 480px) {
    .field { grid-template-columns: 1fr; }
    .term-body { padding: 20px 18px 24px; }
  }

  @media (max-width: 1000px) {
    .page-wrap { flex-direction: column; }
    .col-left, .col-right { max-width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .terminal, .cursor-blink, .pulse { animation: none !important; }
    .terminal { opacity: 1; transform: none; }
  }
</style>
</head>
<body>
  <div class="glow"></div>

  <div class="page-wrap">

    <!-- ===== ฝั่งซ้าย: terminal/intro เดิม ===== -->
    <div class="col-left">
      <main class="terminal">
        <div class="titlebar">
          <div class="dots">
            <span class="dot r"></span>
            <span class="dot y"></span>
            <span class="dot g"></span>
          </div>
          <span class="titlebar-label">bash — node server.js</span>
        </div>

        <div class="term-body">
          <div class="line"><span class="prompt">$</span><span class="cmd">node server.js</span></div>
          <div class="line out-muted">&gt; กำลังเริ่มต้น Express server...</div>
          <div class="line out-ok">✓ เชื่อมต่อสำเร็จ — พร้อมรับ request แล้ว</div>

          <hr class="divider">

          <div class="hero">
            <h1>ยินดีต้อนรับสู่ Server ของผมครับ<span class="cursor-blink" aria-hidden="true"></span></h1>
            <p>นี่คือ Web Server เครื่องแรกที่สร้างขึ้นเองด้วย Node.js และ Express</p>
          </div>

          <div class="card">
            <div class="card-eyebrow">ข้อมูลนักศึกษา</div>
            <div class="field">
              <span class="k">รหัสนักศึกษา</span>
              <span class="v">69319011766</span>
            </div>
            <div class="field">
              <span class="k">ชื่อ-นามสกุล</span>
              <span class="v">นายพงศกร ผาบจันทร์สิงห์</span>
            </div>
          </div>

          <div class="badges">
            <span class="badge"><span class="pulse"></span>server: online</span>
            <span class="badge">runtime: node.js</span>
            <span class="badge">framework: express</span>
            <span class="badge">เวลาปัจจุบัน: <span id="clockOut">--:--:--</span></span>
          </div>

          <div class="card video-card">
            <div class="card-eyebrow">คลิปปั่นๆ ประจำวัน</div>
            <div class="video-frame">
              <iframe
                id="vibeVideo"
                src=""
                title="คลิปปั่นๆ"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy">
              </iframe>
            </div>
            <div class="actions">
              <button class="btn primary" id="reshuffleBtn" type="button">สุ่มคลิปใหม่</button>
            </div>
          </div>

          <div class="footer-line">
            <span>ส่งงาน CS Web Programming</span>
          </div>
        </div>
      </main>
    </div>

    <!-- ===== ฝั่งขวา: กล่อง CRUD ฐานข้อมูลนักศึกษา ===== -->
    <div class="col-right">
      <div class="crud-card">
        <h2>ฐานข้อมูลงาน — นักศึกษา</h2>
        <p class="lead">ดู / เพิ่ม / แก้ไข / ลบ ข้อมูลนักศึกษาได้จากกล่องนี้</p>
        ${msg ? `<div class="msg">${escapeHtml(msg)}</div>` : ''}
        <div id="loadError"></div>

        <form id="addForm" class="form-row" autocomplete="off">
          <input id="add_student_id" name="student_id" type="text" placeholder="รหัสนักศึกษา (เช่น 69319011766)" required>
          <input id="add_student_name" name="student_name" type="text" placeholder="ชื่อ-นามสกุล" required>
          <button class="btn primary" type="submit">เพิ่ม</button>
        </form>

        <table aria-label="students">
          <thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>จัดการ</th></tr></thead>
          <tbody id="tableBody">
            <tr><td colspan="3" class="empty">กำลังโหลดข้อมูล...</td></tr>
          </tbody>
        </table>

        <div class="sub-card">
          <h3>รายชื่อ (รวดเร็ว)</h3>
          <p class="muted">คลิก ✏️ เพื่อแก้ไขทางด่วน</p>
          <div id="listContainer">
            <div class="empty">กำลังโหลดข้อมูล...</div>
          </div>

          <div class="edit-form hidden" id="editFormArea">
            <h4 style="margin:0 0 8px">แก้ไขข้อมูล: <span id="editingLabel"></span></h4>
            <form id="editForm">
              <input type="hidden" name="original_student_id" id="edit_original_student_id">
              <div>
                <label class="muted" for="edit_student_id">รหัสนักศึกษา</label>
                <input id="edit_student_id" name="student_id" type="text" placeholder="รหัสนักศึกษา" required>
              </div>
              <div style="margin-top:8px">
                <label class="muted" for="edit_student_name">ชื่อ-นามสกุล</label>
                <input id="edit_student_name" name="student_name" type="text" placeholder="ชื่อ-นามสกุล" required>
              </div>
              <div style="margin-top:10px;display:flex;gap:8px">
                <button type="submit" class="btn primary" id="saveEditBtn">บันทึก</button>
                <button type="button" id="cancelEdit" class="btn">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    // นาฬิกาเรียลไทม์
    function tick() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      document.getElementById('clockOut').textContent = h + ':' + m + ':' + s;
    }
    tick();
    setInterval(tick, 1000);

    // โหมด Matrix — ฝนตัวอักษรบน canvas พื้นหลัง (เปิดอัตโนมัติทันทีที่โหลดหน้า)
    let matrixCanvas, matrixCtx, matrixInterval;

    function pageHeight() {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
    }

    function sizeMatrix() {
      if (!matrixCanvas) return;
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = pageHeight();
      matrixCanvas.style.height = matrixCanvas.height + 'px';
    }

    function startMatrix() {
      matrixCanvas = document.createElement('canvas');
      matrixCanvas.style.position = 'absolute'; // absolute เทียบกับ body ทั้งหน้า ไม่ใช่แค่ viewport
      matrixCanvas.style.top = '0';
      matrixCanvas.style.left = '0';
      matrixCanvas.style.width = '100vw';
      matrixCanvas.style.zIndex = '-2';
      matrixCanvas.style.opacity = '0.5';
      matrixCanvas.style.pointerEvents = 'none';
      document.body.insertBefore(matrixCanvas, document.body.firstChild);
      matrixCtx = matrixCanvas.getContext('2d');
      sizeMatrix();

      const chars = 'アイウエオカキクケコ01アルゴリズムEXPRESS';
      const fontSize = 15;
      let columns = Math.floor(matrixCanvas.width / fontSize);
      let drops = new Array(columns).fill(1);

      matrixInterval = setInterval(() => {
        matrixCtx.fillStyle = 'rgba(10, 14, 20, 0.08)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        matrixCtx.fillStyle = '#5eead4';
        matrixCtx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }, 45);
    }
    startMatrix();

    // resize ตอนหน้าจอเปลี่ยนขนาด หรือเนื้อหาเปลี่ยนความสูง (เช่น ตารางยาวขึ้นตอนเพิ่มข้อมูล)
    window.addEventListener('resize', sizeMatrix);
    new ResizeObserver(sizeMatrix).observe(document.body);

    // คลิปปั่นๆ — สุ่มวิดีโอ YouTube จากลิสต์ แล้วฝัง embed (ไม่ต้องใช้ API key)
    const vibeClips = [
      'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      'y6120QOlsfU', // Darude - Sandstorm
      'FtutLA63Cp8', // Baby Shark Dance
      'PGNiXGX2nLU', // Trololo — Eduard Khil
      'oHg5SJYRHA0', // RickRoll'D remix (Numa Numa era clip)
      'Sagg08DrO5U', // Harlem Shake
      'jofNR_WkoCE'  // Chocolate Rain
    ];

    function loadRandomClip() {
      const iframe = document.getElementById('vibeVideo');
      const pick = vibeClips[Math.floor(Math.random() * vibeClips.length)];
      iframe.src = 'https://www.youtube.com/embed/' + pick + '?autoplay=1&mute=1';
    }
    loadRandomClip();
    document.getElementById('reshuffleBtn').addEventListener('click', loadRandomClip);

    // ================= CRUD (ฝั่งขวา) =================
    let students = [];       // แหล่งข้อมูลเดียวที่ใช้ render ทั้งตารางและ sidebar
    let editingId = null;    // id ที่กำลังแก้ไขอยู่ (ถ้ามี)

    function escapeHtmlClient(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    function escapeAttrClient(str){ return escapeHtmlClient(str); }

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
        document.getElementById('loadError').innerHTML = '<div class="err">โหลดข้อมูลไม่สำเร็จ: ' + escapeHtmlClient(err.message) + ' — <button class="btn" onclick="refresh()">ลองใหม่</button></div>';
      }
    }

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
        return '<tr data-id="' + escapeAttrClient(s.student_id) + '"' + (isEditing ? ' class="editing"' : '') + '>' +
          '<td>' + escapeHtmlClient(s.student_id) + '</td>' +
          '<td>' + escapeHtmlClient(s.student_name) + '</td>' +
          '<td class="row-actions">' +
            '<button type="button" class="btn" data-action="edit" data-id="' + escapeAttrClient(s.student_id) + '">แก้ไข</button>' +
            '<button type="button" class="btn danger" data-action="del" data-id="' + escapeAttrClient(s.student_id) + '">ลบ</button>' +
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
        return '<div class="list-item' + (isEditing ? ' editing' : '') + '" data-id="' + escapeAttrClient(s.student_id) + '">' +
          '<div><div><strong>' + escapeHtmlClient(s.student_name) + '</strong></div><div class="meta">' + escapeHtmlClient(s.student_id) + '</div></div>' +
          '<div>' +
            '<button type="button" class="icon-btn" data-action="edit" data-id="' + escapeAttrClient(s.student_id) + '" title="แก้ไข">✏️</button>' +
            '<button type="button" class="icon-btn" data-action="del" data-id="' + escapeAttrClient(s.student_id) + '" title="ลบ">🗑️</button>' +
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

    // init
    refresh();
    setInterval(function () {
      if (!editingId) refresh();
    }, 30000);
  </script>
</body>
</html>
  `);
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
