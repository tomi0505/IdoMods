// ==========================================================================
// Tło sekcji .magic-b: shader WebGL (żółto-czarne, falujące smugi).
//
// Pętla jest idealnie szczelna: czas to kąt na okręgu (0..2π), a szum
// próbkujemy po okręgu w przestrzeni szumu, więc klatka 0 === klatka końcowa.
// Nie ma GIF-a/wideo, więc nie ma też "zacięcia" na końcu pętli.
// ==========================================================================

const LOOP_SECONDS = 24; // jeden pełny cykl (zakres z wytycznych: 20-30 s)
const MAX_DPR = 1.5; // ogranicza koszt na ekranach retina
const RENDER_SCALE = 0.5; // tło jest rozmyte, więc liczymy w połowie rozdzielczości

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uAngle; // 0..2π - faza pętli

const vec3 BLACK  = vec3(0.063, 0.063, 0.067); // #101011
const vec3 DEEP   = vec3(0.45, 0.33, 0.08);
const vec3 YELLOW = vec3(0.949, 0.761, 0.188); // #f2c230

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
// Szum "zapętlony": offset porusza się po okręgu, więc po 2π wraca do punktu wyjścia
float loopNoise(vec2 p, float a, float phase) {
  vec2 o = vec2(cos(a + phase), sin(a + phase)) * 0.9;
  return noise(p + o);
}
float fbm(vec2 p, float a) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * loopNoise(p, a, float(i) * 1.7);
    p = p * 2.0 + 7.3;
    amp *= 0.5;
  }
  return v;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);

  // Delikatne, wolne zniekształcenie współrzędnych (ruch falujący)
  vec2 warp = vec2(fbm(p * 1.3, uAngle), fbm(p * 1.3 + 9.1, uAngle)) - 0.5;
  vec2 q = p + warp * 0.22;

  // Ukośne smugi "\\" - współrzędna w poprzek smug + falowanie w czasie (całkowita liczba okresów)
  float across = q.x * 0.9 + q.y * 1.15;
  float bands = sin(across * 7.6 + sin(uAngle) * 1.3)
              + 0.35 * sin(across * 3.4 - cos(uAngle) * 0.9 + q.x * 1.5);
  bands = smoothstep(-0.55, 0.85, bands);

  // Żółć narasta ku dołowi i prawej stronie, góra zostaje czarna
  float base = smoothstep(0.75, 0.05, vUv.y + (1.0 - vUv.x) * 0.1);
  float swell = 0.85 + 0.15 * sin(uAngle + q.x * 2.0);
  float light = clamp(base * (0.06 + 1.1 * bands) * swell, 0.0, 1.0);

  vec3 col = mix(BLACK, DEEP, smoothstep(0.0, 0.55, light));
  col = mix(col, YELLOW, smoothstep(0.35, 1.0, light));

  // Minimalne ziarno, żeby gradient nie "bandował" na 8-bitowym ekranie
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export function initMagicShader(sectionSelector = ".magic-b") {
  const section = document.querySelector(sectionSelector);
  const canvas = section?.querySelector(".magic-b__canvas");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return; // zostaje statyczne tło z CSS

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uAngle = gl.getUniformLocation(prog, "uAngle");

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE;
    const w = Math.max(1, Math.round(section.clientWidth * dpr));
    const h = Math.max(1, Math.round(section.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const draw = (angle) => {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uAngle, angle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = null;
  let visible = true;
  let t0 = null;
  let offset = 0; // ciągłość po pauzie (bez skoku animacji)
  let lastAngle = 0;

  const frame = (now) => {
    if (t0 === null) t0 = now;
    lastAngle = (((now - t0) / 1000 + offset) / LOOP_SECONDS) * Math.PI * 2;
    draw(lastAngle);
    raf = requestAnimationFrame(frame);
  };
  const play = () => {
    if (raf === null && visible && !document.hidden && !reduceMotion.matches) {
      t0 = null;
      offset = (lastAngle / (Math.PI * 2)) * LOOP_SECONDS;
      raf = requestAnimationFrame(frame);
    }
  };
  const pause = () => {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  };

  // Pierwsza klatka od razu; canvas przykrywa statyczne tło dopiero, gdy shader działa
  draw(0);
  canvas.classList.add("is-ready");

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? play() : pause();
  }).observe(section);
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
  window.addEventListener("resize", () => draw(lastAngle));
  reduceMotion.addEventListener?.("change", () => (reduceMotion.matches ? pause() : play()));
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    pause();
    canvas.classList.remove("is-ready");
  });

  play();
}
