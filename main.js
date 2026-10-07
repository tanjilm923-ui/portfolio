/* ═══════════════════════════════════════════════════════════
   Tanjel Mahamud — Portfolio interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─────────── Footer year ─────────── */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────── Preloader ─────────── */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", hidePreloader);
    setTimeout(hidePreloader, 1800); /* safety fallback */
  }
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("is-hidden");
    document.body.style.overflow = "";
  }
  document.body.style.overflow = "hidden"; /* lock scroll while loading */

  /* ─────────── Navbar: scroll state ─────────── */
  const nav = document.getElementById("topnav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ─────────── Mobile menu ─────────── */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest(".nav__link")) {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ─────────── Scroll spy ─────────── */
  const navLinkEls = Array.from(document.querySelectorAll(".nav__link"));
  const sections = navLinkEls
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          navLinkEls.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ─────────── Reveal on scroll ─────────── */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i % 4, 3) * 90}ms`);
      revealObserver.observe(el);
    });
  }

  /* ─────────── Skill bars (animate only when visible) ─────────── */
  const skillBars = document.querySelectorAll(".skill__bar i");
  /* CSS animates via --level width; we re-trigger on reveal */
  if (!prefersReduced && "IntersectionObserver" in window) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const level = el.style.getPropertyValue("--level") || "0%";
            el.style.transition = "none";
            el.style.width = "0%";
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                el.style.transition = "";
                el.style.width = level;
              });
            });
            barObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillBars.forEach((el) => el.style.width = "0%");
    skillBars.forEach((el) => barObserver.observe(el));
  }

  /* ─────────── Hero particle canvas ─────────── */
  const canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let w = 0, h = 0, raf = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      const count = Math.min(Math.floor((w * h) / 22000), 70);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.35 + 0.1,
        gold: Math.random() > 0.75
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(217, 165, 82, ${p.a})`
          : `rgba(233, 236, 242, ${p.a * 0.7})`;
        ctx.fill();
        /* links */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(217, 165, 82, ${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });
  }

  /* ─────────── Hero typewriter ─────────── */
  const typeEl = document.getElementById("typeWriter");
  if (typeEl) {
    const HTML_SAFE = ["Textile Engineer", "Senior Apparel Merchandiser", "Woven & Knit Specialist"];
    let ti = 0, ci = 0, deleting = false;
    const speed = 70, erase = 35, hold = 1600;

    function type() {
      const word = HTML_SAFE[ti];
      typeEl.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) {
        ci++;
        setTimeout(type, speed);
      } else if (!deleting) {
        deleting = true;
        setTimeout(type, hold);
      } else if (ci > 0) {
        ci--;
        setTimeout(type, erase);
      } else {
        deleting = false;
        ti = (ti + 1) % HTML_SAFE.length;
        setTimeout(type, 350);
      }
    }
    setTimeout(type, prefersReduced ? 0 : 500);
  }

  /* ─────────── Contact form → email client ─────────── */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cName");
      const email = document.getElementById("cEmail");
      const msg = document.getElementById("cMsg");
      let valid = true;

      [name, email, msg].forEach((el) => el.classList.remove("has-error"));
      if (!name.value.trim()) { name.classList.add("has-error"); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add("has-error"); valid = false;
      }
      if (!msg.value.trim()) { msg.classList.add("has-error"); valid = false; }

      if (!valid) return;

      const subject = encodeURIComponent(`Portfolio inquiry from ${name.value.trim()}`);
      const body = encodeURIComponent(
        `Hello Tanjel,\n\n${msg.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`
      );
      window.location.href = `mailto:tanjelmahamud@gmail.com?subject=${subject}&body=${body}`;
    });
  }
})();