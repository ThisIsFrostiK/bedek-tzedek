/* =========================================================
   בדק צדק – Site behaviour
   Loaded in <head>: the theme is applied immediately (no flash),
   everything else runs once the page has loaded.
   ========================================================= */

/* ---------- Theme: apply before first paint ---------- */
(function applyInitialTheme() {
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* storage unavailable */ }
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-bs-theme", saved || (prefersDark ? "dark" : "light"));
})();

document.addEventListener("DOMContentLoaded", function () {
  var root = document.documentElement;
  var desktopQuery = window.matchMedia("(min-width: 992px)");

  /* ---------- Theme switch ---------- */
  var switches = document.querySelectorAll("[data-theme-toggle]");
  var labels = document.querySelectorAll("[data-theme-label]");

  function syncThemeUI() {
    var isDark = root.getAttribute("data-bs-theme") === "dark";
    switches.forEach(function (btn) { btn.setAttribute("aria-checked", String(isDark)); });
    labels.forEach(function (el) { el.textContent = isDark ? "מצב כהה" : "מצב בהיר"; });
  }

  switches.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-bs-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
      syncThemeUI();
    });
  });
  syncThemeUI();

  /* ---------- Side navigation: sliding indicator ---------- */
  var nav = document.getElementById("sideNav");
  var indicator = nav.querySelector(".side-nav__indicator");
  var links = Array.prototype.slice.call(nav.querySelectorAll(".nav-link"));

  function moveIndicator() {
    var active = nav.querySelector(".nav-link.active") || links[0];
    if (!active || !active.offsetHeight) return;
    indicator.style.transform = "translateY(" + active.offsetTop + "px)";
    indicator.style.height = active.offsetHeight + "px";
  }

  // Bootstrap ScrollSpy fires this whenever the active section changes
  document.body.addEventListener("activate.bs.scrollspy", moveIndicator);
  window.addEventListener("resize", moveIndicator);
  window.addEventListener("load", moveIndicator);
  moveIndicator();

  /* ---------- Side navigation: mobile drawer ---------- */
  var sidebarEl = document.getElementById("sidebar");
  sidebarEl.addEventListener("shown.bs.offcanvas", moveIndicator);

  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      // On mobile: close the drawer first, then scroll to the section
      if (desktopQuery.matches || !sidebarEl.classList.contains("show")) return;
      e.preventDefault();
      var target = document.querySelector(link.getAttribute("href"));
      sidebarEl.addEventListener("hidden.bs.offcanvas", function () {
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", link.getAttribute("href"));
      }, { once: true });
      bootstrap.Offcanvas.getOrCreateInstance(sidebarEl).hide();
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Contact form (Bootstrap validation) ---------- */
  var form = document.getElementById("contactForm");
  var submitBtn = document.getElementById("submitBtn");
  var spinner = submitBtn.querySelector(".spinner-border");
  var btnText = submitBtn.querySelector(".btn-text");
  var success = document.getElementById("formSuccess");

  // Re-check a field as soon as the visitor fixes it
  form.addEventListener("input", function (e) {
    if (form.classList.contains("was-validated")) e.target.checkValidity();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.classList.add("d-none");

    // Trim so that spaces alone don't pass as a name / description
    ["name", "message"].forEach(function (id) {
      var el = document.getElementById(id);
      el.value = el.value.trim();
    });

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      var firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    spinner.classList.remove("d-none");
    btnText.textContent = "שולח...";

    // Placeholder: replace this timeout with a real request (fetch to your backend / form service).
    setTimeout(function () {
      submitBtn.disabled = false;
      spinner.classList.add("d-none");
      btnText.textContent = "שליחת פנייה";
      form.reset();
      form.classList.remove("was-validated");
      success.classList.remove("d-none");
    }, 1200);
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
