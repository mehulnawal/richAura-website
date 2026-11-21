import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../dist/',import.meta.url);
const projects=JSON.parse(await readFile(new URL('projects.json',root),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
async function card(p){
 const images=await Promise.all(p.images.map(async(id,i)=>{
  const bytes=await readFile(new URL(`assets/work/${id}.png`,root));
  return `<figure><img src="/assets/work/${id}.png" alt="${esc(p.name)} — ${p.category==='performance'?'campaign report':'creative'} ${i+1}" width="${bytes.readUInt32BE(16)}" height="${bytes.readUInt32BE(20)}" loading="lazy" decoding="async">${p.images.length>1?`<figcaption>${i+1} / ${p.images.length}</figcaption>`:''}</figure>`;
 }));
 return `<article class="portfolio-card static-project ${p.images.length>1?'project-collection':''}" id="${p.id}" data-category="${p.category}"><div class="static-gallery ${p.category==='performance'?'static-report':''}">${images.join('')}</div><div class="portfolio-copy"><p class="eyebrow">${esc(p.industry)}</p><h2>${esc(p.name)}</h2><p>${esc(p.heading)}</p><p class="project-description">${esc(p.description)}</p>${p.metrics?'<dl class="report-metrics">'+p.metrics.map(([v,l])=>`<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('')+'</dl>':''}${p.note?`<p class="report-note">${esc(p.note)}</p>`:''}</div></article>`;
}
const cards=await Promise.all(projects.map(card));
let html=await readFile(new URL('projects.html',root),'utf8');
html=html.replace(/<div class="portfolio-grid">[\s\S]*?<\/section>/,`<div class="portfolio-grid">${cards.join('\n')}</div></section>`).replace(/\d+ projects and collections/,`${projects.length} projects and collections`);
await writeFile(new URL('projects.html',root),html);
console.log(`Rendered ${projects.length} static collections and ${projects.reduce((n,p)=>n+p.images.length,0)} images.`);
