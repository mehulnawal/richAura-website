(() => {
  'use strict';
  const filters = document.querySelector('.project-filters');
  const cards = [...document.querySelectorAll('.portfolio-card')];
  const status = document.querySelector('.project-count');
  if (!filters || !status) return;
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
    const count = cards.filter(card => !card.hidden).length;
    status.textContent = `${count} ${count === 1 ? 'project or collection' : 'projects and collections'}`;
  });
})();
