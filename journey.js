(() => {
  'use strict';
  const hero=document.querySelector('.journey-scroll');
  if(!hero)return;
  const sticky=hero.querySelector('.journey-sticky');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 720px)').matches;
  if(reduce||!window.gsap||!window.ScrollTrigger){hero.classList.add('journey-static');return}

  gsap.registerPlugin(ScrollTrigger);
  /* v95: the mobile URL bar collapsing changes innerHeight mid-scroll, which
     re-ran the pin math and made the hero jump. Freeze both. */
  ScrollTrigger.config({ignoreMobileResize:true});
  let baseVH=innerHeight, baseW=innerWidth;
  addEventListener('resize',()=>{ if(innerWidth!==baseW){baseW=innerWidth;baseVH=innerHeight;ScrollTrigger.refresh();} },{passive:true});
  addEventListener('orientationchange',()=>{ setTimeout(()=>{baseW=innerWidth;baseVH=innerHeight;ScrollTrigger.refresh();},260); },{passive:true});
  const q=s=>hero.querySelector(s);
  const stage=q('.j5-stage');
  const layers=[...hero.querySelectorAll('.j5l')];
  const veil=q('.j5-veil');
  const brand=q('.journey-brand');const cue=q('.journey-scrollcue');
  const summitBeat=q('.journey-beat-forest'),waterBeat=q('.journey-beat-water'),finalCopy=q('.journey-final'),progress=q('.journey-progress span');
  const hasProgress=!!progress;
  const finalPieces=finalCopy.querySelectorAll('.eyebrow,h2,p,.hero-actions,.journey-trust');

  gsap.set([stage,...layers],{force3D:true,willChange:'transform'});
  gsap.set([brand,summitBeat,waterBeat,finalCopy],{force3D:true,willChange:'transform,opacity'});
  layers.filter(el=>el.dataset.flip==='1').forEach(el=>gsap.set(el,{scaleX:-1}));
  gsap.set([summitBeat,waterBeat,finalCopy],{autoAlpha:0,y:32});
  gsap.set(finalPieces,{autoAlpha:0,y:16});
  if(hasProgress)gsap.set(progress,{scaleY:0,transformOrigin:'top'});
  gsap.set(veil,{autoAlpha:0});

  /* RAISA SPEC v2 (Scene 0 -> Scene FINAL, both authored in Figma):
     the artwork is one tall true-aspect canvas. On load the camera sits on the
     top band (sky, condor, summit tips). As you scroll, the camera pans DOWN
     the canvas while every displaced layer RISES from its Scene-0 position
     into its Scene-FINAL position with a slight upward settle. Nothing fades. */

  /* stagger by depth: mountain band first, foreground last */
  const when={ 'cloud-b':0,'cotopaxi':2,'cloud-d':4,'cloud-e':6,'condor':0,'valley':6,'branch':8,'branch-2':10,'moss':10,'mossbranch':12,'monstera':14,'orchid-brom':16,'orchids-left':18 };

  const tl=gsap.timeline({defaults:{ease:'none',force3D:true},scrollTrigger:{trigger:hero,start:'top top',end:()=>`+=${Math.round(baseVH*2.6)}`,pin:hero,scrub:.5,anticipatePin:1,fastScrollEnd:true,invalidateOnRefresh:true}});

  tl.to({},{duration:100},0)
    .to(brand,{autoAlpha:0,y:-24,duration:8},6)
    .to(cue,{autoAlpha:0,y:14,duration:5},3)
    /* camera pans down the canvas across the whole pin */
    .fromTo(stage,{y:0},{y:()=>-(stage.offsetHeight-baseVH),duration:100,ease:'power1.inOut'},0);

  layers.forEach(el=>{
    const n=el.dataset.n;
    const dxp=parseFloat(el.dataset.dxp)||0, dyp=parseFloat(el.dataset.dyp)||0;
    if(!dxp&&!dyp)return;
    const isCondor=n==='condor';
    const isFg=['moss','mossbranch','monstera','orchid-brom','orchids-left','branch','branch-2'].includes(n);
    tl.fromTo(el,{xPercent:dxp,yPercent:dyp},{xPercent:0,yPercent:0,duration:isCondor?40:(isFg?40:58),ease:isCondor?'none':'power2.out'},when[n]??20);
  });

  tl.to(summitBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},10)
    .to(summitBeat,{autoAlpha:0,y:-22,duration:5},32)
    .to(waterBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},42)
    .to(waterBeat,{autoAlpha:0,y:-22,duration:5},62)
    .to(finalCopy,{autoAlpha:1,y:0,duration:8,ease:'power2.out',onStart:()=>window.__animateCounters&&window.__animateCounters([...hero.querySelectorAll('.journey-final [data-count]')])},76)
    .to(finalPieces,{autoAlpha:1,y:0,stagger:.6,duration:5,ease:'power2.out'},76)
    .to(finalCopy,{autoAlpha:1,duration:16},84)
    .fromTo(veil,{autoAlpha:0},{autoAlpha:1,duration:10,ease:'power2.in'},90);

  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    sticky.addEventListener('pointermove',event=>{
      const x=(event.clientX/innerWidth-.5)*2,y=(event.clientY/innerHeight-.5)*2;
      gsap.to(finalCopy,{x:x*5,y:y*3,duration:.8,force3D:true,overwrite:'auto'});
    },{passive:true});
  }
})();
