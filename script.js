/**
 * script.js — Mangalam HDPE Pipes Product Page
 * Handles: sticky header, carousel + zoom, process tabs,
 *          apps carousel, mobile menu, modals, forms
 */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* 1. STICKY ANNOUNCEMENT BANNER*/
(function () {
  const bar = $('#sticky-header');
  if (!bar) return;
  const THRESH = window.innerHeight * 0.6;
  let last = 0, ticking = false;
  function update() {
    const y = window.scrollY;
    if (y > THRESH && y > last) bar.classList.add('visible');
    else if (y <= THRESH || y < last) bar.classList.remove('visible');
    last = y; ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

/* 2. MOBILE HAMBURGER*/
(function () {
  const btn = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    menu.hidden = !open;
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }));
})();

/* 3. PRODUCT IMAGE CAROUSEL*/
(function () {
  const track = $('#carousel-track');
  const thumbs = $('#carousel-thumbs');
  if (!track) return;

  const slides = $$('.carousel-slide', track);
  const thumbBtns = $$('.thumb', thumbs);
  let current = 0;

  function goTo(idx) {
    slides[current].classList.remove('active');
    thumbBtns[current]?.classList.remove('active');
    thumbBtns[current]?.setAttribute('aria-selected', 'false');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    thumbBtns[current]?.classList.add('active');
    thumbBtns[current]?.setAttribute('aria-selected', 'true');
    updateZoomImage();
  }

  $('#carousel-prev')?.addEventListener('click', () => goTo(current - 1));
  $('#carousel-next')?.addEventListener('click', () => goTo(current + 1));
  thumbBtns.forEach(btn => btn.addEventListener('click', () => goTo(+btn.dataset.index)));

  // Swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });

  /* ── ZOOM PREVIEW ── */
  const main = $('#carousel-main');
  const preview = $('#zoom-preview');

  function updateZoomImage() {
    if (!preview) return;
    const img = slides[current].querySelector('img');
    if (img) preview.style.backgroundImage = `url(${img.src})`;
  }
  updateZoomImage();

  if (main && preview) {
    main.addEventListener('mousemove', e => {
      const img = slides[current].querySelector('img');
      if (!img) return;
      const r = img.getBoundingClientRect();
      const cx = ((e.clientX - r.left) / r.width) * 100;
      const cy = ((e.clientY - r.top) / r.height) * 100;
      preview.style.backgroundPosition = `${cx}% ${cy}%`;
      preview.style.backgroundSize = '380%';
      preview.classList.add('active');
      // Move zoom lens
      const lens = slides[current].querySelector('.zoom-lens');
      if (lens) {
        lens.style.left = `${e.clientX - r.left}px`;
        lens.style.top = `${e.clientY - r.top}px`;
      }
    });
    main.addEventListener('mouseleave', () => {
      preview.classList.remove('active');
      const lens = slides[current]?.querySelector('.zoom-lens');
      if (lens) lens.style.opacity = '0';
    });
  }
})();

/* 4. PROCESS TABS  (class: .ptab / .ppanel)*/
(function () {
  const tabs = $$('.ptab');
  const panels = $$('.ppanel');
  if (!tabs.length) return;

  function activate(step) {
    tabs.forEach(t => {
      const on = t.dataset.step === step;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    panels.forEach(p => p.classList.toggle('active', p.dataset.step === step));
  }

  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.step)));

  // Process panel prev/next arrows
  $$('[data-proc-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const activeIdx = tabs.findIndex(t => t.classList.contains('active'));
      const next = activeIdx + parseInt(btn.dataset.procDir);
      if (tabs[next]) activate(tabs[next].dataset.step);
    });
  });
})();

/* 5. APPLICATIONS CAROUSEL*/
(function () {
  const track = $('#apps-track');
  const prev = $('#apps-prev');
  const next = $('#apps-next');
  if (!track) return;

  const CARD_W = () => {
    const card = track.querySelector('.app-card');
    return card ? card.offsetWidth + 16 : 246;
  };

  prev?.addEventListener('click', () => track.scrollBy({ left: -CARD_W() * 2, behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: CARD_W() * 2, behavior: 'smooth' }));
})();

/* 6. FAQ ACCORDION (sync chevron icons)*/
(function () {
  $$('.faq-item').forEach(det => {
    det.addEventListener('toggle', () => {
      const icon = det.querySelector('.faq-icon');
      if (icon) icon.style.transform = det.open ? 'rotate(45deg)' : 'none';
    });
  });
})();

/* 7. MODALS
   Triggers:
     btn-open-quote-hero, btn-open-quote, btn-open-quote-expert → #modal-quote
     btn-open-datasheet                                          → #modal-datasheet
     catalogue-form submit                                       → #modal-datasheet (alt)
*/
(function () {
  function openModal(id) {
    const m = $('#' + id);
    if (!m) return;
    m.hidden = false;
    document.body.classList.add('modal-open');
    m.querySelector('.modal-close, input, button[type="submit"]')?.focus();
  }
  function closeModal(id) {
    const m = $('#' + id);
    if (!m) return;
    m.hidden = true;
    document.body.classList.remove('modal-open');
    // Reset success state
    const form = m.querySelector('.modal-form');
    const succ = m.querySelector('.modal-success');
    if (form) form.style.display = '';
    if (succ) succ.remove();
  }

  // Open triggers
  ['btn-open-quote-hero', 'btn-open-quote', 'btn-open-quote-expert'].forEach(id => {
    $('#' + id)?.addEventListener('click', () => openModal('modal-quote'));
  });
  $('#btn-open-datasheet')?.addEventListener('click', () => openModal('modal-datasheet'));

  // Close buttons (data-close="modalId")
  $$('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));

  // Overlay click to close
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-overlay:not([hidden])').forEach(m => closeModal(m.id));
  });

  // Form validation + success state
  function handleForm(formId, modalId) {
    const form = $('#' + formId);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const emailField = form.querySelector('[type="email"]');
      const nameField = form.querySelector('[type="text"]');
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailField && !emailRe.test(emailField.value.trim())) {
        emailField.focus();
        emailField.style.borderColor = '#ef4444';
        setTimeout(() => emailField.style.borderColor = '', 1500);
        return;
      }
      if (nameField && !nameField.value.trim()) {
        nameField.focus();
        nameField.style.borderColor = '#ef4444';
        setTimeout(() => nameField.style.borderColor = '', 1500);
        return;
      }
      // Show success
      form.style.display = 'none';
      const succ = document.createElement('div');
      succ.className = 'modal-success';
      succ.innerHTML = '<span class="si">✅</span><h3>Submitted!</h3><p>We\'ll be in touch shortly.</p>';
      form.parentNode.appendChild(succ);
      setTimeout(() => closeModal(modalId), 2800);
    });
  }

  handleForm('form-datasheet', 'modal-datasheet');
  handleForm('form-quote', 'modal-quote');

  // Catalogue form (inline in FAQ section)
  const catForm = $('#catalogue-form');
  if (catForm) {
    catForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = catForm.querySelector('input[type="email"]');
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(input?.value.trim() || '')) {
        if (input) { input.style.borderColor = '#ef4444'; setTimeout(() => input.style.borderColor = '', 1500); }
        return;
      }
      const btn = catForm.querySelector('button');
      if (btn) { btn.textContent = '✅ Sent!'; btn.disabled = true; }
      setTimeout(() => {
        if (btn) { btn.textContent = 'Request Catalogue'; btn.disabled = false; }
        catForm.reset();
      }, 3000);
    });
  }

  // CTA form
  const ctaForm = $('#cta-form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = ctaForm.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = '✅ Request Sent!'; btn.disabled = true; }
      setTimeout(() => { if (btn) { btn.textContent = 'Request Custom Quote'; btn.disabled = false; } ctaForm.reset(); }, 3000);
    });
  }
})();

/* 8. SCROLL REVEAL (simple fade-in on scroll)*/
(function () {
  const els = $$('.feature-card, .related-card, .testi-card, .app-card');
  if (!('IntersectionObserver' in window)) return;
  els.forEach(el => { el.classList.add('reveal'); });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();
