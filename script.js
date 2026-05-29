import { createDraggable, animate } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

const box = document.getElementById("box");
const nav = document.querySelector("nav");
const slots = document.querySelectorAll("#navLinks li");
const pages = document.querySelectorAll(".page");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLinks = mobileMenu.querySelectorAll("a");

let currentPage = document.querySelector(".page.active");
let originX = 0;
let originY = 0;
let resizeAnim = null;
let draggable;

// Transition de page
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
      animate(next, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 400,
        ease: "outExpo"
      });
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

// Burger mobile
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

// Draggable desktop
function getSlotData() {
  const navR = nav.getBoundingClientRect();
  return Array.from(slots).map(slot => {
    const a = slot.querySelector("a");
    const r = a.getBoundingClientRect();
    const absX = r.left - navR.left;
    const absY = r.top - navR.top;
    return {
      x: absX - originX,
      y: absY - originY,
      w: r.width,
      h: r.height,
      slot
    };
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

window.addEventListener("load", () => {
  // Animation entrée page accueil
  currentPage.style.display = "flex";
  animate(currentPage, { opacity: [0, 1], translateY: [20, 0], duration: 600, ease: "outExpo" });

  // Init box sur premier lien
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
    onGrab() {
      if (resizeAnim) resizeAnim.cancel();
    },
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
});