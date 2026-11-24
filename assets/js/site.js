// OMFED NEER website v2. Vanilla JS, no tracking, no cookies. Forms open WhatsApp or email; nothing is stored by the site.
(() => {
  const WA = '919114653656', MAIL = 'customercare@praayogassociate.com';
  const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  // ALL MENU overlay
  const ov = $('#allmenu'), ovBtn = $('[data-allmenu]');
  const ovSet = open => { ov?.classList.toggle('open', open); ovBtn?.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; if (open) $('.overlay-close', ov)?.focus(); else ovBtn?.focus(); };
  ovBtn?.addEventListener('click', () => ovSet(true));
  $('.overlay-close', ov || document)?.addEventListener('click', () => ovSet(false));
  ov?.addEventListener('click', e => { if (e.target === ov) ovSet(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov?.classList.contains('open')) ovSet(false); });

  // Accessibility panel: text size and contrast (remembered on this device only)
  const root = document.documentElement, ap = $('#a11y'), apBtn = $('[data-a11y]');
  const applyA11y = () => {
    root.dataset.fs = store.get('neer-fs') || '0';
    root.classList.toggle('contrast', store.get('neer-contrast') === '1');
    $$('[data-fs]', ap || document).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fs === root.dataset.fs)));
    $('[data-contrast]')?.setAttribute('aria-pressed', String(root.classList.contains('contrast')));
  };
  applyA11y();
  apBtn?.addEventListener('click', () => { const o = ap.classList.toggle('open'); apBtn.setAttribute('aria-expanded', String(o)); });
  $$('[data-fs]', ap || document).forEach(b => b.addEventListener('click', () => { store.set('neer-fs', b.dataset.fs); applyA11y(); }));
  $('[data-contrast]')?.addEventListener('click', () => { store.set('neer-contrast', root.classList.contains('contrast') ? '0' : '1'); applyA11y(); });
  document.addEventListener('click', e => { if (ap?.classList.contains('open') && !ap.contains(e.target) && !apBtn.contains(e.target)) { ap.classList.remove('open'); apBtn.setAttribute('aria-expanded', 'false'); } });

  // Reveal on scroll + stat icons draw-in
  const reveal = $$('.reveal, .stat');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(r => io.observe(r));
  } else reveal.forEach(r => r.classList.add('in'));

  // Banner slider: 5 s, pause button, arrows, dots, swipe, keyboard; pauses on hover/focus and hidden tab
  const sl = $('[data-slider]');
  if (sl) {
    const slides = $$('.slide', sl), dotsBox = $('.slider-dots', sl), pb = $('[data-pause]', sl);
    let i = 0, timer = null, userPaused = reduced, hover = false;
    const dots = slides.map((s, n) => { const d = document.createElement('button'); d.type = 'button'; d.setAttribute('role', 'tab'); d.setAttribute('aria-label', `Slide ${n + 1} of ${slides.length}`); d.addEventListener('click', () => { go(n); restart(); }); dotsBox.append(d); return d; });
    const go = n => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', String(k !== i)); if (s.tagName === 'A') s.tabIndex = k === i ? 0 : -1; $$('a', s).forEach(a => a.tabIndex = k === i ? 0 : -1); }); dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i))); };
    const restart = () => { clearInterval(timer); timer = null; if (!(userPaused || hover || document.hidden)) timer = setInterval(() => go(i + 1), 5000); };
    const setPb = () => { pb.innerHTML = userPaused ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'; pb.setAttribute('aria-label', userPaused ? 'Play slides' : 'Pause slides'); };
    pb.addEventListener('click', () => { userPaused = !userPaused; setPb(); restart(); });
    $('[data-prev]', sl).addEventListener('click', () => { go(i - 1); restart(); });
    $('[data-next]', sl).addEventListener('click', () => { go(i + 1); restart(); });
    sl.addEventListener('mouseenter', () => { hover = true; restart(); }); sl.addEventListener('mouseleave', () => { hover = false; restart(); });
    sl.addEventListener('focusin', () => { hover = true; restart(); }); sl.addEventListener('focusout', () => { hover = false; restart(); });
    sl.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { go(i + 1); restart(); } if (e.key === 'ArrowLeft') { go(i - 1); restart(); } });
    let x0 = null; sl.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) { go(i + (dx < 0 ? 1 : -1)); restart(); } x0 = null; });
    document.addEventListener('visibilitychange', restart);
    setPb(); go(0); restart();
  }

  // What's New ticker: duplicate the items for a seamless loop; pause button
  const tk = $('[data-ticker]');
  if (tk) {
    const mv = $('.ticker-move', tk); mv.innerHTML += mv.innerHTML; $$('span', mv).slice(mv.children.length / 2).forEach(s => s.setAttribute('aria-hidden', 'true'));
    const b = $('.ticker-pause', tk);
    if (reduced) tk.classList.add('paused');
    b?.addEventListener('click', () => { const p = tk.classList.toggle('paused'); b.setAttribute('aria-label', p ? 'Play news ticker' : 'Pause news ticker'); b.innerHTML = p ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'; });
  }

  // Product band tabs (Bottles / Bulk orders / Distributors)
  $$('[data-ptabs]').forEach(box => {
    const tabs = $$('[role="tab"]', box);
    const sel = t => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; const p = document.getElementById(x.getAttribute('aria-controls')); if (p) { p.hidden = !on; if (on) $$('.reveal', p).forEach(r => r.classList.add('in')); } }); };
    tabs.forEach((t, k) => { t.addEventListener('click', () => sel(t)); t.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(k + d + tabs.length) % tabs.length]; sel(n); n.focus(); } }); });
  });

  // Odisha map: tooltip on hover; a click picks the district for the distributor enquiry
  const tip = $('.map-tip');
  $$('.odisha path[data-d]').forEach(p => {
    const name = p.dataset.d;
    p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button'); p.setAttribute('aria-label', `${name} district: enquire about distribution`);
    const show = e => { if (!tip) return; tip.textContent = `${name} · click to enquire`; tip.style.opacity = 1; const r = e.clientX ? { x: e.clientX, y: e.clientY } : (() => { const b = p.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top }; })(); tip.style.left = (r.x + 12) + 'px'; tip.style.top = (r.y - 34) + 'px'; };
    p.addEventListener('mousemove', show); p.addEventListener('focus', show);
    p.addEventListener('mouseleave', () => tip && (tip.style.opacity = 0)); p.addEventListener('blur', () => tip && (tip.style.opacity = 0));
    const pick = () => { const f = $('#dist-form select[name="district"]'); if (f) { f.value = name; $$('.odisha path.sel').forEach(x => x.classList.remove('sel')); p.classList.add('sel'); $('#enquire')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); setTimeout(() => $('#dist-form input[name="name"]')?.focus({ preventScroll: true }), 500); } else location.href = `distribution.html?district=${encodeURIComponent(name)}#enquire`; };
    p.addEventListener('click', pick); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  $$('[data-district]').forEach(b => b.addEventListener('click', () => { const f = $('#dist-form select[name="district"]'); if (f) { f.value = b.dataset.district; $$('[data-district]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $$('.odisha path').forEach(x => x.classList.toggle('sel', x.dataset.d === b.dataset.district)); $('#enquire')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); } }));
  const qd = new URLSearchParams(location.search).get('district');
  if (qd) { const f = $('#dist-form select[name="district"]'); if (f) { f.value = qd; $$('.odisha path').forEach(x => x.classList.toggle('sel', x.dataset.d === qd)); } }
  const qt = new URLSearchParams(location.search).get('form'); if (qt) $(`[data-ftab="${qt}"]`)?.click();

  // Contact page form tabs
  $$('[data-ftabs]').forEach(box => {
    const tabs = $$('[data-ftab]', box);
    tabs.forEach(t => t.addEventListener('click', () => tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; })));
  });

  // Enquiry forms → WhatsApp (default) or email. Nothing is sent to or stored by this website.
  $$('form[data-enquiry]').forEach(f => {
    const err = $('.form-err', f);
    const compose = () => {
      const lines = [f.dataset.enquiry];
      $$('[name]', f).forEach(el => { if (el.type === 'submit' || el.type === 'button') return; const v = (el.value || '').trim(); if (v) lines.push(`${el.dataset.label || el.name}: ${v}`); });
      return lines.join('\n');
    };
    const valid = () => { const bad = $$('[required]', f).find(el => !el.value.trim()); const ph = $('[name="phone"]', f); if (bad) { err.textContent = `Please fill in: ${bad.dataset.label || bad.name}.`; bad.focus(); return false; } if (ph && ph.value.trim() && !/^[+\d][\d\s-]{8,15}$/.test(ph.value.trim())) { err.textContent = 'Please enter a valid phone number (10 digits).'; ph.focus(); return false; } err.textContent = ''; return true; };
    f.addEventListener('submit', e => { e.preventDefault(); if (valid()) window.open(wa(compose()), '_blank', 'noopener'); });
    $('[data-mail]', f)?.addEventListener('click', () => { if (valid()) location.href = `mailto:${MAIL}?subject=${encodeURIComponent(f.dataset.enquiry)}&body=${encodeURIComponent(compose())}`; });
  });

  // Lightbox for galleries, product images and films
  const lb = $('dialog.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('img', lb), vid = $('video', lb), cap = $('p', lb);
    const show = (b, film) => {
      img.hidden = film; vid.hidden = !film;
      if (film) { vid.src = b.dataset.video; vid.setAttribute('aria-label', b.dataset.cap || ''); } else { img.src = b.dataset.zoom; img.alt = b.dataset.cap || ''; }
      cap.textContent = b.dataset.cap || ''; lb.showModal(); if (film) vid.play().catch(() => {});
    };
    $$('[data-zoom]').forEach(b => b.addEventListener('click', () => show(b, false)));
    $$('[data-video]').forEach(b => b.addEventListener('click', () => show(b, true)));
    $('button', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => vid.pause());
  }

  // Product enquiry window (any [data-enq] opens it, with the product picked)
  const eq = $('#enq');
  if (eq && typeof eq.showModal === 'function') {
    const openEq = (e, b) => { e.preventDefault(); if (b.dataset.enq) $('[name="product"]', eq).value = b.dataset.enq; if (ov?.classList.contains('open')) ovSet(false); eq.showModal(); $('[name="name"]', eq).focus(); };
    $$('[data-enq]').forEach(b => b.addEventListener('click', e => openEq(e, b)));
    $('[data-enq-close]', eq).addEventListener('click', () => eq.close());
    eq.addEventListener('click', e => { if (e.target === eq) eq.close(); });
  }

  // Listen: reads the product facts aloud with the device's own voice (nothing is sent anywhere)
  $$('[data-say]').forEach(b => {
    if (!('speechSynthesis' in window)) { b.hidden = true; return; }
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      const was = b.getAttribute('aria-pressed') === 'true';
      speechSynthesis.cancel(); $$('[data-say]').forEach(x => x.setAttribute('aria-pressed', 'false'));
      if (was) return;
      const u = new SpeechSynthesisUtterance(b.dataset.say); u.lang = 'en-IN'; u.rate = .95;
      u.onend = u.onerror = () => b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-pressed', 'true'); speechSynthesis.speak(u);
    });
  });

  // Product page: thumbnails swap the main picture
  $$('.pd').forEach(pd => {
    const main = $('.pd-main', pd), src = $('source', main), im = $('img', main);
    $$('[data-shot]', pd).forEach(t => t.addEventListener('click', () => {
      src.srcset = t.dataset.shot + '.webp'; im.src = t.dataset.shot + '.jpg'; im.alt = t.dataset.alt; main.dataset.zoom = t.dataset.shot + '.jpg'; main.dataset.cap = t.dataset.alt;
      $$('[data-shot]', pd).forEach(x => x.toggleAttribute('aria-current', x === t)); t.setAttribute('aria-current', 'true');
    }));
  });

  // Contact page: ?topic=feedback preselects the topic
  if (new URLSearchParams(location.search).get('topic') === 'feedback') { const f = $('#g-topic'); if (f) f.value = 'Feedback or a concern'; }

  // Opening animation on the home page: once per visit, about a second, never for reduced motion
  const ld = $('#loader');
  if (ld) {
    let seen = null; try { seen = sessionStorage.getItem('neer-loaded'); sessionStorage.setItem('neer-loaded', '1'); } catch { /* blocked */ }
    if (seen || reduced) ld.remove(); else { ld.classList.add('run'); setTimeout(() => ld.classList.add('done'), 1250); setTimeout(() => ld.remove(), 1800); }
  }

  // Floating "Advertisement" box (home page, as on omfed.com): our ad films, muted, one after another.
  // Appears after 2.5 s; closing it keeps it closed for this visit; no autoplay for reduced-motion users.
  const ad = $('#adpop');
  if (ad) {
    const ses = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* blocked */ } } };
    const list = JSON.parse(ad.dataset.ads || '[]'), v = $('video', ad), t = $('.adpop-t', ad), play = $('[data-ad-play]', ad), snd = $('[data-ad-sound]', ad);
    let k = 0;
    const load = n => { k = (n + list.length) % list.length; v.src = list[k].src; v.poster = list[k].poster; t.textContent = list[k].t; };
    const start = () => { play.hidden = true; const p = v.play(); if (p) p.catch(() => { play.hidden = false; }); };
    v.addEventListener('ended', () => { load(k + 1); start(); });
    play.addEventListener('click', () => { if (!v.src) load(0); start(); });
    v.addEventListener('click', () => { if (v.paused) start(); else { v.pause(); play.hidden = false; } });
    snd.addEventListener('click', () => { v.muted = !v.muted; snd.setAttribute('aria-pressed', String(!v.muted)); snd.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off'); snd.classList.toggle('on', !v.muted); if (v.paused) start(); });
    $('[data-ad-close]', ad).addEventListener('click', () => { v.pause(); ad.hidden = true; document.body.classList.remove('ad-on'); ses.set('neer-ad-closed', '1'); });
    if (ses.get('neer-ad-closed') !== '1' && list.length) setTimeout(() => { ad.hidden = false; document.body.classList.add('ad-on'); load(0); if (!reduced) start(); else play.hidden = false; }, 2500);
  }

  // Ask Balaram: fixed answers from the site's own facts, each ending with a WhatsApp hand-off (no AI, no tracking)
  const chat = $('[data-chat]'), body = $('[data-chat-body]');
  if (!chat || !body) return;
  const TOPICS = {
    sizes: { label: 'Pack sizes', answer: '1 litre (12 bottles a box), 500 ml (24 a box) and 250 ml (48 a box).', wa: "Hello, I'd like to know about OMFED NEER pack sizes and prices." },
    buy: { label: 'Where to buy', answer: 'Tell us your district on WhatsApp and our team will tell you where to get OMFED NEER near you.', wa: 'Hello, where can I buy OMFED NEER? My district is: ' },
    dist: { label: 'Become a distributor', answer: 'Send your name, firm, district and phone. We never ask for payment before a signed agreement.', wa: 'Hello, I want to become an OMFED NEER distributor. Name, firm, district, phone: ' },
    bulk: { label: 'Bulk order', answer: 'For offices, schools, hospitals and events: tell us the organisation, district, pack size and quantity. Every supply has a GST invoice.', wa: 'Hello, bulk order enquiry for OMFED NEER. Organisation, district, pack size and quantity: ' },
    label: { label: "What's in it?", answer: 'Packaged drinking water with added mineral. The label says it is processed using reverse osmosis, UV treatment and ozonation.', wa: 'Hello, I have a question about OMFED NEER water: ' },
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  const end = () => { body.scrollTop = body.scrollHeight; };
  const chips = () => { const c = el('div', 'chips'); Object.entries(TOPICS).forEach(([k, t]) => { const b = el('button', 'chip', t.label); b.type = 'button'; b.addEventListener('click', () => answer(k)); c.append(b); }); const w = el('a', 'chip wa', 'Talk on WhatsApp'); w.href = wa('Hello OMFED NEER, '); w.target = '_blank'; w.rel = 'noopener'; c.append(w); body.append(c); end(); };
  const answer = k => { const t = TOPICS[k]; $$('.chips', body).forEach(c => c.remove()); body.append(el('div', 'msg me', t.label), el('div', 'msg', t.answer)); const g = el('a', 'chip wa', 'Continue on WhatsApp →'); g.href = wa(t.wa); g.target = '_blank'; g.rel = 'noopener'; const r = el('div', 'chips'); r.append(g); body.append(r); chips(); };
  let started = false;
  const open = () => { chat.classList.add('open'); $('[data-chat-open]')?.setAttribute('aria-expanded', 'true'); if (!started) { started = true; const hi = el('div', 'msg'); hi.innerHTML = '<span lang="or">ନମସ୍କାର! ପାଣି ପିଇଲ?</span><br>Hello! How can I help?'; body.append(hi); chips(); } $('[data-chat-close]', chat).focus(); };
  const close = () => { chat.classList.remove('open'); const o = $('[data-chat-open]'); o?.setAttribute('aria-expanded', 'false'); o?.focus(); };
  $('[data-chat-open]')?.addEventListener('click', () => (chat.classList.contains('open') ? close() : open()));
  $('[data-chat-close]', chat).addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && chat.classList.contains('open')) close(); });
})();
