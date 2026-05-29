import { createDraggable } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

document.addEventListener("DOMContentLoaded", () => {
  anime({
    targets: '.card',
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: 1000,
    delay: anime.stagger(200)
  });
});

const box = document.querySelector("#box");

createDraggable(box, {
  release: {
    duration: 600,
    ease: "outElastic"
  }
});