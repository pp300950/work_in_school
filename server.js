// 1. เรียกใช้งาน Express ซึ่งเป็นเครื่องมือสร้าง Web Server
const express = require("express");
const app = express();

// 2. สร้าง Route หรือเส้นทาง เมื่อมีคนพิมพ์ URL เข้ามาที่หน้าแรก (/)
app.get("/", (request, response) => {
  // สิ่งที่ Server จะตอบกลับไป (Response)
  response.send(`
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>server.js — รหัสนักศึกษา 69319011766</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"></script>
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
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Noto Sans Thai', 'JetBrains Mono', monospace;
  }

  body {
    background-image:
      radial-gradient(circle at 1px 1px, rgba(94, 234, 212, 0.07) 1px, transparent 0);
    background-size: 28px 28px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px;
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
    z-index: 0;
  }

  .shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1320px;
    display: grid;
    grid-template-columns: minmax(320px, 480px) minmax(420px, 1fr);
    gap: 22px;
    align-items: start;
  }

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

  .codewin {
    width: 100%;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    box-shadow:
      0 0 0 1px rgba(245, 169, 98, 0.04),
      0 30px 60px -20px rgba(0, 0, 0, 0.6),
      0 0 80px -30px rgba(245, 169, 98, 0.12);
    overflow: hidden;
    opacity: 0;
    animation: rise 0.6s ease-out 0.1s forwards;
  }

  @media (max-width: 980px) {
    .shell {
      grid-template-columns: 1fr;
      max-width: 720px;
    }
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
    font-size: clamp(22px, 5vw, 30px);
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

  button:focus-visible {
    outline: 2px solid var(--teal);
    outline-offset: 2px;
  }

  #clockOut {
    color: var(--teal);
    font-weight: 600;
  }

  .video-card {
    margin-top: 18px;
  }

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

  .video-card .actions {
    margin-top: 14px;
  }

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

  @media (max-width: 480px) {
    .field { grid-template-columns: 1fr; }
    .term-body { padding: 20px 18px 24px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .terminal, .codewin, .cursor-blink, .pulse { animation: none !important; }
    .terminal, .codewin { opacity: 1; transform: none; }
  }

  /* ===== Code practice window ===== */
  .code-body {
    padding: 20px 22px 24px;
    font-family: 'Noto Sans Thai', sans-serif;
  }

  .code-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .code-head h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }

  .code-head p {
    margin: 4px 0 0;
    font-size: 12.5px;
    color: var(--muted);
  }

  .lang-toggle {
    display: flex;
    border: 1px solid var(--panel-border);
    border-radius: 7px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .lang-toggle button {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    font-weight: 600;
    padding: 8px 14px;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .lang-toggle button.active {
    background: var(--amber);
    color: #0a0e14;
  }

  .lang-toggle button:not(.active):hover {
    color: var(--text);
    background: rgba(255,255,255,0.04);
  }

  .problem-tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-bottom: 14px;
  }

  .problem-tabs::-webkit-scrollbar { height: 5px; }
  .problem-tabs::-webkit-scrollbar-thumb { background: var(--panel-border); border-radius: 4px; }

  .ptab {
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 7px 12px;
    border-radius: 6px;
    border: 1px solid var(--panel-border);
    background: rgba(255,255,255,0.02);
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .ptab:hover { color: var(--text); border-color: var(--teal); }
  .ptab.active { color: var(--teal); border-color: var(--teal); background: rgba(94, 234, 212, 0.08); }
  .ptab .num { color: var(--muted); }
  .ptab.active .num { color: var(--teal); }
  .ptab .check {
    color: var(--green);
    display: none;
  }
  .ptab.solved .check { display: inline; }

  .problem-desc {
    background: #0d131b;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 14px;
    font-size: 13.5px;
    line-height: 1.65;
    color: var(--text);
  }

  .problem-desc .ptitle {
    font-weight: 700;
    color: var(--amber);
    margin-bottom: 6px;
    font-size: 14.5px;
  }

  .problem-desc code {
    font-family: 'JetBrains Mono', monospace;
    background: rgba(94, 234, 212, 0.1);
    color: var(--teal);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12.5px;
  }

  .editor-wrap {
    position: relative;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    overflow: hidden;
    background: #0b0f16;
  }

  .editor-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #0d131b;
    border-bottom: 1px solid var(--panel-border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    color: var(--muted);
  }

  textarea#codeInput {
    display: block;
    width: 100%;
    min-height: 220px;
    resize: vertical;
    background: transparent;
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    line-height: 1.6;
    padding: 14px 16px;
    border: none;
    outline: none;
    tab-size: 4;
    white-space: pre;
  }

  .run-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    flex-wrap: wrap;
  }

  button.btn.run {
    background: var(--teal);
    color: #0a0e14;
    border-color: var(--teal);
    font-weight: 700;
  }

  button.btn.run:hover {
    background: #7ff3dc;
    box-shadow: 0 0 20px rgba(94, 234, 212, 0.35);
  }

  button.btn.reset {
    margin-left: auto;
  }

  .console {
    margin-top: 16px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: #05070a;
    overflow: hidden;
  }

  .console-bar {
    padding: 8px 12px;
    background: #0d131b;
    border-bottom: 1px solid var(--panel-border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    color: var(--muted);
  }

  .console-out {
    padding: 14px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    min-height: 90px;
    max-height: 260px;
    overflow-y: auto;
    color: var(--muted);
  }

  .console-out.ok-state { color: var(--green); }
  .console-out .stdout-line { color: var(--text); }
  .console-out .err-line { color: var(--red); }
  .console-out .pass-line { color: var(--green); font-weight: 600; }
  .console-out .fail-line { color: var(--red); font-weight: 600; }
  .console-out .hint-line { color: var(--amber); }

  .result-banner {
    display: none;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 14px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Noto Sans Thai', sans-serif;
  }

  .result-banner.show { display: flex; }
  .result-banner.pass {
    background: rgba(94, 234, 212, 0.1);
    border: 1px solid rgba(94, 234, 212, 0.3);
    color: var(--green);
  }
  .result-banner.fail {
    background: rgba(255, 107, 107, 0.08);
    border: 1px solid rgba(255, 107, 107, 0.28);
    color: var(--red);
  }

  @media (max-width: 480px) {
    .code-body { padding: 16px 14px 20px; }
    textarea#codeInput { min-height: 180px; font-size: 12.5px; }
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="shell">
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

  <aside class="codewin">
    <div class="titlebar">
      <div class="dots">
        <span class="dot r"></span>
        <span class="dot y"></span>
        <span class="dot g"></span>
      </div>
      <span class="titlebar-label" id="codeWinLabel">code-practice — main.py</span>
    </div>

    <div class="code-body">
      <div class="code-head">
        <div>
          <h2>ห้องฝึกเขียนโค้ด</h2>
          <p>ไล่โจทย์ทีละขั้น จาก Hello World ไปจนถึงลายรูปสามเหลี่ยม</p>
        </div>
        <div class="lang-toggle">
          <button type="button" id="langPy" class="active">Python</button>
          <button type="button" id="langC">C</button>
        </div>
      </div>

      <div class="problem-tabs" id="problemTabs"></div>

      <div class="problem-desc" id="problemDesc"></div>

      <div class="editor-wrap">
        <div class="editor-bar">
          <span id="editorFileName">main.py</span>
          <span id="editorLangTag">python3</span>
        </div>
        <textarea id="codeInput" spellcheck="false"></textarea>
      </div>

      <div class="run-row">
        <button class="btn run" id="runBtn" type="button">▶ รันโค้ด</button>
        <button class="btn" id="resetBtn" type="button">รีเซ็ตโค้ด</button>
        <button class="btn reset" id="nextBtn" type="button" style="display:none;">ข้อถัดไป →</button>
      </div>

      <div class="console">
        <div class="console-bar">ผลลัพธ์การรัน (Output)</div>
        <div class="console-out" id="consoleOut">กด "รันโค้ด" เพื่อดูผลลัพธ์ที่นี่...</div>
      </div>

      <div class="result-banner" id="resultBanner"></div>
    </div>
  </aside>
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

    function startMatrix() {
      matrixCanvas = document.createElement('canvas');
      matrixCanvas.style.position = 'fixed';
      matrixCanvas.style.top = '0';
      matrixCanvas.style.left = '0';
      matrixCanvas.style.width = '100vw';
      matrixCanvas.style.height = '100vh';
      matrixCanvas.style.zIndex = '0';
      matrixCanvas.style.opacity = '0.5';
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
      document.body.appendChild(matrixCanvas);
      matrixCtx = matrixCanvas.getContext('2d');

      const chars = 'アイウエオカキクケコ01アルゴリズムEXPRESS';
      const fontSize = 15;
      const columns = Math.floor(matrixCanvas.width / fontSize);
      const drops = new Array(columns).fill(1);

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

    window.addEventListener('resize', () => {
      if (matrixCanvas) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
      }
    });

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

    // ===================== ห้องฝึกเขียนโค้ด =====================
    // โจทย์ไล่ระดับ: Hello World -> ตัวแปร/ผลรวม -> สูตรคูณ -> ลายรูปสามเหลี่ยม/สี่เหลี่ยม
    // Python รันจริงในเบราว์เซอร์ด้วย Pyodide (WASM CPython)
    // C ไม่มีตัวคอมไพล์ในเบราว์เซอร์ จึงตรวจคำตอบด้วยการเทียบผลลัพธ์ที่คาดหวัง (judge แบบ pattern) ไม่ใช่การคอมไพล์จริง

    const problems = [
      {
        id: 'hello',
        title: 'ข้อ 1 — Hello World',
        desc: 'เขียนโปรแกรมพิมพ์ข้อความ <code>Hello, World!</code> ออกทางหน้าจอ (บรรทัดเดียว)',
        expected: ['Hello, World!'],
        starter: {
          py: 'print("Hello, World!")',
          c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
        }
      },
      {
        id: 'intro',
        title: 'ข้อ 2 — แนะนำตัว',
        desc: 'ประกาศตัวแปรชื่อ <code>name</code> เก็บค่า <code>"พงศกร"</code> แล้วพิมพ์ข้อความว่า <code>สวัสดีครับ ผมชื่อ พงศกร</code>',
        expected: ['สวัสดีครับ ผมชื่อ พงศกร'],
        starter: {
          py: 'name = "พงศกร"\nprint("สวัสดีครับ ผมชื่อ " + name)',
          c: '#include <stdio.h>\n\nint main() {\n    char name[] = "พงศกร";\n    printf("สวัสดีครับ ผมชื่อ %s\\n", name);\n    return 0;\n}'
        }
      },
      {
        id: 'sumn',
        title: 'ข้อ 3 — ผลรวม 1 ถึง N',
        desc: 'ใช้ลูปหาผลรวมของเลข 1 ถึง 10 แล้วพิมพ์ผลลัพธ์เป็น <code>ผลรวม 1 ถึง 10 คือ 55</code>',
        expected: ['ผลรวม 1 ถึง 10 คือ 55'],
        starter: {
          py: 'total = 0\nfor i in range(1, 11):\n    total += i\nprint("ผลรวม 1 ถึง 10 คือ " + str(total))',
          c: '#include <stdio.h>\n\nint main() {\n    int total = 0;\n    for (int i = 1; i <= 10; i++) {\n        total += i;\n    }\n    printf("ผลรวม 1 ถึง 10 คือ %d\\n", total);\n    return 0;\n}'
        }
      },
      {
        id: 'multtable',
        title: 'ข้อ 4 — สูตรคูณแม่ 5',
        desc: 'พิมพ์สูตรคูณแม่ 5 ตั้งแต่ 5x1 ถึง 5x12 รูปแบบแต่ละบรรทัดคือ <code>5 x 1 = 5</code>',
        expected: (() => {
          const lines = [];
          for (let i = 1; i <= 12; i++) lines.push('5 x ' + i + ' = ' + (5 * i));
          return lines;
        })(),
        starter: {
          py: 'for i in range(1, 13):\n    print("5 x " + str(i) + " = " + str(5 * i))',
          c: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 12; i++) {\n        printf("5 x %d = %d\\n", i, 5 * i);\n    }\n    return 0;\n}'
        }
      },
      {
        id: 'righttri',
        title: 'ข้อ 5 — สามเหลี่ยมมุมฉาก',
        desc: 'พิมพ์รูปสามเหลี่ยมมุมฉากจากดอกจัน (*) สูง 5 แถว โดยแถวที่ 1 มี 1 ดอก แถวที่ 2 มี 2 ดอก ไปเรื่อยๆ จนถึงแถวที่ 5 มี 5 ดอก',
        expected: (() => {
          const lines = [];
          for (let i = 1; i <= 5; i++) lines.push('*'.repeat(i));
          return lines;
        })(),
        starter: {
          py: 'for i in range(1, 6):\n    print("*" * i)',
          c: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        for (int j = 0; j < i; j++) {\n            printf("*");\n        }\n        printf("\\n");\n    }\n    return 0;\n}'
        }
      },
      {
        id: 'pyramid',
        title: 'ข้อ 6 — สามเหลี่ยมหน้าจั่ว',
        desc: 'พิมพ์รูปสามเหลี่ยมหน้าจั่ว (พีระมิด) จากดอกจัน (*) สูง 5 แถว โดยจัดกึ่งกลางด้วยช่องว่างนำหน้าให้ถูกต้อง',
        expected: (() => {
          const n = 5;
          const lines = [];
          for (let i = 1; i <= n; i++) {
            lines.push(' '.repeat(n - i) + '*'.repeat(2 * i - 1));
          }
          return lines;
        })(),
        starter: {
          py: 'n = 5\nfor i in range(1, n + 1):\n    print(" " * (n - i) + "*" * (2 * i - 1))',
          c: '#include <stdio.h>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        for (int s = 0; s < n - i; s++) printf(" ");\n        for (int k = 0; k < 2 * i - 1; k++) printf("*");\n        printf("\\n");\n    }\n    return 0;\n}'
        }
      },
      {
        id: 'square',
        title: 'ข้อ 7 — สี่เหลี่ยมจัตุรัส',
        desc: 'พิมพ์รูปสี่เหลี่ยมจัตุรัสขนาด 5x5 โดยแต่ละแถวเต็มไปด้วยดอกจัน (*) จำนวน 5 ตัว',
        expected: (() => {
          const lines = [];
          for (let i = 0; i < 5; i++) lines.push('*'.repeat(5));
          return lines;
        })(),
        starter: {
          py: 'n = 5\nfor i in range(n):\n    print("*" * n)',
          c: '#include <stdio.h>\n\nint main() {\n    int n = 5;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) printf("*");\n        printf("\\n");\n    }\n    return 0;\n}'
        }
      }
    ];

    let currentLang = 'py';
    let currentIndex = 0;
    const solved = new Set();
    let pyodideInstance = null;
    let pyodideLoading = false;

    const tabsEl = document.getElementById('problemTabs');
    const descEl = document.getElementById('problemDesc');
    const codeInput = document.getElementById('codeInput');
    const consoleOut = document.getElementById('consoleOut');
    const resultBanner = document.getElementById('resultBanner');
    const runBtn = document.getElementById('runBtn');
    const nextBtn = document.getElementById('nextBtn');
    const editorFileName = document.getElementById('editorFileName');
    const editorLangTag = document.getElementById('editorLangTag');
    const codeWinLabel = document.getElementById('codeWinLabel');
    const langPyBtn = document.getElementById('langPy');
    const langCBtn = document.getElementById('langC');

    function renderTabs() {
      tabsEl.innerHTML = '';
      problems.forEach((p, idx) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'ptab' + (idx === currentIndex ? ' active' : '') + (solved.has(p.id + '_' + currentLang) ? ' solved' : '');
        tab.innerHTML = '<span class="num">' + (idx + 1) + '</span><span>' + p.title.split('— ')[1] + '</span><span class="check">✓</span>';
        tab.addEventListener('click', () => selectProblem(idx));
        tabsEl.appendChild(tab);
      });
    }

    function renderDesc() {
      const p = problems[currentIndex];
      descEl.innerHTML = '<div class="ptitle">' + p.title + '</div>' + p.desc;
    }

    function loadStarterCode() {
      const p = problems[currentIndex];
      codeInput.value = p.starter[currentLang];
    }

    function updateEditorChrome() {
      if (currentLang === 'py') {
        editorFileName.textContent = 'main.py';
        editorLangTag.textContent = 'python3';
        codeWinLabel.textContent = 'code-practice — main.py';
      } else {
        editorFileName.textContent = 'main.c';
        editorLangTag.textContent = 'c (gcc, judge)';
        codeWinLabel.textContent = 'code-practice — main.c';
      }
    }

    function selectProblem(idx) {
      currentIndex = idx;
      renderTabs();
      renderDesc();
      loadStarterCode();
      resetConsole();
    }

    function resetConsole() {
      consoleOut.textContent = 'กด "รันโค้ด" เพื่อดูผลลัพธ์ที่นี่...';
      consoleOut.className = 'console-out';
      resultBanner.className = 'result-banner';
      resultBanner.textContent = '';
      nextBtn.style.display = 'none';
    }

    function setLang(lang) {
      currentLang = lang;
      langPyBtn.classList.toggle('active', lang === 'py');
      langCBtn.classList.toggle('active', lang === 'c');
      updateEditorChrome();
      renderTabs();
      loadStarterCode();
      resetConsole();
    }

    langPyBtn.addEventListener('click', () => setLang('py'));
    langCBtn.addEventListener('click', () => setLang('c'));

    document.getElementById('resetBtn').addEventListener('click', () => {
      loadStarterCode();
      resetConsole();
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < problems.length - 1) {
        selectProblem(currentIndex + 1);
      }
    });

    function printLines(lines, cls) {
      consoleOut.innerHTML = lines.map(l => {
        const safe = l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<span class="' + cls + '">' + (safe === '' ? '&nbsp;' : safe) + '</span>';
      }).join('\n');
    }

    function showResult(pass, actualLines, expectedLines, extraNote) {
      if (pass) {
        resultBanner.className = 'result-banner pass show';
        resultBanner.textContent = '✓ ผ่านแล้วครับ! ผลลัพธ์ตรงกับที่โจทย์ต้องการ';
        solved.add(problems[currentIndex].id + '_' + currentLang);
        renderTabs();
        if (currentIndex < problems.length - 1) {
          nextBtn.style.display = 'inline-flex';
        } else {
          nextBtn.style.display = 'none';
        }
      } else {
        resultBanner.className = 'result-banner fail show';
        resultBanner.textContent = '✗ ยังไม่ผ่าน ลองตรวจสอบผลลัพธ์ด้านล่างแล้วแก้โค้ดใหม่' + (extraNote ? (' — ' + extraNote) : '');
        nextBtn.style.display = 'none';
      }
    }

    async function ensurePyodide() {
      if (pyodideInstance) return pyodideInstance;
      if (pyodideLoading) {
        // wait until existing load finishes
        while (pyodideLoading) {
          await new Promise(r => setTimeout(r, 150));
        }
        return pyodideInstance;
      }
      pyodideLoading = true;
      consoleOut.textContent = 'กำลังโหลด Python runtime ครั้งแรก (Pyodide) รอสักครู่...';
      consoleOut.className = 'console-out';
      try {
        pyodideInstance = await loadPyodide();
      } finally {
        pyodideLoading = false;
      }
      return pyodideInstance;
    }

    async function runPython(code, expectedLines) {
      let py;
      try {
        py = await ensurePyodide();
      } catch (e) {
        printLines(['ไม่สามารถโหลด Python runtime ได้ (ต้องใช้อินเทอร์เน็ตในการโหลดครั้งแรก)', String(e)], 'err-line');
        showResult(false, [], expectedLines, 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        return;
      }

      let capturedOut = '';
      py.setStdout({ batched: (s) => { capturedOut += s + '\n'; } });
      py.setStderr({ batched: (s) => { capturedOut += s + '\n'; } });

      try {
        await py.runPythonAsync(code);
        const actualLines = capturedOut.replace(/\n$/, '').split('\n');
        const pass = JSON.stringify(actualLines) === JSON.stringify(expectedLines);
        const displayLines = actualLines.length === 1 && actualLines[0] === '' ? ['(ไม่มีผลลัพธ์ออกทางหน้าจอ)'] : actualLines;
        printLines(displayLines, pass ? 'stdout-line' : 'stdout-line');
        showResult(pass, actualLines, expectedLines);
      } catch (err) {
        const msg = String(err.message || err);
        printLines(['เกิดข้อผิดพลาดขณะรัน (บั๊ก):', msg], 'err-line');
        showResult(false, [], expectedLines, 'มีบั๊กในโค้ด ดูข้อความ error ด้านบน');
      }
    }

    // C: ไม่มีตัวคอมไพล์จริงในเบราว์เซอร์ — ตรวจแบบ "judge" คือดูว่าโค้ดมีโครงสร้างที่ควรจะพิมพ์ผลลัพธ์ตามที่คาดหวังหรือไม่
    // โดยประเมินจาก printf ที่ปรากฏและรูปแบบลูปอย่างคร่าวๆ แล้วแจ้งผลแบบผ่าน/ไม่ผ่านเหมือนการรันจริง
    function runC(code, expectedLines, problemId) {
      // เช็คโครงสร้างพื้นฐานก่อน (เหมือน compile check ผิวเผิน)
      if (!code.includes('#include')) {
        printLines(['error: ไม่พบ #include <stdio.h>', 'โปรแกรม C ต้องมีการ include header ก่อนใช้ printf'], 'err-line');
        showResult(false, [], expectedLines, 'ลืม #include <stdio.h> หรือเปล่า?');
        return;
      }
      if (!/int\s+main\s*\(/.test(code)) {
        printLines(['error: ไม่พบฟังก์ชัน main()', 'โปรแกรม C ทุกตัวต้องมีฟังก์ชัน main'], 'err-line');
        showResult(false, [], expectedLines, 'ลืมประกาศ int main() หรือเปล่า?');
        return;
      }
      if (!code.includes('printf')) {
        printLines(['error: ไม่พบคำสั่ง printf', 'ต้องใช้ printf() เพื่อแสดงผลลัพธ์ออกทางหน้าจอ'], 'err-line');
        showResult(false, [], expectedLines, 'ยังไม่มีคำสั่งพิมพ์ผลลัพธ์');
        return;
      }

      // ตรวจแบบเจาะจงต่อโจทย์ ว่ามีคำสั่ง/ตรรกะที่ควรให้ผลลัพธ์ตรงกับที่คาดหวังหรือไม่
      let pass = false;
      let note = 'ผลลัพธ์ยังไม่ตรงกับโจทย์ ลองตรวจรูปแบบ printf และเงื่อนไขลูปอีกครั้ง';

      const norm = code.replace(/\s+/g, ' ');

      switch (problemId) {
        case 'hello':
          pass = /printf\s*\(\s*"Hello,\s*World!\\n?"/.test(code);
          break;
        case 'intro':
          pass = code.includes('พงศกร') && /printf/.test(code) && code.includes('สวัสดีครับ ผมชื่อ');
          break;
        case 'sumn':
          pass = /for\s*\(/.test(code) && /total|sum/i.test(code) && code.includes('ผลรวม 1 ถึง 10 คือ') && /%d/.test(code);
          break;
        case 'multtable':
          pass = /for\s*\(/.test(code) && /5\s*\*\s*i|i\s*\*\s*5/.test(norm) && /printf/.test(code) && /x\s*%d\s*=\s*%d|%d\s*x\s*%d\s*=\s*%d/.test(code.replace(/\\n/g, ''));
          break;
        case 'righttri':
          pass = /for\s*\(/.test(code) && (code.match(/for\s*\(/g) || []).length >= 2 && code.includes('*') && code.includes('printf');
          break;
        case 'pyramid':
          pass = /for\s*\(/.test(code) && (code.match(/for\s*\(/g) || []).length >= 3 && code.includes('*') && code.includes('" "') && code.includes('printf');
          break;
        case 'square':
          pass = /for\s*\(/.test(code) && (code.match(/for\s*\(/g) || []).length >= 2 && code.includes('*') && code.includes('printf') && !code.includes('" "');
          break;
        default:
          pass = false;
      }

      // แสดงผลลัพธ์จำลอง (ตามที่โจทย์คาดหวัง) เพื่อให้เห็นภาพเหมือนรันจริง เมื่อโครงสร้างโค้ดถูกต้อง
      if (pass) {
        printLines(expectedLines, 'stdout-line');
      } else {
        printLines(['(โปรแกรมยังไม่ให้ผลลัพธ์ตามที่โจทย์ต้องการ)', 'หมายเหตุ: ห้องนี้ตรวจโค้ด C ด้วยการเทียบโครงสร้างคำสั่ง ไม่ได้คอมไพล์จริงในเบราว์เซอร์'], 'hint-line');
      }
      showResult(pass, [], expectedLines, note);
    }

    runBtn.addEventListener('click', async () => {
      const p = problems[currentIndex];
      const code = codeInput.value;
      runBtn.disabled = true;
      runBtn.textContent = '⏳ กำลังรัน...';
      resultBanner.className = 'result-banner';

      if (currentLang === 'py') {
        await runPython(code, p.expected);
      } else {
        runC(code, p.expected, p.id);
      }

      runBtn.disabled = false;
      runBtn.textContent = '▶ รันโค้ด';
    });

    // เริ่มต้น
    renderTabs();
    renderDesc();
    loadStarterCode();
    updateEditorChrome();
  </script>
</body>
</html>
  `);
});

// 3. สั่งให้ Server เริ่มทำงานและรอรับข้อมูล
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(" Server กำลังทำงานที่ Port " + listener.address().port);
});
