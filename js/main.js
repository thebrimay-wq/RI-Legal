/* RI Legal — progressive enhancement only. The page works without this file. */
(function () {
  "use strict";

  /* ---------- Current year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  var mobile = window.matchMedia("(max-width: 900px)");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.hidden = !open;
  }

  function syncNav() {
    if (!nav) return;
    if (mobile.matches) setNav(false);
    else { nav.hidden = false; if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  }

  syncNav();
  mobile.addEventListener("change", syncNav);

  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
  }

  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && mobile.matches) setNav(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobile.matches && toggle &&
        toggle.getAttribute("aria-expanded") === "true") {
      setNav(false);
      toggle.focus();
    }
  });

  /* ---------- Active section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          var on = l.getAttribute("href") === "#" + entry.target.id;
          if (on) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (still || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.setAttribute("data-revealed", "true");
    });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var delay = Math.min(i, 5) * 45;
        setTimeout(function () {
          entry.target.setAttribute("data-revealed", "true");
        }, delay);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- Consultation form ---------- */
  var form = document.getElementById("consultForm");
  if (!form) return;

  var submitBtn = document.getElementById("submitBtn");
  var status = document.getElementById("formStatus");
  var statusText = document.getElementById("formStatusText");
  var fields = Array.prototype.slice.call(form.querySelectorAll("[required]"));

  function wrapperOf(el) { return el.closest(".field"); }

  function validate(el) {
    var wrap = wrapperOf(el);
    if (!wrap) return true;
    var ok = el.checkValidity();
    wrap.setAttribute("data-invalid", ok ? "false" : "true");
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  // Validate on blur, not on keystroke. Once a field is marked bad, correct it live.
  fields.forEach(function (el) {
    el.addEventListener("blur", function () { validate(el); });
    el.addEventListener("input", function () {
      var wrap = wrapperOf(el);
      if (wrap && wrap.getAttribute("data-invalid") === "true") validate(el);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var bad = fields.filter(function (el) { return !validate(el); });
    if (bad.length) {
      bad[0].focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    // No backend yet. Swap this for your form endpoint (Formspree, Netlify, etc.).
    setTimeout(function () {
      form.reset();
      fields.forEach(function (el) {
        var wrap = wrapperOf(el);
        if (wrap) wrap.setAttribute("data-invalid", "false");
        el.removeAttribute("aria-invalid");
      });
      submitBtn.disabled = false;
      submitBtn.textContent = "Request a Consultation";
      statusText.textContent =
        "Thank you. Your request is in. We will reply within one business day.";
      status.setAttribute("data-visible", "true");
      status.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
    }, 700);
  });
})();
