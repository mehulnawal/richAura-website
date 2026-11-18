(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveals.unobserve(entry.target);
        if (reducedMotion.matches || !entry.target.animate) return;
        const animation = entry.target.animate([
          { opacity: .55, transform: 'translateY(28px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
        activeAnimations.add(animation);
        animation.onfinish = () => activeAnimations.delete(animation);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.section-heading,.brands-story,.partners-board,.service-card,.case-study,.process-list article,.testimonials-grid figure,.contact-panel').forEach(el => reveals.observe(el));
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
    }
  });
  const progress = document.querySelector('.scroll-progress');
  let scrollPending = false;
  const updateScroll = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  window.addEventListener('load', updateScroll);
  updateScroll();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (menu && nav) {
    menu.hidden = false;
    document.documentElement.classList.add('js');
    const setMenu = open => {
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.inert = !open;
    };
    const closeMenu = () => setMenu(false);
    closeMenu();
    menu.addEventListener('click', () => {
      setMenu(menu.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu(); menu.focus();
      }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.nav-wrap')) closeMenu(); });
    window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  }
  const config = window.RICH_AURA_CONFIG;
  if (config && /^[1-9]\d{9,14}$/.test(config.whatsappRecipient)) {
    const url = `https://wa.me/${config.whatsappRecipient}?text=${encodeURIComponent(config.whatsappMessage)}`;
    document.querySelectorAll('.whatsapp-link').forEach(link => {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', "Let's talk growth — open WhatsApp in a new tab");
    });
    const note = document.querySelector('[data-contact-note]');
    if (note) note.textContent = 'Opens WhatsApp. You choose when to send.';
  }
})();
