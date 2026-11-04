(() => {
  const hero = document.querySelector('.aura-hero');
  if (!hero) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const gsap = window.gsap;
  const ribbon = hero.querySelector('.hero-ribbon');
  const paths = [...ribbon.querySelectorAll('path')];
  const original = paths[0].getAttribute('d');
  const pause = hero.querySelector('.aura-motion');
  let paused = false;
  let frame = 0;
  let entrance;
  if (gsap && !motion.matches) {
    entrance = gsap.timeline({defaults:{ease:'power3.out'}})
      .from('.headline-line', {y:65,opacity:.2,duration:1.15,stagger:.12})
      .from('.headline-final em', {rotation:0,opacity:0,duration:.7}, .4)
      .from('.hero-ribbon', {scale:1.1,opacity:0,duration:1.5}, 0)
      .from('.aura-bottom', {y:15,opacity:.3,duration:.7}, .5);
  }
  function settle() {
    cancelAnimationFrame(frame);
    if (gsap) { gsap.killTweensOf(paths); gsap.set(paths,{attr:{d:original}}); gsap.set(ribbon,{x:0,y:0,rotation:0}); }
  }
  hero.addEventListener('pointermove', event => {
    if (!gsap || paused || motion.matches || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box=hero.getBoundingClientRect();
      const x=(event.clientX-box.left)/box.width-.5;
      const y=(event.clientY-box.top)/box.height-.5;
      const d=`M-100 620 C180 ${840+y*100} ${280+x*130} ${80+y*150} 600 230 S${900+x*160} ${900+y*160} 1120 480 S1370 ${100-y*130} 1540 280`;
      gsap.to(paths,{attr:{d},duration:1.3,ease:'power2.out',overwrite:true});
    });
  });
  hero.addEventListener('pointerleave',()=>{if(gsap)gsap.to(paths,{attr:{d:original},duration:1.5,overwrite:true});});
  pause.addEventListener('click',()=>{
    paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';
    if(paused){entrance?.progress(1);settle();}update();
  });
  const links=[...document.querySelectorAll('.journey-rail a')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href')));
  const rail=document.querySelector('.journey-rail');
  let pending=false;
  function update(){
    const distance=document.documentElement.scrollHeight-innerHeight;
    rail.style.setProperty('--journey',distance>0?Math.max(0,Math.min(1,scrollY/distance)):0);
    let current=0;
    sections.forEach((section,index)=>{if(section.getBoundingClientRect().top<innerHeight*.48)current=index;});
    links.forEach((link,index)=>{if(index===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    if(gsap&&!motion.matches&&!paused){const p=Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/hero.offsetHeight));gsap.to(ribbon,{y:p*85,rotation:p*8,duration:.6,overwrite:'auto'});}
    pending=false;
  }
  motion.addEventListener('change',()=>{entrance?.progress(1);settle();update();});
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update);addEventListener('load',update);update();
})();
