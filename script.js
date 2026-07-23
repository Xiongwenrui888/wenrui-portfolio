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

// 8. 控制台招呼
console.log(
  "%c XIONG WENRUI %c AIGC DESIGNER ",
  "background:#00f0ff;color:#0a0a0a;padding:6px 12px;font-weight:bold;",
  "background:#0a0a0a;color:#00f0ff;padding:6px 12px;border:1px solid #00f0ff;"
);
console.log(
  "%c有项目合作？→ 616917632@qq.com",
  "color:#888;font-family:monospace;"
);
