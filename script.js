// ============================================
// XIONG WENRUI PORTFOLIO - Interactions
// ============================================

// 0. 赛博开场引导序列（含 hyperspace 星门穿梭）
(function bootSequence() {
  const loader = document.getElementById("bootLoader");
  if (!loader) return;

  const logEl = document.getElementById("bootLog");
  const fillEl = document.getElementById("bootProgressFill");
  const textEl = document.getElementById("bootProgressText");
  const enterEl = document.getElementById("bootEnter");
  const enterBtn = document.getElementById("bootEnterBtn");
  const timeEl = document.getElementById("bootTime");
  const canvas = document.getElementById("bootHyperspace");

  // ---------- Hyperspace 粒子 ----------
  let hyperRAF = null;
  let hyperState = {
    speed: 1.6, // 基础速度
    targetSpeed: 1.6,
    stars: [],
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  };

  function setupHyperspace() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);

    function resize() {
      const dpr = hyperState.dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hyperState.w = w;
      hyperState.h = h;
    }

    // 生成星星（3D 空间坐标）
    const count = Math.min(680, Math.max(280, Math.floor(window.innerWidth * 0.35)));
    for (let i = 0; i < count; i++) {
      hyperState.stars.push(spawnStar());
    }

    function spawnStar() {
      return {
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 20,
        pz: 0,
        // 色相偏电光青，偶尔紫粉点缀
        hue: Math.random() < 0.12 ? 300 + Math.random() * 40 : 180 + Math.random() * 20,
      };
    }

    function tickHyper() {
      const { w, h } = hyperState;
      const cx = w / 2;
      const cy = h / 2;

      // 缓动实际速度
      hyperState.speed += (hyperState.targetSpeed - hyperState.speed) * 0.08;

      // 拖影：半透明黑色覆盖，制造尾迹
      ctx.fillStyle = "rgba(3, 6, 8, 0.28)";
      ctx.fillRect(0, 0, w, h);

      const focal = 260;

      for (let i = 0; i < hyperState.stars.length; i++) {
        const s = hyperState.stars[i];
        s.pz = s.z;
        s.z -= hyperState.speed * 8;
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

        const size = Math.max(0.4, (1 - s.z / 1000) * 2.4);
        const alpha = Math.min(1, (1 - s.z / 1000) * 1.4);

        // 拖影线（速度感）
        ctx.strokeStyle = `hsla(${s.hue}, 100%, 65%, ${alpha * 0.85})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // 星点
        ctx.fillStyle = `hsla(${s.hue}, 100%, 85%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 中心 warp 环
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
      glow.addColorStop(0, "rgba(0, 240, 255, 0.06)");
      glow.addColorStop(0.4, "rgba(0, 240, 255, 0.02)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      hyperRAF = requestAnimationFrame(tickHyper);
    }

    tickHyper();
  }

  setupHyperspace();

  // ---------- 启动日志 & 进度 ----------
  const steps = [
    { t: "$ boot --portfolio xwr", d: 220, ok: null },
    { t: "▸ init hyperspace.engine", d: 300, ok: "OK" },
    { t: "▸ align coordinates → xiongwenrui.cn", d: 360, ok: "LOCK" },
    { t: "▸ mount /system/core × visual.module", d: 320, ok: "OK" },
    { t: "▸ decrypt profile.identity (xwr)", d: 360, ok: "AUTH" },
    { t: "▸ load hero.stream × bgm.channel", d: 300, ok: "OK" },
    { t: "▸ warp handshake // designer → visitor", d: 380, ok: "READY" },
    { t: "$ jump.sequence engaged", d: 260, ok: null },
  ];

  function tick() {
    const d = new Date();
    if (timeEl) {
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      timeEl.textContent = `${h}:${m}:${s}`;
    }
  }
  tick();
  const tickTimer = setInterval(tick, 500);

  let progress = 0;
  const total = steps.reduce((a, b) => a + b.d, 0);
  let acc = 0;

  function runStep(i) {
    if (i >= steps.length) {
      finish();
      return;
    }
    const step = steps[i];
    const line = document.createElement("div");
    line.className = "line";
    const okHtml = step.ok
      ? ` <span class="ok">[${step.ok}]</span>`
      : "";
    line.innerHTML = `<span class="prefix">›</span>${escapeHtml(step.t)}${okHtml}`;
    logEl.appendChild(line);
    while (logEl.children.length > 6) logEl.removeChild(logEl.firstChild);

    // 每一步略微提升飞行速度
    hyperState.targetSpeed = 1.6 + i * 0.35;

    const target = Math.floor(((acc + step.d) / total) * 100);
    const start = progress;
    const startTs = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - startTs) / step.d);
      progress = Math.round(start + (target - start) * p);
      if (fillEl) fillEl.style.width = progress + "%";
      if (textEl) textEl.textContent = progress;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    acc += step.d;
    setTimeout(() => runStep(i + 1), step.d);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function finish() {
    progress = 100;
    if (fillEl) fillEl.style.width = "100%";
    if (textEl) textEl.textContent = 100;
    if (enterEl) enterEl.classList.add("show");
    // 待机时保持较快穿梭
    hyperState.targetSpeed = 3.0;

    const enter = () => {
      // WARP JUMP：极速加速 + 亮闪 + 缩放淡出
      hyperState.targetSpeed = 22;
      loader.classList.add("warping");
      document.body.classList.add("booted");
      setTimeout(() => loader.classList.add("hide"), 550);
      setTimeout(() => {
        cancelAnimationFrame(hyperRAF);
        loader.remove();
        clearInterval(tickTimer);
      }, 1300);
    };

    if (enterBtn) enterBtn.addEventListener("click", enter, { once: true });
    const anyKey = (ev) => {
      enter();
      document.removeEventListener("keydown", anyKey);
      document.removeEventListener("click", clickAnywhere);
    };
    const clickAnywhere = (ev) => {
      if (ev.target.closest(".boot-loader")) return;
      enter();
      document.removeEventListener("keydown", anyKey);
      document.removeEventListener("click", clickAnywhere);
    };
    document.addEventListener("keydown", anyKey);
    document.addEventListener("click", clickAnywhere);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.body.classList.contains("booted")) {
      progress = 100;
      finish();
    }
  });

  runStep(0);
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
