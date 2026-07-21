(() => {
  'use strict';
  const hero=document.querySelector('.journey-scroll');
  if(!hero)return;
  const sticky=hero.querySelector('.journey-sticky');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 720px)').matches;
  if(reduce||mobile||!window.gsap||!window.ScrollTrigger){hero.classList.add('journey-static');return}

  gsap.registerPlugin(ScrollTrigger);
  // hydrate deferred scene 2/3 layers without blocking first paint
  const hydrate=()=>document.querySelectorAll('img.j3l[data-src]').forEach(im=>{im.src=im.dataset.src;im.removeAttribute('data-src')});
  if(document.readyState==='complete')hydrate();else addEventListener('load',hydrate,{once:true});
  const q=s=>hero.querySelector(s);
  const L=n=>hero.querySelector(`[data-l="${n}"]`);
  const brand=q('.journey-brand');
  const s1=q('.j3-s1'), s2=q('.j3-s2'), s3=q('.j3-s3');
  const s1peak=L('s1-peak'), s1cloud=L('s1-cloud'), s1shoulder=L('s1-shoulder'), s1sky=L('s1-sky'), s1title=L('s1-title');
  const s2base=L('s2-base'), s2ridgeL=L('s2-ridgeL'), s2ridgeR=L('s2-ridgeR'), s2river=L('s2-river');
  const s2cotopaxi=L('s2-cotopaxi'), s2c2=L('s2-cloud2'), s2c3=L('s2-cloud3'), s2c4=L('s2-cloud4'), s2condor=L('s2-condor'), s1c4=L('s1-cloud4');
  const s3base=L('s3-base'), s3frame=L('s3-frame'), s3philo=L('s3-philo'), s3canopy=L('s3-canopy'), s3brome=L('s3-brome'), s3branch=L('s3-branch');
  const summitBeat=q('.journey-beat-forest'), waterBeat=q('.journey-beat-water'), finalCopy=q('.journey-final'), progress=q('.journey-progress span');
  const finalPieces=finalCopy.querySelectorAll('.eyebrow,h2,p,.hero-actions,.journey-trust');

  const all=[s1,s2,s3,s1title,s1c4,s2condor,s3branch,s1peak,s1cloud,s1shoulder,s1sky,s2base,s2ridgeL,s2ridgeR,s2river,s2cotopaxi,s2c2,s2c3,s2c4,s3base,s3frame,s3philo,s3canopy,s3brome,brand,summitBeat,waterBeat,finalCopy];
  gsap.set(all,{force3D:true,willChange:'transform,opacity'});

  /* ===== Shreyas's Figma comps: scene1 (peak zoom) -> scene2 (valley) -> scene3 (jungle assembly) ===== */
  gsap.set([summitBeat,waterBeat,finalCopy],{autoAlpha:0,y:32});
  gsap.set(finalPieces,{autoAlpha:0,y:16});

  /* Scene 1 opens ZOOMED on the peak (his comp, peak right-center), pulls back to the exact Figma layout */
  gsap.set(s1,{opacity:1,scale:1.7,transformOrigin:'62% 40%'});
  gsap.set(s1cloud,{xPercent:-6,opacity:.9});
  gsap.set(s1title,{opacity:0,yPercent:14,scale:.96});
  gsap.set(s1c4,{xPercent:8,opacity:.85});

  /* Scene 2 waits hidden; its layers slightly displaced so they settle INTO his layout */
  gsap.set(s2,{opacity:0});
  gsap.set(s2base,{scale:1.08,transformOrigin:'50% 40%',filter:'blur(14px)'});
  gsap.set(s2cotopaxi,{yPercent:42,opacity:0});
  gsap.set(s2ridgeL,{xPercent:-34,yPercent:10,opacity:0});
  gsap.set(s2ridgeR,{xPercent:34,yPercent:10,opacity:0});
  gsap.set(s2river,{yPercent:30,opacity:0});
  gsap.set(s2c2,{xPercent:24,opacity:0});
  gsap.set(s2c3,{xPercent:18,yPercent:-10,opacity:0});
  gsap.set(s2c4,{xPercent:-24,opacity:0});
  gsap.set(s2condor,{xPercent:-30,yPercent:12,opacity:0,scale:.9});

  /* Scene 3 sprites dispersed off-frame, assemble at the end */
  gsap.set(s3,{opacity:0});
  gsap.set(s3base,{scale:1.12,transformOrigin:'50% 55%',filter:'blur(12px)'});
  gsap.set(s3frame,{scale:1.3,opacity:0});
  gsap.set(s3philo,{xPercent:-40,yPercent:-16,opacity:0});
  gsap.set(s3canopy,{xPercent:38,yPercent:-14,opacity:0});
  gsap.set(s3brome,{yPercent:-46,opacity:0});
  gsap.set(s3branch,{xPercent:-38,yPercent:24,opacity:0});
  gsap.set(progress,{scaleY:0,transformOrigin:'top'});

  const tl=gsap.timeline({defaults:{ease:'none',force3D:true},scrollTrigger:{trigger:hero,start:'top top',end:()=>`+=${Math.round(innerHeight*4.15)}`,pin:sticky,scrub:.85,anticipatePin:1,invalidateOnRefresh:true}});
  tl.to(progress,{scaleY:1,duration:100},0)

    /* Sequence 1 (0-40): pull back from the peak to his composed summit frame */
    .to(brand,{autoAlpha:0,y:-24,duration:6},8)
    .to(s1,{scale:1.0,duration:38,ease:'power1.inOut'},2)
    .to(s1cloud,{xPercent:4,duration:38,ease:'none'},2)
    .to(s1c4,{xPercent:-6,duration:38,ease:'none'},2)
    .to(s1title,{opacity:1,yPercent:0,scale:1,duration:10,ease:'power2.out'},6)
    .to(s1title,{yPercent:-8,duration:24,ease:'none'},16)
    .to(s1title,{opacity:0,duration:8,ease:'power1.in'},36)
    .to(summitBeat,{autoAlpha:1,y:0,duration:4,ease:'power2.out'},10)
    .to(summitBeat,{autoAlpha:1,duration:8},14)
    .to(summitBeat,{autoAlpha:0,y:-22,duration:4},24)

    /* Crossfade into Scene 2: valley layers settle into his exact layout */
    .to(s1,{opacity:0,scale:1.06,duration:12,ease:'power1.inOut'},40)
    .to(s2,{opacity:1,duration:10,ease:'power1.out'},38)
    .to(s2base,{scale:1.0,duration:20,ease:'power2.out'},38)
    .to(s2base,{filter:'blur(0px)',duration:16,ease:'power1.inOut'},46)
    .to(s2cotopaxi,{yPercent:0,opacity:1,duration:14,ease:'power3.out'},40)
    .to(s2ridgeL,{xPercent:0,yPercent:0,opacity:1,duration:14,ease:'power3.out'},43)
    .to(s2ridgeR,{xPercent:0,yPercent:0,opacity:1,duration:14,ease:'power3.out'},44)
    .to(s2river,{yPercent:0,opacity:1,duration:13,ease:'power3.out'},46)
    .to([s2c2,s2c3,s2c4],{xPercent:0,yPercent:0,opacity:1,duration:13,ease:'power2.out'},47)
    .to(s2condor,{xPercent:0,yPercent:0,opacity:1,scale:1,duration:15,ease:'power2.out'},48)
    .to(s2condor,{yPercent:-3,xPercent:2,duration:20,ease:'none'},63)
    .to([s2c2,s2c3],{xPercent:3,duration:22,ease:'none'},48)
    .to(s2c4,{xPercent:-3,duration:22,ease:'none'},48)
    .to(waterBeat,{autoAlpha:1,y:0,duration:4,ease:'power2.out'},48)
    .to(waterBeat,{autoAlpha:1,duration:8},52)
    .to(waterBeat,{autoAlpha:0,y:-22,duration:4},60)

    /* Scene 3: jungle assembles sprite by sprite into his comp */
    .to(s2,{opacity:0,scale:1.05,duration:12,ease:'power1.inOut'},64)
    .to(s3,{opacity:1,duration:9,ease:'power1.out'},62)
    .to(s3base,{scale:1.0,duration:18,ease:'power2.out'},62)
    .to(s3base,{filter:'blur(0px)',duration:14,ease:'power1.inOut'},68)
    .to(s3frame,{scale:1.0,opacity:1,duration:16,ease:'power2.out'},64)
    .to(s3philo,{xPercent:0,yPercent:0,opacity:1,duration:15,ease:'power2.out'},66)
    .to(s3canopy,{xPercent:0,yPercent:0,opacity:1,duration:15,ease:'power2.out'},68)
    .to(s3brome,{yPercent:0,opacity:1,duration:14,ease:'power2.out'},70)
    .to(s3branch,{xPercent:0,yPercent:0,opacity:1,duration:15,ease:'power3.out'},69)
    .to(finalCopy,{autoAlpha:1,y:0,duration:7,ease:'power2.out'},80)
    .to(finalPieces,{autoAlpha:1,y:0,stagger:.5,duration:4.5,ease:'power2.out'},80)
    .to(finalCopy,{autoAlpha:1,duration:14},88);

  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    sticky.addEventListener('pointermove',event=>{
      const x=(event.clientX/innerWidth-.5)*2,y=(event.clientY/innerHeight-.5)*2;
      gsap.to(finalCopy,{x:x*5,y:y*3,duration:.8,force3D:true,overwrite:'auto'});
    },{passive:true});
  }
})();
