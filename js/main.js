/* California Law — interactions */
(function () {
  "use strict";

  /* mark JS active so reveal-on-scroll styling applies (content stays visible without JS) */
  document.documentElement.classList.add("js");

  /* ---- mobile nav toggle ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---- sticky header shadow ---- */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- testimonials slider ---- */
  document.querySelectorAll(".tslider").forEach(function (slider) {
    var slides = slider.querySelectorAll(".tslide");
    var dotsWrap = slider.querySelector(".tdots");
    if (!slides.length) return;
    var i = 0, timer;

    if (dotsWrap) {
      slides.forEach(function (_, idx) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Show testimonial " + (idx + 1));
        if (idx === 0) b.classList.add("active");
        b.addEventListener("click", function () { go(idx); reset(); });
        dotsWrap.appendChild(b);
      });
    }
    var dots = dotsWrap ? dotsWrap.querySelectorAll("button") : [];

    function go(n) {
      slides[i].classList.remove("active");
      if (dots[i]) dots[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active");
      if (dots[i]) dots[i].classList.add("active");
    }
    function next() { go(i + 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, 6000); }
    reset();
  });

  /* ---- scroll reveal ---- */
  var revs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revs.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revs.forEach(function (el) { io.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- form validation (client-side demo) ---- */
  function validate(form) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (input) {
      var field = input.closest(".field");
      var valid = true;
      var val = (input.value || "").trim();
      if (!val) valid = false;
      if (valid && input.type === "email") {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }
      if (valid && input.type === "tel") {
        valid = (val.replace(/\D/g, "").length >= 7);
      }
      if (field) field.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      var success = form.querySelector(".form-success");
      var error = form.querySelector(".form-error");
      var submitBtn = form.querySelector('button[type="submit"]');
      var origLabel = submitBtn ? submitBtn.innerHTML : "";
      if (error) error.classList.remove("show");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "Sending&hellip;"; }

      // Submit to Netlify Forms (URL-encoded POST to the site root).
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.querySelectorAll("input, select, textarea, button").forEach(function (el) { el.disabled = true; });
          if (success) {
            success.classList.add("show");
            success.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origLabel; }
          if (error) {
            error.classList.add("show");
            error.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
    });
    // clear error as the user types
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        var f = el.closest(".field");
        if (f) f.classList.remove("invalid");
      });
    });
  });

  /* ---- footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
