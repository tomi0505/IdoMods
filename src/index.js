import "./styles/main.scss";
import * as bootstrap from "bootstrap";
import { initHeroParallax } from "./js/hero-parallax";
import { initMagicShader } from "./js/magic-shader";

document.addEventListener("DOMContentLoaded", () => {
  initHeroParallax();
  initMagicShader();

  const menuCollapse = document.getElementById("site-nav-menu");
  const siteNav = document.querySelector(".site-nav");

  if (menuCollapse && siteNav) {
    // Gdy menu mobilne zaczyna się rozwijać
    menuCollapse.addEventListener("show.bs.collapse", () => {
      siteNav.classList.add("nav-active");
    });

    // Gdy menu mobilne zaczyna się zwijać
    menuCollapse.addEventListener("hide.bs.collapse", () => {
      siteNav.classList.remove("nav-active");
    });
  }
});
