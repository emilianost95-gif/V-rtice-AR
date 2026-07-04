/* ============================================================
   VÉRTICE — script.js
   Módulos IIFE independientes. Un solo punto de configuración.
   ============================================================ */

'use strict';

/* ---------- CONFIGURACIÓN GLOBAL ---------- */
const CONFIG = {
  WHATSAPP_NUMBER: '56955555555',          // ← cambiar aquí para todo el sitio
  REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  Navbar.init();
  MobileMenu.init();
  Particles.init();
  Animations.init();
  Counters.init();
  ProjectFilter.init();
  Lightbox.init();
  Testimonials.init();
  Tilt.init();
  Magnetic.init();
  QuoteForm.init();
  Floating.init();
});

/* ============================================================
   NAVBAR — estado sticky con cambio al hacer scroll
   ============================================================ */
const Navbar = (() => {
  function init() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  return { init };
})();

/* ============================================================
   MENÚ MÓVIL — hamburguesa con animación clip-path
   ============================================================ */
const MobileMenu = (() => {
  function init() {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;

    const toggle = (open) => {
      burger.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));

    // Cerrar al elegir un enlace
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => toggle(false))
    );

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle(false);
    });
  }
  return { init };
})();

/* ============================================================
   PARTICLES — polvo de obra ámbar, muy sutil (canvas)
   ============================================================ */
const Particles = (() => {
  function init() {
    if (CONFIG.REDUCED_MOTION) return;
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let raf = null;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const spawn = () => {
      const count = Math.min(46, Math.floor(canvas.width / 30));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.28 + 0.06),
        a: Math.random() * 0.45 + 0.1,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
        if (p.x < -6) p.x = canvas.width + 6;
        if (p.x > canvas.width + 6) p.x = -6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 193, 7, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    spawn();
    tick();
    window.addEventListener('resize', () => { resize(); spawn(); }, { passive: true });

    // Pausar cuando el hero no está en pantalla (rendimiento)
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { if (!raf) tick(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }).observe(canvas);
  }
  return { init };
})();

/* ============================================================
   ANIMATIONS — GSAP + ScrollTrigger (reveals y hero)
   ============================================================ */
const Animations = (() => {
  function init() {
    if (typeof gsap === 'undefined') {
      // Fallback sin GSAP: mostrar todo
      document.querySelectorAll('[data-reveal], .line').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (CONFIG.REDUCED_MOTION) {
      gsap.set('[data-reveal], .line', { opacity: 1, y: 0 });
      return;
    }

    // Entrada del hero: líneas del titular en cascada
    gsap.to('[data-line]', {
      y: 0,
      duration: 1.15,
      ease: 'power4.out',
      stagger: 0.14,
      delay: 0.25,
    });

    gsap.to('.hero [data-reveal]', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.55,
    });

    // Reveals genéricos con ScrollTrigger.batch
    ScrollTrigger.batch('main section:not(.hero) [data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.09,
        }),
    });

    // Parallax suave en imagen del hero
    gsap.to('.hero__img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
  return { init };
})();

/* ============================================================
   COUNTERS — contadores animados al entrar en pantalla
   ============================================================ */
const Counters = (() => {
  function animate(el) {
    const target = Number(el.dataset.count);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString('es-CL');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function init() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    if (CONFIG.REDUCED_MOTION) {
      nums.forEach((el) => (el.textContent = el.dataset.count));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((el) => io.observe(el));
  }
  return { init };
})();

/* ============================================================
   PROJECT FILTER — filtro por categorías con animación
   ============================================================ */
const ProjectFilter = (() => {
  function init() {
    const buttons = document.querySelectorAll('.filter');
    const projects = document.querySelectorAll('.project');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });

        const cat = btn.dataset.filter;

        projects.forEach((p) => {
          const show = cat === 'all' || p.dataset.cat === cat;
          if (typeof gsap !== 'undefined' && !CONFIG.REDUCED_MOTION) {
            if (show) {
              p.classList.remove('is-hidden');
              gsap.fromTo(p, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' });
            } else {
              gsap.to(p, {
                opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.in',
                onComplete: () => p.classList.add('is-hidden'),
              });
            }
          } else {
            p.classList.toggle('is-hidden', !show);
            p.style.opacity = show ? '1' : '';
          }
        });
      });
    });
  }
  return { init };
})();

/* ============================================================
   LIGHTBOX — vista ampliada de proyectos
   ============================================================ */
const Lightbox = (() => {
  function init() {
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    if (!box) return;

    const open = (project) => {
      const src = project.querySelector('img').src.replace('w=900', 'w=1600');
      const name = project.querySelector('.project__name')?.textContent ?? '';
      const spec = project.querySelector('.project__spec')?.textContent ?? '';
      img.src = src;
      img.alt = name;
      caption.textContent = `${name} — ${spec}`;
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const close = () => {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('.project').forEach((p) => {
      p.addEventListener('click', () => open(p));
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); }
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
  }
  return { init };
})();

/* ============================================================
   TESTIMONIALS — Swiper con autoplay
   ============================================================ */
const Testimonials = (() => {
  function init() {
    if (typeof Swiper === 'undefined') return;
    const el = document.querySelector('.testimonial-swiper');
    if (!el) return;

    new Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 700,
      autoplay: CONFIG.REDUCED_MOTION ? false : { delay: 4500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        768:  { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
      },
      a11y: { enabled: true },
    });
  }
  return { init };
})();

/* ============================================================
   TILT — efecto 3D sutil en tarjetas de servicios
   ============================================================ */
const Tilt = (() => {
  function init() {
    if (CONFIG.REDUCED_MOTION || !window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6;  // máx 3°
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        card.style.transform = `perspective(700px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'none';
      });
    });
  }
  return { init };
})();

/* ============================================================
   MAGNETIC — microinteracción en botones principales
   ============================================================ */
const Magnetic = (() => {
  function init() {
    if (CONFIG.REDUCED_MOTION || !window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.28;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }
  return { init };
})();

/* ============================================================
   QUOTE FORM — validación + envío por WhatsApp
   ============================================================ */
const QuoteForm = (() => {
  const MESSAGES = {
    valueMissing: 'Este campo es obligatorio.',
    typeMismatch: 'Revise el formato del correo.',
    tooShort: 'El texto es demasiado corto.',
    patternMismatch: 'Ingrese un teléfono válido.',
  };

  function errorFor(input) {
    const v = input.validity;
    if (v.valueMissing) return MESSAGES.valueMissing;
    if (v.typeMismatch) return MESSAGES.typeMismatch;
    if (v.tooShort) return MESSAGES.tooShort;
    if (v.patternMismatch) return MESSAGES.patternMismatch;
    return '';
  }

  function validateField(input) {
    const field = input.closest('.field');
    const errorEl = field?.querySelector('.field__error');
    const msg = errorFor(input);
    field?.classList.toggle('is-invalid', Boolean(msg));
    if (errorEl) errorEl.textContent = msg;
    return !msg;
  }

  function init() {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    const status = document.getElementById('formStatus');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.field')?.classList.contains('is-invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      inputs.forEach((input) => { if (!validateField(input)) valid = false; });

      if (!valid) {
        status.textContent = 'Revise los campos marcados en naranjo.';
        form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea')?.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      const text =
        `Hola VÉRTICE, quiero solicitar un presupuesto.%0A%0A` +
        `*Nombre:* ${encodeURIComponent(data.nombre)}%0A` +
        `*Teléfono:* ${encodeURIComponent(data.telefono)}%0A` +
        `*Correo:* ${encodeURIComponent(data.correo)}%0A` +
        `*Tipo de proyecto:* ${encodeURIComponent(data.tipo)}%0A` +
        `*Detalle:* ${encodeURIComponent(data.mensaje)}`;

      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener');
      status.textContent = 'Abriendo WhatsApp con su solicitud…';
      form.reset();
    });
  }
  return { init };
})();

/* ============================================================
   FLOATING — WhatsApp flotante + botón volver arriba
   ============================================================ */
const Floating = (() => {
  function init() {
    // WhatsApp
    const wa = document.getElementById('waFloat');
    if (wa) {
      const msg = encodeURIComponent('Hola VÉRTICE, me gustaría cotizar un proyecto.');
      wa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;
    }

    // Volver arriba
    const toTop = document.getElementById('toTop');
    if (toTop) {
      const onScroll = () =>
        toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      toTop.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: CONFIG.REDUCED_MOTION ? 'auto' : 'smooth' })
      );
    }
  }
  return { init };
})();
