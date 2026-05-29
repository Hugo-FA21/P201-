import { createDraggable, animate } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

// Animation d'entrée des cards
animate('.card', {
  translateY: [-50, 0],
  opacity: [0, 1],
  duration: 1000,
  delay: (el, i) => i * 200
});

const box = document.querySelector("#box");
const navLinks = document.querySelectorAll("nav ul li a");

// Zones de drop = les liens nav
const dropZones = Array.from(navLinks).map(link => ({
  el: link,
  rect: link.getBoundingClientRect()
}));

function getHoveredZone() {
  const boxRect = box.getBoundingClientRect();
  const boxCX = boxRect.left + boxRect.width / 2;
  const boxCY = boxRect.top + boxRect.height / 2;

  return dropZones.find(({ rect }) => {
    return (
      boxCX >= rect.left &&
      boxCX <= rect.right &&
      boxCY >= rect.top &&
      boxCY <= rect.bottom
    );
  });
}

createDraggable(box, {
  release: {
    duration: 600,
    ease: "outElastic"
  },
  onRelease() {
    // Recalcule les rects (au cas où la page aurait scrollé)
    dropZones.forEach(zone => {
      zone.rect = zone.el.getBoundingClientRect();
    });

    const hit = getHoveredZone();

    if (hit) {
      const rect = hit.rect;

      // Centre la box sur le lien
      const targetX = rect.left + rect.width / 2 - box.offsetWidth / 2;
      const targetY = rect.top + rect.height / 2 - box.offsetHeight / 2 + window.scrollY;

      animate(box, {
        left: targetX,
        top: targetY,
        duration: 400,
        ease: "outExpo"
      });

      // Active le lien visuellement
      navLinks.forEach(l => l.classList.remove("active"));
      hit.el.classList.add("active");

      // Scroll vers la section
      const target = hit.el.getAttribute("href");
      if (target && target !== "#") {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
});