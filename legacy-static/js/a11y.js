/* =========================================================
   California Law — Accessibility menu
   Self-contained widget: injects a floating button + panel,
   applies user preferences, and remembers them (localStorage).
   ========================================================= */
(function () {
  "use strict";

  var KEY = "wsl-a11y";
  var TEXT_STEPS = ["100%", "112.5%", "125%", "137.5%"];
  var TOGGLES = ["contrast", "links", "readable", "motion", "cursor"];

  var state = { text: 0, contrast: false, links: false, readable: false, motion: false, cursor: false };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === "object") {
      for (var k in state) { if (k in saved) state[k] = saved[k]; }
    }
  } catch (e) {}

  function apply() {
    var h = document.documentElement;
    h.style.fontSize = TEXT_STEPS[state.text] || "100%";
    h.classList.toggle("a11y-contrast", !!state.contrast);
    h.classList.toggle("a11y-links", !!state.links);
    h.classList.toggle("a11y-readable", !!state.readable);
    h.classList.toggle("a11y-no-motion", !!state.motion);
    h.classList.toggle("a11y-cursor", !!state.cursor);
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // apply saved prefs as early as possible
  apply();

  var fab, panel, levelEl, isOpen = false;

  function syncUI() {
    if (!panel) return;
    levelEl.textContent = state.text;
    TOGGLES.forEach(function (t) {
      var btn = panel.querySelector('[data-a11y="' + t + '"]');
      if (btn) btn.setAttribute("aria-pressed", state[t] ? "true" : "false");
    });
  }

  function openPanel() {
    panel.hidden = false;
    isOpen = true;
    fab.setAttribute("aria-expanded", "true");
    var first = panel.querySelector("button");
    if (first) first.focus();
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onOutside, true);
  }

  function closePanel(returnFocus) {
    panel.hidden = true;
    isOpen = false;
    fab.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onOutside, true);
    if (returnFocus) fab.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closePanel(true); }
  }

  function onOutside(e) {
    if (isOpen && !panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
      closePanel(false);
    }
  }

  function handle(action) {
    switch (action) {
      case "text-inc": state.text = Math.min(TEXT_STEPS.length - 1, state.text + 1); break;
      case "text-dec": state.text = Math.max(0, state.text - 1); break;
      case "reset":
        state = { text: 0, contrast: false, links: false, readable: false, motion: false, cursor: false };
        break;
      default:
        if (TOGGLES.indexOf(action) !== -1) state[action] = !state[action];
    }
    apply(); save(); syncUI();
  }

  function build() {
    fab = document.createElement("button");
    fab.type = "button";
    fab.className = "a11y__fab";
    fab.setAttribute("aria-label", "Accessibility menu");
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "a11y-panel");
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="3.6" r="2.1" fill="currentColor"/>' +
      '<path d="M12 7c-2.1 0-5.2 1-7.2 1l.3 2c1.6 0 3.2-.4 4.3-.7V13l-2.6 7.1 1.9.7L11.9 15l3.3 5.9 1.9-.7L14.6 13V9.3c1.1.3 2.7.7 4.3.7l.3-2c-2 0-5.1-1-7.2-1z" fill="currentColor"/>' +
      "</svg>";

    panel = document.createElement("div");
    panel.className = "a11y__panel";
    panel.id = "a11y-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Accessibility settings");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="a11y__head">' +
        '<h2 class="a11y__title">Accessibility</h2>' +
        '<button type="button" class="a11y__close" aria-label="Close accessibility menu">&times;</button>' +
      "</div>" +
      '<div class="a11y__row">' +
        '<span class="a11y__lbl">Text size</span>' +
        '<span class="a11y__stepper">' +
          '<button type="button" data-a11y="text-dec" aria-label="Decrease text size">A&minus;</button>' +
          '<span class="a11y__level" aria-live="polite">0</span>' +
          '<button type="button" data-a11y="text-inc" aria-label="Increase text size">A+</button>' +
        "</span>" +
      "</div>" +
      '<div class="a11y__grid">' +
        '<button type="button" class="a11y__opt" data-a11y="contrast" aria-pressed="false">High contrast</button>' +
        '<button type="button" class="a11y__opt" data-a11y="links" aria-pressed="false">Highlight links</button>' +
        '<button type="button" class="a11y__opt" data-a11y="readable" aria-pressed="false">Readable font</button>' +
        '<button type="button" class="a11y__opt" data-a11y="motion" aria-pressed="false">Pause motion</button>' +
        '<button type="button" class="a11y__opt" data-a11y="cursor" aria-pressed="false">Big cursor</button>' +
      "</div>" +
      '<button type="button" class="a11y__reset" data-a11y="reset">Reset all settings</button>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    levelEl = panel.querySelector(".a11y__level");

    fab.addEventListener("click", function () { isOpen ? closePanel(false) : openPanel(); });
    panel.querySelector(".a11y__close").addEventListener("click", function () { closePanel(true); });
    panel.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-a11y]");
      if (btn) handle(btn.getAttribute("data-a11y"));
    });

    syncUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
