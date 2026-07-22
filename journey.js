(() => {
  'use strict';
  const hero=document.querySelector('.journey-scroll');
  if(!hero)return;
  const sticky=hero.querySelector('.journey-sticky');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 720px)').matches;
  if(reduce||mobile||!window.gsap||!window.ScrollTrigger){hero.classList.add('journey-static');return}

  gsap.registerPlugin(ScrollTrigger);
  const q=s=>hero.querySelector(s);
  const stage=q('.j5-stage');
  const layers=[...hero.querySelectorAll('.j5l')];
  const brand=q('.journey-brand');
  const summitBeat=q('.journey-beat-forest'),waterBeat=q('.journey-beat-water'),finalCopy=q('.journey-final'),progress=q('.journey-progress span');
  const finalPieces=finalCopy.querySelectorAll('.eyebrow,h2,p,.hero-actions,.journey-trust');

  gsap.set([stage,...layers,brand,summitBeat,waterBeat,finalCopy],{force3D:true,willChange:'transform,opacity'});
  gsap.set([summitBeat,waterBeat,finalCopy],{autoAlpha:0,y:32});
  gsap.set(finalPieces,{autoAlpha:0,y:16});
  gsap.set(progress,{scaleY:0,transformOrigin:'top'});

  /* RAISA SPEC v2 (Scene 0 -> Scene FINAL, both authored in Figma):
     the artwork is one tall true-aspect canvas. On load the camera sits on the
     top band (sky, condor, summit tips). As you scroll, the camera pans DOWN
     the canvas while every displaced layer RISES from its Scene-0 position
     into its Scene-FINAL position with a slight upward settle. Nothing fades. */
  const place=()=>{
    const sw=stage.offsetWidth, sh=stage.offsetHeight;
    layers.forEach(el=>{
      const dx=parseFloat(el.dataset.dx)||0, dy=parseFloat(el.dataset.dy)||0;
      el.__dx=dx/100*sw; el.__dy=dy/100*sh;
    });
  };
  place();

  /* stagger by depth: mountain band first, foreground last */
  const when={ 'cotopaxi-cutout':4,'condor-cloud':6,'cloud-1':7,'cloud-2':8,
    'glacial-valley':16,'hill-left':20,'river':26,'ridge-a':30,'ridge-b':34,
    'moss-foreground':44,'monstera':48,'branch':52,'orchid-brom':56,'orchids-left':58 };

  const tl=gsap.timeline({defaults:{ease:'none',force3D:true},scrollTrigger:{trigger:hero,start:'top top',end:()=>`+=${Math.round(innerHeight*2.6)}`,pin:sticky,scrub:.7,anticipatePin:1,invalidateOnRefresh:true,onRefresh:place}});

  tl.to(progress,{scaleY:1,duration:100},0)
    .to(brand,{autoAlpha:0,y:-24,duration:8},6)
    /* camera pans down the canvas across the whole pin */
    .fromTo(stage,{y:0},{y:()=>-(stage.offsetHeight-innerHeight),duration:100,ease:'power1.inOut'},0);

  layers.forEach(el=>{
    const n=el.dataset.n;
    if(!(el.__dx||el.__dy))return;
    tl.fromTo(el,{x:()=>el.__dx,y:()=>el.__dy},{x:0,y:0,duration:34,ease:'back.out(1.15)'},when[n]??20);
  });

  tl.to(summitBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},10)
    .to(summitBeat,{autoAlpha:0,y:-22,duration:5},32)
    .to(waterBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},42)
    .to(waterBeat,{autoAlpha:0,y:-22,duration:5},62)
    .to(finalCopy,{autoAlpha:1,y:0,duration:8,ease:'power2.out'},76)
    .to(finalPieces,{autoAlpha:1,y:0,stagger:.6,duration:5,ease:'power2.out'},76)
    .to(finalCopy,{autoAlpha:1,duration:16},84);

  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    sticky.addEventListener('pointermove',event=>{
      const x=(event.clientX/innerWidth-.5)*2,y=(event.clientY/innerHeight-.5)*2;
      gsap.to(finalCopy,{x:x*5,y:y*3,duration:.8,force3D:true,overwrite:'auto'});
    },{passive:true});
  }
})();
