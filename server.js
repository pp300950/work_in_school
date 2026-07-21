// 1. เรียกใช้งาน Express ซึ่งเป็นเครื่องมือสร้าง Web Server
const express = require("express");
const app = express();

// 2. สร้าง Route หรือเส้นทาง เมื่อมีคนพิมพ์ URL เข้ามาที่หน้าแรก (/)
app.get("/", (request, response) => {
  // ตั้งค่า Content-Type ให้มี charset UTF-8 เพื่อให้ตัวอักษรภาษาไทยไม่เพี้ยน
  response.set('Content-Type', 'text/html; charset=utf-8');

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
    align-items: center;
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

  .terminal {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 720px;
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
    .terminal, .cursor-blink, .pulse { animation: none !important; }
    .terminal { opacity: 1; transform: none; }
  }
</style>
</head>
<body>
  <div class="glow"></div>
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
  </script>
</body>
</html>
  `);
});

// 3. สั่งให้ Server เริ่มทำงานและรอรับข้อมูล
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(" Server กำลังทำงานที่ Port " + listener.address().port);
});
