// ============================================
// XIONG WENRUI PORTFOLIO - Interactions
// ============================================

// 0. 赛博开场引导序列（隧道穿越 + 全息投影）
(function bootSequence() {
  const loader = document.getElementById("bootLoader");
  if (!loader) return;

  const enterEl = document.getElementById("bootEnter");
  const enterBtn = document.getElementById("bootEnterBtn");
  const timeEl = document.getElementById("bootTime");
  const canvas = document.getElementById("bootHyperspace");
  const holoContent = document.querySelector(".holo-content");
  const taglineEl = document.getElementById("bootTagline");

  // ---------- 隧道穿越（Canvas） ----------
  let tunnelRAF = null;
  const tunnel = {
    speed: 5.0,
    targetSpeed: 5.0,
    rings: [],
    stars: [],
    dataStreams: [],
    time: 0,
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  };

  function setupTunnel() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);

    function resize() {
      const dpr = tunnel.dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tunnel.w = w;
      tunnel.h = h;
    }

    // 更多环，制造更快的密度感（Link Start 视觉）
    const RING_COUNT = 60;
    for (let i = 0; i < RING_COUNT; i++) {
      tunnel.rings.push({
        z: (i / RING_COUNT) * 1200 + 20,
        rot: Math.random() * Math.PI * 2,
        wobble: Math.random() * Math.PI * 2,
        sides: 6,
      });
    }

    const STAR_COUNT = 320;
    for (let i = 0; i < STAR_COUNT; i++) {
      tunnel.stars.push(spawnStar());
    }

    // 侧边数据流字符（刀剑神域 SAO 感）
    const glyphs = "01アイウエオカキクケコサシスセソタチツテトナ⌘◆◇▲▼◤◢◣◥ⰀⰁⰂⰃⰄ";
    for (let i = 0; i < 30; i++) {
      tunnel.dataStreams.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        speed: 2 + Math.random() * 5,
        text: Array.from({ length: 14 }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join(""),
        alpha: 0.25 + Math.random() * 0.5,
      });
    }

    function spawnStar() {
      return {
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 2400,
        z: Math.random() * 1200 + 20,
        pz: 0,
        hue: Math.random() < 0.08 ? 300 + Math.random() * 40 : 180 + Math.random() * 20,
      };
    }

    function tick() {
      const { w, h } = tunnel;
      const cx = w / 2;
      const cy = h / 2;
      const focal = 260;

      tunnel.speed += (tunnel.targetSpeed - tunnel.speed) * 0.09;
      tunnel.time += 0.016;

      // 拖影：速度越快，拖影越弱（表示更长条的光轨）
      const trailAlpha = Math.max(0.12, 0.35 - tunnel.speed * 0.008);
      ctx.fillStyle = `rgba(3, 6, 10, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);

      // ==== 隧道六边形环 ====
      for (const ring of tunnel.rings) {
        ring.z -= tunnel.speed * 14;
        if (ring.z < 1) {
          ring.z = 1200;
          ring.rot = Math.random() * Math.PI * 2;
          ring.wobble = Math.random() * Math.PI * 2;
        }
      }

      const sortedRings = tunnel.rings.slice().sort((a, b) => b.z - a.z);

      for (const ring of sortedRings) {
        const scale = focal / ring.z;
        const radius = Math.max(w, h) * 0.95 * scale;
        const alpha = Math.min(1, (1 - ring.z / 1200) * 1.4);
        const wob = Math.sin(tunnel.time * 1.5 + ring.wobble) * 8 * scale;
        const rot = ring.rot + tunnel.time * 0.14;

        ctx.strokeStyle = `hsla(188, 100%, ${58 + alpha * 22}%, ${alpha * 0.9})`;
        ctx.lineWidth = Math.max(0.6, alpha * 2.6);
        ctx.beginPath();
        for (let s = 0; s <= 6; s++) {
          const a = rot + (s * Math.PI) / 3;
          const px = cx + Math.cos(a) * (radius + wob);
          const py = cy + Math.sin(a) * (radius + wob);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = `hsla(188, 100%, 82%, ${alpha})`;
        for (let s = 0; s < 6; s++) {
          const a = rot + (s * Math.PI) / 3;
          const px = cx + Math.cos(a) * (radius + wob);
          const py = cy + Math.sin(a) * (radius + wob);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, alpha * 2.2), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ==== 星点 & 高速拖尾 ====
      for (let i = 0; i < tunnel.stars.length; i++) {
        const s = tunnel.stars[i];
        s.pz = s.z;
        s.z -= tunnel.speed * 14;
        if (s.z < 1) {
          Object.assign(s, spawnStar());
          s.z = 1200;
          s.pz = 1200;
          continue;
        }

        const sx = (s.x / s.z) * focal + cx;
        const sy = (s.y / s.z) * focal + cy;
        const px = (s.x / s.pz) * focal + cx;
        const py = (s.y / s.pz) * focal + cy;

        if (sx < -30 || sx > w + 30 || sy < -30 || sy > h + 30) continue;

        const size = Math.max(0.4, (1 - s.z / 1200) * 2.6);
        const alpha = Math.min(1, (1 - s.z / 1200) * 1.4);

        ctx.strokeStyle = `hsla(${s.hue}, 100%, 72%, ${alpha * 0.9})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.fillStyle = `hsla(${s.hue}, 100%, 88%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ==== 数据流字符（SAO 侧栏感） ====
      ctx.font = "10px monospace";
      ctx.textBaseline = "top";
      for (const d of tunnel.dataStreams) {
        d.y += d.speed * (tunnel.speed / 6);
        if (d.y > h + 20) {
          d.y = -20;
          d.x = Math.random() * w;
        }
        ctx.fillStyle = `hsla(188, 100%, 70%, ${d.alpha})`;
        ctx.fillText(d.text, d.x, d.y);
      }

      // 中心高光
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
      glow.addColorStop(0, "rgba(0, 240, 255, 0.16)");
      glow.addColorStop(0.35, "rgba(0, 240, 255, 0.06)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      tunnelRAF = requestAnimationFrame(tick);
    }

    tick();
  }

  setupTunnel();

  // ---------- 时间 ----------
  function tickClock() {
    const d = new Date();
    if (timeEl) {
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      timeEl.textContent = `${h}:${m}:${s}`;
    }
  }
  tickClock();
  const tickTimer = setInterval(tickClock, 500);

  // ---------- 全息文字入场 ----------
  // 给 .holo-text 元素依次加上 .holo-reveal（携带 data-text 用于故障阴影）
  const holoTexts = document.querySelectorAll(".holo-text");
  holoTexts.forEach((el, i) => {
    // 不覆盖已有 data-text
    if (!el.dataset.text) el.dataset.text = el.textContent.trim();
    setTimeout(() => el.classList.add("holo-reveal"), 250 + i * 400);
  });

  // ---------- Tagline 循环切换（Link Start 广播感） ----------
  const taglines = [
    "◤ LINK START",
    "◤ SYSTEM CHECK · MEMORY · SIGHT · SOUND",
    "◤ SYNCING NEURAL PROFILE · XWR",
    "◤ WORLD LINE FIXED → xiongwenrui.cn",
    "◤ READY TO DIVE",
  ];
  let tagIndex = 0;
  function nextTag() {
    if (!taglineEl) return;
    taglineEl.textContent = taglines[tagIndex];
    taglineEl.dataset.text = taglines[tagIndex];
    // 隧道随广播加速
    tunnel.targetSpeed = 5 + tagIndex * 2.2;
    tagIndex++;
    if (tagIndex < taglines.length) {
      setTimeout(nextTag, 600);
    } else {
      showEnter();
    }
  }
  setTimeout(nextTag, 500);

  function showEnter() {
    if (enterEl) enterEl.classList.add("show");
    tunnel.targetSpeed = 12;
  }

  // ---------- 进入主界面 ----------
  function warpIn() {
    tunnel.targetSpeed = 60;
    loader.classList.add("warping");
    document.body.classList.add("booted");
    setTimeout(() => loader.classList.add("hide"), 550);
    setTimeout(() => {
      cancelAnimationFrame(tunnelRAF);
      loader.remove();
      clearInterval(tickTimer);
    }, 1300);
  }

  if (enterBtn) enterBtn.addEventListener("click", warpIn, { once: true });

  const anyKey = (ev) => {
    if (!enterEl || !enterEl.classList.contains("show")) return;
    warpIn();
    document.removeEventListener("keydown", anyKey);
    document.removeEventListener("click", clickAnywhere);
  };
  const clickAnywhere = (ev) => {
    if (!enterEl || !enterEl.classList.contains("show")) return;
    if (ev.target.closest(".boot-loader") && !ev.target.closest(".boot-enter-btn")) return;
    warpIn();
    document.removeEventListener("keydown", anyKey);
    document.removeEventListener("click", clickAnywhere);
  };
  document.addEventListener("keydown", anyKey);
  document.addEventListener("click", clickAnywhere);

  // Esc 快速跳过
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.body.classList.contains("booted")) {
      showEnter();
      setTimeout(warpIn, 60);
    }
  });
})();

// 1. 打字机效果
const typewriterEl = document.getElementById("typewriter");
const phrases = [
  "> initializing portfolio...",
  "> loading creative modules...",
  "> ready. hello, world.",
  "> AIGC · MOTION · 3D",
  "> 让每一帧都有想法。",
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typewriterLoop() {
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    typewriterEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typewriterLoop, 2000);
      return;
    }
  } else {
    typewriterEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typewriterLoop, isDeleting ? 30 : 60);
}

typewriterLoop();

// 2. 系统时间显示
function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const el = document.getElementById("time-display");
  if (el) el.textContent = `${h}:${m}:${s}`;
}

setInterval(updateTime, 1000);
updateTime();

// 3. 导航滚动高亮
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

function updateActiveNav() {
  const scrollY = window.scrollY + 200;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute("id");
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);

    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach((l) => l.classList.remove("active"));
      if (link) link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveNav);
updateActiveNav();

// 4. 淡入动画
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
);

document
  .querySelectorAll(".work-card, .skill-block, .tl-item, .contact-item")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(el);
  });

// 5. 作品卡片点击
document.querySelectorAll(".work-card").forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.querySelector(".work-title").textContent;
    // 这里可以后期换成弹窗播放器
    console.log(`Play: ${title}`);
  });
});

// 6. 状态文本轮播
const statusTexts = ["ONLINE", "AVAILABLE", "OPEN TO WORK"];
let statusIndex = 0;
setInterval(() => {
  const el = document.getElementById("status-text");
  if (el) {
    statusIndex = (statusIndex + 1) % statusTexts.length;
    el.textContent = statusTexts[statusIndex];
  }
}, 3000);

// 7. Konami 彩蛋（↑↑↓↓←→←→BA）—— 触发赛博狂欢模式
let keys = [];
const konami = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

document.addEventListener("keydown", (e) => {
  keys.push(e.key);
  keys = keys.slice(-10);
  if (keys.join(",") === konami.join(",")) {
    document.body.style.animation = "hueRotate 3s infinite";
    console.log("%c🎉 CYBER MODE ACTIVATED", "color:#00f0ff;font-size:20px");
  }
});

const style = document.createElement("style");
style.textContent = `@keyframes hueRotate { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
document.head.appendChild(style);

// 8. 微信号点击复制
const wechatEl = document.getElementById("wechat-copy");
if (wechatEl) {
  wechatEl.addEventListener("click", async () => {
    const text = wechatEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      showToast(`✅ 微信号 ${text} 已复制`);
    } catch (e) {
      // 老浏览器兜底
      const range = document.createRange();
      range.selectNode(wechatEl);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      try {
        document.execCommand("copy");
        showToast(`✅ 微信号 ${text} 已复制`);
      } catch {
        showToast(`❌ 复制失败，请手动选中复制`);
      }
    }
  });
}

function showToast(msg) {
  let toast = document.querySelector(".copied-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "copied-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// 9. 背景音乐开关
const bgm = document.getElementById("bgm");
const audioBtn = document.getElementById("audioToggle");
const audioLabel = document.getElementById("audioLabel");

if (bgm && audioBtn && audioLabel) {
  bgm.volume = 0.22;

  const savedPref = localStorage.getItem("bgm-on");
  if (savedPref === "1") {
    // 用户之前开过，浏览器策略可能会拦一次，用 promise 处理
    const kickoff = () => {
      bgm
        .play()
        .then(() => setAudioUI(true))
        .catch(() => {
          // 自动播放被拦，等第一次交互再触发
          const arm = () => {
            bgm.play().then(() => setAudioUI(true)).catch(() => {});
            document.removeEventListener("click", arm);
            document.removeEventListener("keydown", arm);
          };
          document.addEventListener("click", arm, { once: true });
          document.addEventListener("keydown", arm, { once: true });
        });
    };
    kickoff();
  } else {
    setAudioUI(false);
  }

  audioBtn.addEventListener("click", async () => {
    if (bgm.paused) {
      try {
        await bgm.play();
        setAudioUI(true);
        localStorage.setItem("bgm-on", "1");
      } catch (e) {
        console.warn("BGM play blocked:", e);
      }
    } else {
      bgm.pause();
      setAudioUI(false);
      localStorage.setItem("bgm-on", "0");
    }
  });

  function setAudioUI(on) {
    audioBtn.classList.toggle("playing", on);
    audioLabel.textContent = on ? "SOUND ON" : "SOUND OFF";
    const hint = audioBtn.querySelector(".audio-hint");
    if (hint) hint.textContent = on ? "赛博 BGM · 循环中" : "TAP TO PLAY BGM";
  }
}

// 10. 控制台招呼
console.log(
  "%c XIONG WENRUI %c AIGC DESIGNER ",
  "background:#00f0ff;color:#0a0a0a;padding:6px 12px;font-weight:bold;",
  "background:#0a0a0a;color:#00f0ff;padding:6px 12px;border:1px solid #00f0ff;"
);
console.log(
  "%c有项目合作？→ 微信 xwr20000531 / 邮箱 616917632@qq.com",
  "color:#888;font-family:monospace;"
);
