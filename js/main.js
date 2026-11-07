/* ==========================================================
   main.js - shared behaviour for every page
   - mobile navigation toggle
   - highlight the current page link
   - footer year
   - demo links on the Projects page
   ========================================================== */

(function () {
  "use strict";

  // ----- 1. Mobile navigation (hamburger) -----
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-links");

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close the menu after choosing a link, or when Escape is pressed
    menu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    // Close if the screen grows back to desktop size
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) setMenu(false);
    });
  }

  // ----- 2. Highlight the active link (fallback if aria-current is missing) -----
  var current = window.location.pathname.split("/").pop() || "index.html";
  var links = document.querySelectorAll("#nav-links a");
  links.forEach(function (link) {
    var target = link.getAttribute("href");
    if (target === current) link.setAttribute("aria-current", "page");
  });

  // ----- 3. Demo links (Projects page) -----
  // These buttons are placeholders. Instead of jumping to the top of the page,
  // they show a short note inside their own project card.
  document.querySelectorAll("a[data-simulated]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var note = link.closest(".project-body").querySelector(".sim-note");
      if (note) note.hidden = false;
    });
  });

  // ----- 4. Footer year (dynamic content update) -----
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
