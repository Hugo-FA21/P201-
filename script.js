import { createDraggable, animate } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

animate('.card', {
  translateY: [-50, 0],
  opacity: [0, 1],
  duration: 1000,
  delay: (el, i) => i * 200
});

const box = document.querySelector("#box");
const navLinks = document.querySelectorAll("nav ul li a");

function getSnapPositions() {
  return Array.from(navLinks).map(link => {
    const rect = link.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - box.offsetWidth / 2,
      y: rect.top + rect.height / 2 - box.offsetHeight / 2
    };
  });
}

createDraggable(box, {
  x: { snap: () => getSnapPositions().map(p => p.x) },
  y: { snap: () => getSnapPositions().map(p => p.y) },
  release: {
    duration: 600,
    ease: "outElastic"
  },
  onRelease() {
    const positions = getSnapPositions();
    const boxRect = box.getBoundingClientRect();

    // Trouve quel lien est le plus proche
    const closest = positions.reduce((best, pos, i) => {
      const dist = Math.hypot(boxRect.left - pos.x, boxRect.top - pos.y);
      return dist < best.dist ? { dist, i } : best;
    }, { dist: Infinity, i: -1 });

    if (closest.i >= 0) {
      navLinks.forEach(l => l.classList.remove("active"));
      navLinks[closest.i].classList.add("active");
    }
  }
});