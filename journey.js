(() => {
  'use strict';
  const hero=document.querySelector('.journey-scroll');
  if(!hero)return;
  const sticky=hero.querySelector('.journey-sticky');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 720px)').matches;
  if(reduce||!window.gsap||!window.ScrollTrigger){hero.classList.add('journey-static');return}

  gsap.registerPlugin(ScrollTrigger);
  const q=s=>hero.querySelector(s);
  const stage=q('.j5-stage');
  const layers=[...hero.querySelectorAll('.j5l')];
  const brand=q('.journey-brand');const cue=q('.journey-scrollcue');
  const summitBeat=q('.journey-beat-forest'),waterBeat=q('.journey-beat-water'),finalCopy=q('.journey-final'),progress=q('.journey-progress span');
  const hasProgress=!!progress;
  const finalPieces=finalCopy.querySelectorAll('.eyebrow,h2,p,.hero-actions,.journey-trust');

  gsap.set([stage,...layers,brand,summitBeat,waterBeat,finalCopy],{force3D:true,willChange:'transform,opacity'});
  layers.filter(el=>el.dataset.flip==='1').forEach(el=>gsap.set(el,{scaleX:-1}));
  gsap.set([summitBeat,waterBeat,finalCopy],{autoAlpha:0,y:32});
  gsap.set(finalPieces,{autoAlpha:0,y:16});
  if(hasProgress)gsap.set(progress,{scaleY:0,transformOrigin:'top'});

  /* RAISA SPEC v2 (Scene 0 -> Scene FINAL, both authored in Figma):
     the artwork is one tall true-aspect canvas. On load the camera sits on the
     top band (sky, condor, summit tips). As you scroll, the camera pans DOWN
     the canvas while every displaced layer RISES from its Scene-0 position
     into its Scene-FINAL position with a slight upward settle. Nothing fades. */

  /* stagger by depth: mountain band first, foreground last */
  const when={ 'cloud-b':0,'cotopaxi':2,'cloud-d':4,'cloud-e':6,'valley':10,'branch':14,'branch-2':16,'monstera':20,'moss':22,'mossbranch':24,'condor':4,'orchid-brom':26,'orchids-left':28 };

  const tl=gsap.timeline({defaults:{ease:'none',force3D:true},scrollTrigger:{trigger:hero,start:'top top',end:()=>`+=${Math.round(innerHeight*2.6)}`,pin:hero,scrub:.7,anticipatePin:1,invalidateOnRefresh:true}});

  tl.to({},{duration:100},0)
    .to(brand,{autoAlpha:0,y:-24,duration:8},6)
    .to(cue,{autoAlpha:0,y:14,duration:5},3)
    /* camera pans down the canvas across the whole pin */
    .fromTo(stage,{y:0},{y:()=>-(stage.offsetHeight-innerHeight),duration:100,ease:'power1.inOut'},0);

  layers.forEach(el=>{
    const n=el.dataset.n;
    const dxp=parseFloat(el.dataset.dxp)||0, dyp=parseFloat(el.dataset.dyp)||0;
    if(!dxp&&!dyp)return;
    tl.fromTo(el,{xPercent:dxp,yPercent:dyp},{xPercent:0,yPercent:0,duration:58,ease:'power2.out'},when[n]??20);
  });

  tl.to(summitBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},10)
    .to(summitBeat,{autoAlpha:0,y:-22,duration:5},32)
    .to(waterBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},42)
    .to(waterBeat,{autoAlpha:0,y:-22,duration:5},62)
    .to(finalCopy,{autoAlpha:1,y:0,duration:8,ease:'power2.out',onStart:()=>window.__animateCounters&&window.__animateCounters([...hero.querySelectorAll('.journey-final [data-count]')])},76)
    .to(finalPieces,{autoAlpha:1,y:0,stagger:.6,duration:5,ease:'power2.out'},76)
    .to(finalCopy,{autoAlpha:1,duration:16},84)
    .to(stage,{filter:'blur(11px) brightness(.84) saturate(1.05)',duration:18,ease:'power1.inOut'},76);

  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    sticky.addEventListener('pointermove',event=>{
      const x=(event.clientX/innerWidth-.5)*2,y=(event.clientY/innerHeight-.5)*2;
      gsap.to(finalCopy,{x:x*5,y:y*3,duration:.8,force3D:true,overwrite:'auto'});
    },{passive:true});
  }
})();
