'use strict';
const collectionCards = [...document.querySelectorAll('[data-collection]')];
const collectionFilters = [...document.querySelectorAll('[data-collection-filter]')];
collectionFilters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.collectionFilter;
  collectionFilters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let visible = 0;
  collectionCards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.collection !== filter; if (!card.hidden) visible++; });
  document.querySelector('#collection-status').textContent = visible + (visible === 1 ? ' design concept' : ' design concepts');
}));
document.querySelectorAll('[data-design]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#brief-service').value = 'Fashion & creative direction';
  document.querySelector('#brief-goal').value = 'I would like to discuss a design inspired by ' + button.dataset.design + '. My occasion, preferred materials, timing and budget: ';
  document.querySelector('#brief-form').hidden = false;
  document.querySelector('#brief-result').hidden = true;
  document.querySelector('#brief-status').textContent = 'Add your details to prepare an enquiry about this concept.';
  document.querySelector('#contact').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  document.querySelector('#brief-name').focus({preventScroll:true});
}));
