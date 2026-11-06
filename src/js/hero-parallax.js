// ==========================================================================
// Paralaksa w headerze: warstwy ([data-depth]) przesuwają się za kursorem.
//
// data-depth   - maksymalne przesunięcie w px przy kursorze na skraju headera
//                (wartość dodatnia = warstwa podąża za kursorem,
//                 ujemna = porusza się w przeciwną stronę)
// data-rotate  - opcjonalny maksymalny obrót w stopniach
// ==========================================================================

const FOLLOW = 0.07; // 0-1: im mniej, tym bardziej "leniwy" i płynny ruch
const VERTICAL_RATIO = 0.6; // ruch w pionie jako ułamek ruchu w poziomie

export function initHeroParallax(headerSelector = ".header-b") {
  const header = document.querySelector(headerSelector);
  if (!header) return;

  // Bez efektu dla osób z włączonym "ogranicz ruch" oraz na ekranach dotykowych
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (reduceMotion.matches || !canHover.matches) return;

  const layers = [...header.querySelectorAll("[data-depth]")].map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth) || 0,
    rotate: parseFloat(el.dataset.rotate) || 0,
  }));
  if (!layers.length) return;

  // target = gdzie jest kursor (-1..1), current = gdzie aktualnie są warstwy
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let frame = null;

  const render = () => {
    current.x += (target.x - current.x) * FOLLOW;
    current.y += (target.y - current.y) * FOLLOW;

    for (const { el, depth, rotate } of layers) {
      const x = (current.x * depth).toFixed(2);
      const y = (current.y * depth * VERTICAL_RATIO).toFixed(2);
      const r = (current.x * rotate).toFixed(3);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
    }

    // Zatrzymaj pętlę, gdy wszystko "dojechało" - nie obciążamy procesora w bezruchu
    const settled =
      Math.abs(target.x - current.x) < 0.001 &&
      Math.abs(target.y - current.y) < 0.001;
    frame = settled ? null : requestAnimationFrame(render);
  };

  const start = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  header.addEventListener("pointermove", (e) => {
    const rect = header.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    target.x = Math.max(-1, Math.min(1, nx));
    target.y = Math.max(-1, Math.min(1, ny));
    start();
  });

  // Gdy kursor opuszcza header, lampy wracają na swoje miejsce
  header.addEventListener("pointerleave", () => {
    target.x = 0;
    target.y = 0;
    start();
  });
}
