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
  const layers=d=>[...hero.querySelectorAll(`.j4l[data-d="${d}"]`)];
  const brand=q('.journey-brand');
  const summitBeat=q('.journey-beat-forest'),waterBeat=q('.journey-beat-water'),finalCopy=q('.journey-final'),progress=q('.journey-progress span');
  const finalPieces=finalCopy.querySelectorAll('.eyebrow,h2,p,.hero-actions,.journey-trust');

  const sky=layers('sky'), anchor=layers('anchor'), far=layers('far'), mid=layers('mid'), mid2=layers('mid2'), near=layers('near'), near2=layers('near2'), front=layers('front');
  const all=[...sky,...anchor,...far,...mid,...mid2,...near,...near2,...front,brand,summitBeat,waterBeat,finalCopy];
  gsap.set(all,{force3D:true,willChange:'transform,opacity'});

  /* RAISA SPEC: one environment, nothing fades between scenes.
     Load: sky + clouds + condor + Cotopaxi visible. Scroll: remaining
     layers of the SAME landscape rise at their own speeds into place.
     Final frame = the full Scene FINAL composition. */
  gsap.set([summitBeat,waterBeat,finalCopy],{autoAlpha:0,y:32});
  gsap.set(finalPieces,{autoAlpha:0,y:16});
  gsap.set(far,  {y:'62vh'});
  gsap.set(mid,  {y:'80vh'});
  gsap.set(mid2, {y:'90vh'});
  gsap.set(near, {y:'100vh'});
  gsap.set(near2,{y:'112vh'});
  gsap.set(front,{y:'124vh'});
  gsap.set(progress,{scaleY:0,transformOrigin:'top'});

  const tl=gsap.timeline({defaults:{ease:'none',force3D:true},scrollTrigger:{trigger:hero,start:'top top',end:()=>`+=${Math.round(innerHeight*2.3)}`,pin:sticky,scrub:.7,anticipatePin:1,invalidateOnRefresh:true}});
  tl.to(progress,{scaleY:1,duration:100},0)
    .to(brand,{autoAlpha:0,y:-24,duration:8},6)
    .to(sky,   {yPercent:-2,duration:96,ease:'none'},2)
    .to(anchor,{y:'-4vh',duration:96,ease:'none'},2)
    .to(far,  {y:0,duration:52,ease:'power1.out'},4)
    .to(mid,  {y:0,duration:56,ease:'power1.out'},12)
    .to(mid2, {y:0,duration:54,ease:'power1.out'},20)
    .to(near, {y:0,duration:56,ease:'power1.out'},28)
    .to(near2,{y:0,duration:54,ease:'power1.out'},36)
    .to(front,{y:0,duration:56,ease:'power1.out'},42)
    .to(summitBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},8)
    .to(summitBeat,{autoAlpha:0,y:-22,duration:5},30)
    .to(waterBeat,{autoAlpha:1,y:0,duration:5,ease:'power2.out'},40)
    .to(waterBeat,{autoAlpha:0,y:-22,duration:5},62)
    .to(finalCopy,{autoAlpha:1,y:0,duration:8,ease:'power2.out'},78)
    .to(finalPieces,{autoAlpha:1,y:0,stagger:.6,duration:5,ease:'power2.out'},78)
    .to(finalCopy,{autoAlpha:1,duration:14},86);

  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    sticky.addEventListener('pointermove',event=>{
      const x=(event.clientX/innerWidth-.5)*2,y=(event.clientY/innerHeight-.5)*2;
      gsap.to(finalCopy,{x:x*5,y:y*3,duration:.8,force3D:true,overwrite:'auto'});
    },{passive:true});
  }
})();
