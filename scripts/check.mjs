import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
for (const file of ['index.html', 'services.html', 'contact.html', 'about.html', 'projects.html']) {
  const page = await readFile(new URL(file, root), 'utf8');
  const navigation = page.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)[0];
  const navigationLinks = [...navigation.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  assert.equal(navigationLinks.length, new Set(navigationLinks).size, `${file}: duplicate menu links`);
  for (const route of ['/', '/about', '/services', '/projects', '/contact']) assert(navigationLinks.includes(route));
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
assert(html.includes('href="/about"') && html.includes('href="/projects"'), 'Complete public navigation');
for (const file of ['services.html', 'contact.html', 'about.html', 'projects.html']) {
  const page = await readFile(new URL(file, root), 'utf8');
  const pageIds = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(pageIds.length, new Set(pageIds).size);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  for (const [, id] of page.matchAll(/href="#([^"]+)"/g)) assert(pageIds.includes(id), `${file} missing ${id}`);
  for (const [, asset] of page.matchAll(/(?:src|href)="\/(assets\/[^\"]+|styles\.css|app\.js|config\.js|enquiry\.js)"/g)) await access(new URL(asset, root));
}
const contact = await readFile(new URL('contact.html', root), 'utf8');
assert.equal((contact.match(/type="checkbox"/g) || []).length, 4);
assert(contact.includes('<legend>Select Services Interested In</legend>'));
const servicePage = await readFile(new URL('services.html', root), 'utf8');
assert.equal((servicePage.match(/class="service-detail"/g) || []).length, 4);
const scope = { window: {} };
vm.runInNewContext(await readFile(new URL('config.js', root), 'utf8'), scope);
const config = scope.window.RICH_AURA_CONFIG;
assert.equal(config.whatsappMode, 'client');
assert.equal(config.whatsappRecipient, '917984964553');
const url = new URL(`https://wa.me/${config.whatsappRecipient}?text=${encodeURIComponent(config.whatsappMessage)}`);
assert.equal(url.searchParams.get('text'), config.whatsappMessage, 'WhatsApp text must round trip');
new vm.Script(await readFile(new URL('app.js', root), 'utf8'));
for (const asset of ['reference.css','palette.css','assets/growth-target.svg']) await access(new URL(asset, root));
const enquiryScope = {};
vm.runInNewContext(await readFile(new URL('enquiry.js', root), 'utf8'), enquiryScope);
const enquiry = enquiryScope.RichAuraEnquiry;
const sample = {name:'Test Brand', email:'test@example.com', phone:'+91 9879216262', service:['social-media'], details:'Review & growth?\nBrand: Café + Studio'};
assert.equal(Object.keys(enquiry.validate(sample)).length, 0);
assert.equal(Object.keys(enquiry.validate({name:' ',email:'bad',phone:'abc',service:'unknown',details:'short'})).length, 5);
assert(Object.hasOwn(enquiry.validate({...sample,phone:'+123'}),'phone'));
assert(Object.hasOwn(enquiry.validate({...sample,service:['__proto__']}),'service'));
for (const service of Object.keys(enquiry.services)) {
  const link = new URL(enquiry.buildUrl({...sample,service:[service]},config.whatsappRecipient));
  assert.equal(link.pathname, '/917984964553');
  assert(link.searchParams.get('text').includes(sample.details));
  assert(link.searchParams.get('text').includes(enquiry.services[service]));
}
const projects = JSON.parse(await readFile(new URL('projects.json', root), 'utf8'));
assert.equal(projects.length, 12);
assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
for (const project of projects) for (const image of project.images) await access(new URL(`assets/work/${image}.png`, root));
assert.equal(projects.flatMap(p => p.images).length, 20);
const reports = projects.filter(p => p.category === 'performance');
assert.equal(reports.length, 4);
assert(reports.filter(p => p.id.startsWith('linen-fabric')).every(p => p.note.includes('not combined')));
assert(reports.find(p => p.id === 'kesari-exports').note.includes('Form leads are reported separately'));
new vm.Script(await readFile(new URL('projects.js', root), 'utf8'));
assert(contact.includes('richaura@gmail.com') && contact.includes('tel:+917984964553'));
const projectPage = await readFile(new URL('projects.html', root), 'utf8');
const gallery = projectPage.match(/<div class="portfolio-grid">[\s\S]*?<\/section>/)[0];
assert(!/<(?:a|button|summary|details)\b/.test(gallery), 'Project cards and images must be static');
assert.equal((gallery.match(/data-category="performance"/g) || []).length, 4);
console.log('PASS: five pages, local assets, anchors, IDs, 2 Home / 4 Services previews, 12 static collections / 20 images / 4 reports, 5 form fields, validation and client WhatsApp encoding.');

assert(Object.hasOwn(enquiry.validate({...sample, service:[]}), 'service'));
const serviceKeys = Object.keys(enquiry.services);
for (let mask=1; mask<16; mask++) {
 const selected = serviceKeys.filter((key,i)=>mask & (1<<i));
 const message = new URL(enquiry.buildUrl({...sample, service:selected},config.whatsappRecipient)).searchParams.get('text');
 for (const key of serviceKeys) assert.equal(message.includes('• '+enquiry.services[key]), selected.includes(key));
}
assert.throws(()=>enquiry.buildUrl({...sample,service:['social-media','unknown']},config.whatsappRecipient));
console.log('PASS: all 15 service combinations encoded correctly; empty/unknown selections rejected.');
