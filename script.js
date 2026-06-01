import { createDraggable, animate } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

const box = document.getElementById("box");
const nav = document.querySelector("nav");
const slots = document.querySelectorAll("#navLinks li");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLinks = mobileMenu.querySelectorAll("a");

let currentPage = document.querySelector(".page.active");
let originX = 0;
let originY = 0;
let resizeAnim = null;
let draggable;

function switchPage(targetId) {
  const next = document.getElementById(targetId);
  if (!next || next === currentPage) return;
  const prev = currentPage;
  animate(prev, {
    opacity: [1, 0],
    translateY: [0, -30],
    duration: 300,
    ease: "inExpo",
    onComplete() {
      prev.classList.remove("active");
      prev.style.display = "none";
      next.style.display = "flex";
      next.classList.add("active");
      animate(next, { opacity: [0, 1], translateY: [30, 0], duration: 400, ease: "outExpo" });
      const items = next.querySelectorAll(".card-item, .item, .contact-item, .tags span, .hero-content > *");
      animate(items, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: (el, i) => i * 80,
        ease: "outExpo"
      });
      currentPage = next;
    }
  });
}

// Centre le burger dans la nav
function alignBurger() {
  const headerH = document.querySelector("header").getBoundingClientRect().height;
  burger.style.top = (headerH / 2 - burger.offsetHeight / 2) + "px";
}
alignBurger();
window.addEventListener("resize", alignBurger);

burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
});

mobileLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    burger.classList.remove("open");
    mobileMenu.classList.remove("open");
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) switchPage(href.slice(1));
  });
});

// Clic sur les liens nav → déplace la box
slots.forEach(slot => {
  slot.querySelector("a").addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  slot.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    const data = getSlotData().find(p => p.slot === slot);
    if (!data || !draggable) return;
    draggable.stop();
    animate(draggable, { x: data.x, y: data.y, duration: 500, ease: "outElastic(1, .6)" });
    if (resizeAnim) resizeAnim.cancel();
    resizeAnim = animate(box, { width: data.w, height: data.h, duration: 300, ease: "outExpo" });
    activateSlot(slot);
    const href = slot.querySelector("a").getAttribute("href");
    if (href && href.startsWith("#")) switchPage(href.slice(1));
  });
});

function getSlotData() {
  const navR = nav.getBoundingClientRect();
  return Array.from(slots).map(slot => {
    const a = slot.querySelector("a");
    const r = a.getBoundingClientRect();
    const absX = r.left - navR.left;
    const absY = r.top - navR.top;
    return { x: absX - originX, y: absY - originY, w: r.width, h: r.height, slot };
  });
}

function findClosest(dx, dy) {
  let best = null, bestDist = Infinity;
  getSlotData().forEach(p => {
    const d = Math.hypot(dx - p.x, dy - p.y);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return best;
}

function activateSlot(slot) {
  slots.forEach(s => s.querySelector("a").classList.remove("active"));
  slot.querySelector("a").classList.add("active");
}

function initDraggable() {
  const navR = nav.getBoundingClientRect();
  const firstA = slots[0].querySelector("a");
  const firstR = firstA.getBoundingClientRect();
  originX = firstR.left - navR.left;
  originY = firstR.top - navR.top;
  box.style.left = originX + "px";
  box.style.top = originY + "px";
  box.style.width = firstR.width + "px";
  box.style.height = firstR.height + "px";
  activateSlot(slots[0]);

  draggable = createDraggable(box, {
    container: nav,
    release: { duration: 500, ease: "outElastic(1, .6)" },
    onGrab() { if (resizeAnim) resizeAnim.cancel(); },
    onRelease(d) {
      const hit = findClosest(d.x, d.y);
      if (!hit) return;
      draggable.stop();
      animate(draggable, { x: hit.x, y: hit.y, duration: 500, ease: "outElastic(1, .6)" });
      if (resizeAnim) resizeAnim.cancel();
      resizeAnim = animate(box, { width: hit.w, height: hit.h, duration: 300, ease: "outExpo" });
      activateSlot(hit.slot);
      const href = hit.slot.querySelector("a").getAttribute("href");
      if (href && href.startsWith("#")) switchPage(href.slice(1));
    }
  });
}

function runIntro(onDone) {
  const intro = document.getElementById("intro");
  const counter = document.getElementById("introCounter");
  const label = document.getElementById("introLabel");

  // Révèle le label
  animate(label, { opacity: [0, 1], duration: 400, ease: "outExpo" });

  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 10) + 3;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);

      // Pause à 100% puis fermeture rideau
      setTimeout(() => {
        // Le panneau monte et disparaît
        animate(intro, {
          translateY: [0, "-100%"],
          duration: 800,
          ease: "inExpo",
          onComplete() {
            intro.style.display = "none";
            onDone();
          }
        });
      }, 500);
    }
    counter.textContent = String(count).padStart(3, "0");
  }, 35);
}

window.addEventListener("load", () => {
  runIntro(() => {
    currentPage.style.display = "flex";
    animate(currentPage, { opacity: [0, 1], translateY: [20, 0], duration: 600, ease: "outExpo" });
    initDraggable();
  });
});

// Repositionne la box sur le slot actif au resize
window.addEventListener("resize", () => {
  const activeSlot = Array.from(slots).find(s => s.querySelector("a").classList.contains("active"));
  if (!activeSlot || !draggable) return;

  const navR = nav.getBoundingClientRect();
  const a = activeSlot.querySelector("a");
  const r = a.getBoundingClientRect();

  // Position absolue dans la nav, sans passer par originX/Y
  const newLeft = r.left - navR.left;
  const newTop = r.top - navR.top;

  // Met à jour originX/Y ET remet x/y du draggable à 0
  // pour que la box reparte de sa nouvelle position CSS
  originX = newLeft;
  originY = newTop;

  box.style.left = newLeft + "px";
  box.style.top = newTop + "px";
  box.style.width = r.width + "px";
  box.style.height = r.height + "px";

  draggable.stop();
  animate(draggable, { x: 0, y: 0, duration: 0 });
});