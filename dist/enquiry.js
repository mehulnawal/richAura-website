(function (root) {
  'use strict';
  const services = Object.freeze({ 'social-media': 'Social Media Marketing & Handling', 'performance-marketing': 'Performance Marketing', 'seo-aeo': 'SEO & AEO', marketplace: 'Marketplace Management' });
  function validate(data) {
    const errors = {};
    if (data.name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Please enter a valid email address.';
    const phone = data.phone.trim();
    if (!/^\+?[\d\s().-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) errors.phone = 'Please enter a valid phone number, including country code if needed.';
    if (!Array.isArray(data.service) || !data.service.length || data.service.some(value => !Object.hasOwn(services, value))) errors.service = 'Please choose at least one service.';
    if (data.details.trim().length < 10) errors.details = 'Please add at least 10 characters about your brand or project.';
    return errors;
  }
  function buildUrl(data, recipient) {
    if (!/^[1-9]\d{9,14}$/.test(recipient)) throw new Error('Invalid recipient');
    if (Object.keys(validate(data)).length) throw new Error('Invalid enquiry');
    const message = ['New Website Enquiry — Richaura', '', `Name: ${data.name.trim()}`, `Business Email: ${data.email.trim()}`, `Phone / WhatsApp: ${data.phone.trim()}`, '', 'Interested Services:', ...[...new Set(data.service)].map(value => `• ${services[value]}`), '', 'Project / Brand Details:', data.details.trim(), '', 'Source: Richaura Website'].join('\n');
    return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
  }
  root.RichAuraEnquiry = Object.freeze({ validate, buildUrl, services });
  if (!root.document) return;
  const form = document.querySelector('#enquiry-form');
  if (!form) return;
  const summary = document.querySelector('#form-summary');
  const handoff = document.querySelector('#handoff');
  const fallback = document.querySelector('#whatsapp-fallback');
  const keys = ['name', 'email', 'phone', 'service', 'details'];
  const choices = [...form.querySelectorAll('input[name="service"]')];
  const group = document.getElementById('service');
  const requested = new URLSearchParams(location.search).getAll('service');
  choices.forEach(input => { input.checked = requested.includes(input.value); });
  const read = () => Object.fromEntries(keys.map(key => [key, key === 'service' ? choices.filter(input => input.checked).map(input => input.value) : form.elements[key].value]));
  const renderError = (key, error) => {
    const input = key === 'service' ? group : form.elements[key];
    document.getElementById(`${key}-error`).textContent = error || '';
    if (error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };
  form.querySelector('[type="submit"]').disabled = false;
  form.addEventListener('input', event => {
    handoff.hidden = true;
    fallback.removeAttribute('href');
    if (keys.includes(event.target.name) && (event.target.hasAttribute('aria-invalid') || (event.target.name === 'service' && group.hasAttribute('aria-invalid')))) renderError(event.target.name, validate(read())[event.target.name]);
    if (!form.querySelector('[aria-invalid="true"]')) summary.hidden = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = read();
    const errors = validate(data);
    keys.forEach(key => renderError(key, errors[key]));
    handoff.hidden = true;
    if (Object.keys(errors).length) {
      summary.textContent = 'Please check the highlighted fields before continuing.';
      summary.hidden = false;
      const first = Object.keys(errors)[0];
      (first === 'service' ? choices[0] : form.elements[first]).focus();
      return;
    }
    try {
      const url = buildUrl(data, root.RICH_AURA_CONFIG?.whatsappRecipient);
      summary.hidden = true;
      fallback.href = url;
      handoff.hidden = false;
      root.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      summary.textContent = 'WhatsApp is unavailable right now. Please use the email link to contact us.';
      summary.hidden = false;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
