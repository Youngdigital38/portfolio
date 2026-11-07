/* ==========================================================
   effects.js - animations driven by JavaScript
   1) Count-up numbers on the Home page (data-count)
   2) Typing effect for the role line on the Home page
   3) Scroll progress bar and a "back to top" button (every page)

   The code is split in two parts:
   1) Small pure functions (they only calculate, so they are easy to test)
   2) The part that talks to the page (DOM) and handles events and timers

   Change the numbers in the SETTINGS block to change the speed and timing.
   ========================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     SETTINGS - change these values to change the behaviour
     --------------------------------------------------------- */
  var COUNT_MS = 1200;      // how long the count-up takes (milliseconds)
  var TYPE_MS = 90;         // delay between typed letters
  var DELETE_MS = 45;       // delay between deleted letters
  var PAUSE_MS = 1400;      // how long a finished word stays on screen
  var SHOW_AFTER = 400;     // scroll distance (px) before the back-to-top button shows

  /* ---------------------------------------------------------
     PART 1 - Pure functions
     --------------------------------------------------------- */

  // Starts fast and slows down at the end. t and the result are between 0 and 1.
  function easeOutCubic(t) {
    var clamped = Math.min(1, Math.max(0, t));
    return 1 - Math.pow(1 - clamped, 3);
  }

  // The number to show: target = final value, progress = 0 (start) to 1 (finished)
  function countValue(target, progress) {
    return Math.round(target * easeOutCubic(progress));
  }

  // How far down the page the visitor has scrolled, as a percentage from 0 to 100
  function scrollPercent(scrollTop, scrollHeight, clientHeight) {
    var maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return 0; // page is shorter than the screen
    return Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
  }

  // One step of the typing effect.
  // state = { role: which word, chars: how many letters show, deleting: true/false }
  // Returns the next state plus "delay", the time to wait before the next step.
  function typingStep(state, roles) {
    var word = roles[state.role];

    if (!state.deleting) {
      var typed = state.chars + 1;
      if (typed >= word.length) {
        // Word is complete: keep it on screen for a moment, then start deleting
        return { role: state.role, chars: word.length, deleting: true, delay: PAUSE_MS };
      }
      return { role: state.role, chars: typed, deleting: false, delay: TYPE_MS };
    }

    var remaining = state.chars - 1;
    if (remaining <= 0) {
      // Word is gone: move on to the next word (and go back to the first after the last)
      return { role: (state.role + 1) % roles.length, chars: 0, deleting: false, delay: TYPE_MS };
    }
    return { role: state.role, chars: remaining, deleting: true, delay: DELETE_MS };
  }

  // Make the logic available for testing in Node (does nothing in the browser)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      easeOutCubic: easeOutCubic, countValue: countValue,
      scrollPercent: scrollPercent, typingStep: typingStep
    };
  }

  /* ---------------------------------------------------------
     PART 2 - The page (DOM), events and timers
     --------------------------------------------------------- */
  if (typeof document === "undefined") return;

  // Respect visitors who ask their device for less motion
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----- 1. Scroll progress bar and back-to-top button (created with JavaScript) -----
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var topButton = document.createElement("button");
  topButton.type = "button";
  topButton.className = "to-top";
  topButton.setAttribute("aria-label", "Back to top");
  topButton.textContent = "↑"; // an up arrow
  document.body.appendChild(topButton);

  var waiting = false; // true while an update is already scheduled

  function updateScroll() {
    var page = document.documentElement;
    var top = window.pageYOffset || page.scrollTop;
    bar.style.width = scrollPercent(top, page.scrollHeight, page.clientHeight) + "%";
    topButton.classList.toggle("show", top > SHOW_AFTER);
    waiting = false;
  }

  // The scroll event fires many times a second, so we only update once per frame
  window.addEventListener("scroll", function () {
    if (!waiting) {
      waiting = true;
      window.requestAnimationFrame(updateScroll);
    }
  }, { passive: true });

  topButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  updateScroll();

  // ----- 2. Count-up numbers: <strong data-count="3">3</strong> -----
  function runCount(element) {
    var target = Number(element.getAttribute("data-count"));
    var startTime = null;

    function frame(now) {
      if (startTime === null) startTime = now;
      var progress = (now - startTime) / COUNT_MS;
      element.textContent = countValue(target, progress);
      if (progress < 1) {
        window.requestAnimationFrame(frame); // ask for the next frame
      } else {
        element.textContent = target;
      }
    }
    element.textContent = "0";
    window.requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length > 0 && !reduceMotion && "IntersectionObserver" in window) {
    // Start each counter only when it scrolls into view
    var watcher = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          observer.unobserve(entry.target); // run once only
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (counter) { watcher.observe(counter); });
  }

  // ----- 3. Typing effect: <span id="typed-role" data-roles="one|two|three"> -----
  var typedElement = document.getElementById("typed-role");
  if (typedElement && !reduceMotion) {
    var roles = typedElement.getAttribute("data-roles").split("|");
    var state = { role: 0, chars: roles[0].length, deleting: true };

    var tick = function () {
      state = typingStep(state, roles);
      typedElement.textContent = roles[state.role].slice(0, state.chars);
      window.setTimeout(tick, state.delay);
    };
    window.setTimeout(tick, PAUSE_MS); // first word stays visible for a moment
  }
})();
