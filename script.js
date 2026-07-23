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
    speed: 2.0,
    targetSpeed: 2.0,
    rings: [],
    stars: [],
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

    // 隧道环：从远处向前推
    const RING_COUNT = 42;
    for (let i = 0; i < RING_COUNT; i++) {
      tunnel.rings.push({
        z: (i / RING_COUNT) * 1000 + 20,
        rot: Math.random() * Math.PI * 2,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // 少量星光辅助
    const STAR_COUNT = 220;
    for (let i = 0; i < STAR_COUNT; i++) {
      tunnel.stars.push(spawnStar());
    }

    function spawnStar() {
      return {
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 20,
        pz: 0,
        hue: Math.random() < 0.08 ? 300 + Math.random() * 40 : 180 + Math.random() * 20,
      };
    }

    function tick() {
      const { w, h } = tunnel;
      const cx = w / 2;
      const cy = h / 2;
      const focal = 260;

      tunnel.speed += (tunnel.targetSpeed - tunnel.speed) * 0.08;
      tunnel.time += 0.016;

      // 拖影
      ctx.fillStyle = "rgba(3, 6, 10, 0.32)";
      ctx.fillRect(0, 0, w, h);

      // ==== 隧道六边形环 ====
      const sortedRings = tunnel.rings.slice().sort((a, b) => b.z - a.z);

      for (const ring of tunnel.rings) {
        ring.z -= tunnel.speed * 8;
        if (ring.z < 1) {
          ring.z = 1000;
          ring.rot = Math.random() * Math.PI * 2;
          ring.wobble = Math.random() * Math.PI * 2;
        }
      }

      for (const ring of sortedRings) {
        const scale = focal / ring.z;
        const radius = Math.max(w, h) * 0.9 * scale;
        const alpha = Math.min(1, (1 - ring.z / 1000) * 1.4);
        const wob = Math.sin(tunnel.time * 1.2 + ring.wobble) * 6 * scale;
        const rot = ring.rot + tunnel.time * 0.08;

        // 六边形环
        ctx.strokeStyle = `hsla(188, 100%, ${55 + alpha * 20}%, ${alpha * 0.9})`;
        ctx.lineWidth = Math.max(0.6, alpha * 2.4);
        ctx.beginPath();
        for (let s = 0; s <= 6; s++) {
          const a = rot + (s * Math.PI) / 3;
          const px = cx + Math.cos(a) * (radius + wob);
          const py = cy + Math.sin(a) * (radius + wob);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // 六边形节点上的高光
        ctx.fillStyle = `hsla(188, 100%, 80%, ${alpha})`;
        for (let s = 0; s < 6; s++) {
          const a = rot + (s * Math.PI) / 3;
          const px = cx + Math.cos(a) * (radius + wob);
          const py = cy + Math.sin(a) * (radius + wob);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, alpha * 2), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ==== 星点 & 拖尾 ====
      for (let i = 0; i < tunnel.stars.length; i++) {
        const s = tunnel.stars[i];
        s.pz = s.z;
        s.z -= tunnel.speed * 8;
        if (s.z < 1) {
          Object.assign(s, spawnStar());
          s.z = 1000;
          s.pz = 1000;
          continue;
        }

        const sx = (s.x / s.z) * focal + cx;
        const sy = (s.y / s.z) * focal + cy;
        const px = (s.x / s.pz) * focal + cx;
        const py = (s.y / s.pz) * focal + cy;

        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

        const size = Math.max(0.4, (1 - s.z / 1000) * 2.2);
        const alpha = Math.min(1, (1 - s.z / 1000) * 1.3);

        ctx.strokeStyle = `hsla(${s.hue}, 100%, 70%, ${alpha * 0.8})`;
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

      // 中心高光
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
      glow.addColorStop(0, "rgba(0, 240, 255, 0.14)");
      glow.addColorStop(0.35, "rgba(0, 240, 255, 0.05)");
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

  // ---------- Tagline 循环切换（全息广播感） ----------
  const taglines = [
    "◤ INITIALIZING VISUAL CORTEX",
    "◤ LOADING DESIGNER PROFILE · XWR",
    "◤ ALIGNING TO xiongwenrui.cn",
    "◤ DECRYPTING PORTFOLIO STREAM",
    "◤ HANDSHAKE COMPLETE · READY TO ENTER",
  ];
  let tagIndex = 0;
  function nextTag() {
    if (!taglineEl) return;
    taglineEl.textContent = taglines[tagIndex];
    taglineEl.dataset.text = taglines[tagIndex];
    tunnel.targetSpeed = 2.0 + tagIndex * 0.5;
    tagIndex++;
    if (tagIndex < taglines.length) {
      setTimeout(nextTag, 900);
    } else {
      // 全部展示完，露出 ENTER
      showEnter();
    }
  }
  setTimeout(nextTag, 700);

  function showEnter() {
    if (enterEl) enterEl.classList.add("show");
    tunnel.targetSpeed = 3.4;
  }

  // ---------- 进入主界面 ----------
  function warpIn() {
    tunnel.targetSpeed = 26;
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
