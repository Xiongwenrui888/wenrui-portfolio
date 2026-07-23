// ============================================
// XIONG WENRUI PORTFOLIO - Interactions
// ============================================

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
