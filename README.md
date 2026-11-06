# webpack-starter

Szablon: Webpack 5 + Babel (preset-env + core-js) + SASS + PostCSS/Autoprefixer.

## Uruchomienie

```bash
npm install
npm start          # serwer developerski z live reload
npm run build      # produkcyjna paczka w folderze dist/
```

## Zgodność z przeglądarkami

Lista wspieranych przeglądarek jest w `package.json` w polu `browserslist`.
Korzystają z niej jednocześnie Babel (składnia + polyfille) i Autoprefixer (prefiksy CSS).

Podgląd, co obejmuje lista: `npx browserslist`

## Struktura

```
src/
  index.html        szablon HTML (skrypty i style wstawia Webpack)
  index.js          punkt wejścia
  styles/main.scss  style
webpack.config.js
babel.config.json
postcss.config.js
```

## Paralaksa w headerze

Lampy z obrazka są osobnymi warstwami (`src/images/lamp-*.webp`) nad tłem bez lamp
(`src/images/bg-scene.jpg`) i poruszają się za kursorem myszy nad headerem.

- Siłę ruchu każdej warstwy ustawia atrybut `data-depth` w `src/index.html`
  (dodatni = podąża za kursorem, ujemny = ruch w przeciwną stronę), a obrót `data-rotate`.
- Płynność i kierunek: stałe na górze `src/js/hero-parallax.js`.
- Efekt jest wyłączony na ekranach dotykowych i przy włączonym "ogranicz ruch" w systemie.
- `src/images/bg.jpg` to oryginał (źródło warstw), strona go już nie używa.
