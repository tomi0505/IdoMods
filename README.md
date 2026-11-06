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
