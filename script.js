// ============================================
// XIONG WENRUI PORTFOLIO - Interactions
// ============================================

// 0. 赛博开场引导序列
(function bootSequence() {
  const loader = document.getElementById("bootLoader");
  if (!loader) return;

  const logEl = document.getElementById("bootLog");
  const fillEl = document.getElementById("bootProgressFill");
  const textEl = document.getElementById("bootProgressText");
  const enterEl = document.getElementById("bootEnter");
  const enterBtn = document.getElementById("bootEnterBtn");
  const timeEl = document.getElementById("bootTime");

  const steps = [
    { t: "$ boot --portfolio xwr", d: 250, ok: null },
    { t: "▸ mount /system/core", d: 350, ok: "OK" },
    { t: "▸ link //xiongwenrui.cn ← wenrui-portfolio.git", d: 420, ok: "SYNC" },
    { t: "▸ load hero.stream (h264, loop)", d: 320, ok: "OK" },
    { t: "▸ decrypt profile.identity", d: 380, ok: "AUTH" },
    { t: "▸ init motion.grid × cyber.mesh", d: 300, ok: "OK" },
    { t: "▸ handshake · designer//xwr → visitor", d: 400, ok: "READY" },
    { t: "$ system.uplink complete", d: 260, ok: null },
  ];

  const startTime = Date.now();
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
    // 保持日志高度：只保留最近 6 行
    while (logEl.children.length > 6) logEl.removeChild(logEl.firstChild);

    // 平滑推进进度条
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

    const enter = () => {
      document.body.classList.add("booted");
      setTimeout(() => loader.classList.add("hide"), 100);
      setTimeout(() => {
        loader.remove();
        clearInterval(tickTimer);
      }, 1000);
      // 首次进入时把开关做个引导：暂不自动播放音乐，由用户点右下角
    };

    if (enterBtn) enterBtn.addEventListener("click", enter, { once: true });
    const anyKey = (ev) => {
      enter();
      document.removeEventListener("keydown", anyKey);
      document.removeEventListener("click", clickAnywhere);
    };
    const clickAnywhere = (ev) => {
      if (ev.target.closest(".boot-loader")) return; // 让按钮自然走
      enter();
      document.removeEventListener("keydown", anyKey);
      document.removeEventListener("click", clickAnywhere);
    };
    document.addEventListener("keydown", anyKey);
    document.addEventListener("click", clickAnywhere);
  }

  // 允许用户按 Esc 快速跳过
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.body.classList.contains("booted")) {
      progress = 100;
      finish();
    }
  });

  // kick off
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
