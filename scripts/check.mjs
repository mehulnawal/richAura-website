import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
for (const file of ['index.html', 'services.html', 'contact.html']) {
  const page = await readFile(new URL(file, root), 'utf8');
  for (const [, asset] of page.matchAll(/(?:src|href)="([^"?#]+\.(?:css|js|svg|png|ttf))"/g)) {
    await access(new URL(asset.replace(/^\//, ''), root));
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs must be unique');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), `Missing anchor: ${id}`);
for (const [, asset] of html.matchAll(/(?:src|href)="((?:assets\/|styles\.css|app\.js|config\.js)[^"]*)"/g)) await access(new URL(asset, root));
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((html.match(/class="case-study"/g) || []).length, 2);
assert.equal((html.match(/class="service-card"/g) || []).length, 2);
assert(!html.includes('Selected work'), 'Old section name must be removed');
assert(!html.includes('id="seo-aeo"') && !html.includes('id="marketplace"'), 'Home only previews two core services');
assert.equal((html.match(/<blockquote>/g) || []).length, 2);
assert(!/href="\/(?:about|projects)/.test(html), 'No unfinished routes');
for (const file of ['services.html', 'contact.html']) {
  const page = await readFile(new URL(file, root), 'utf8');
  const pageIds = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(pageIds.length, new Set(pageIds).size);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  for (const [, id] of page.matchAll(/href="#([^"]+)"/g)) assert(pageIds.includes(id), `${file} missing ${id}`);
  for (const [, asset] of page.matchAll(/(?:src|href)="\/(assets\/[^\"]+|styles\.css|app\.js|config\.js|enquiry\.js)"/g)) await access(new URL(asset, root));
}
const contact = await readFile(new URL('contact.html', root), 'utf8');
assert.equal((contact.match(/<label for=/g) || []).length, 5);
const servicePage = await readFile(new URL('services.html', root), 'utf8');
assert.equal((servicePage.match(/class="service-detail"/g) || []).length, 4);
const scope = { window: {} };
vm.runInNewContext(await readFile(new URL('config.js', root), 'utf8'), scope);
const config = scope.window.RICH_AURA_CONFIG;
assert.equal(config.whatsappMode, 'developer-test');
assert.equal(config.whatsappRecipient, '919879216262');
const url = new URL(`https://wa.me/${config.whatsappRecipient}?text=${encodeURIComponent(config.whatsappMessage)}`);
assert.equal(url.searchParams.get('text'), config.whatsappMessage, 'WhatsApp text must round trip');
new vm.Script(await readFile(new URL('app.js', root), 'utf8'));
for (const asset of ['reference.css','palette.css','assets/growth-target.svg']) await access(new URL(asset, root));
const enquiryScope = {};
vm.runInNewContext(await readFile(new URL('enquiry.js', root), 'utf8'), enquiryScope);
const enquiry = enquiryScope.RichAuraEnquiry;
const sample = {name:'Test Brand', email:'test@example.com', phone:'+91 9879216262', service:'social-media', details:'Review & growth?\nBrand: Café + Studio'};
assert.equal(Object.keys(enquiry.validate(sample)).length, 0);
assert.equal(Object.keys(enquiry.validate({name:' ',email:'bad',phone:'abc',service:'unknown',details:'short'})).length, 5);
assert(Object.hasOwn(enquiry.validate({...sample,phone:'+123'}),'phone'));
assert(Object.hasOwn(enquiry.validate({...sample,service:'__proto__'}),'service'));
for (const service of Object.keys(enquiry.services)) {
  const link = new URL(enquiry.buildUrl({...sample,service},config.whatsappRecipient));
  assert.equal(link.pathname, '/919879216262');
  assert(link.searchParams.get('text').includes(sample.details));
  assert(link.searchParams.get('text').includes(enquiry.services[service]));
}
console.log('PASS: all three pages, local assets, anchors, IDs, 2 Home / 4 Services previews, 5 form fields, validation and WhatsApp encoding for all services.');
