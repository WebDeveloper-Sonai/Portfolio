/* Sonai Das portfolio interactions, WebGL background and scroll animation */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice = matchMedia('(hover: none)').matches;
  document.documentElement.classList.add('js-motion');
  document.getElementById('year').textContent = new Date().getFullYear();

  // GSAP enhancement with CSS fallback.
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('#loadingBar', {width:'100%', ease:'none', scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.2}});
    gsap.from('.hero-copy > *', {opacity:0,y:24,stagger:.12,duration:.8,ease:'power2.out',delay:.15});
    gsap.from('.hero-visual', {opacity:0,rotateY:8,x:30,duration:1.1,ease:'power3.out',delay:.25});
    gsap.utils.toArray('.reveal').forEach(el => ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>el.classList.add('is-visible')}));
    gsap.utils.toArray('.skill').forEach(skill => ScrollTrigger.create({trigger:skill,start:'top 90%',once:true,onEnter:()=>gsap.to(skill.querySelector('.skill-track i'),{width:skill.dataset.level+'%',duration:1.2,ease:'power2.out'})}));
    gsap.to('.hero-visual',{y:-40,scrollTrigger:{trigger:'#home',start:'top top',end:'bottom top',scrub:.8}});
  } else {
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
    document.querySelectorAll('.skill-track i').forEach((bar,i)=>bar.style.width=document.querySelectorAll('.skill')[i].dataset.level+'%');
  }

  // Role text rotates with a low-motion fallback.
  const roles = ['Web Design','Data Analysis','Digital Services','Teaching & Learning','Hospitality'];
  const roleEl = document.getElementById('roleText');
  if(!reduceMotion){let idx=0;setInterval(()=>{idx=(idx+1)%roles.length;if(roleEl){roleEl.style.opacity=0;setTimeout(()=>{roleEl.textContent=roles[idx];roleEl.style.opacity=1},180)}},2800)}
  if(roleEl) roleEl.style.transition='opacity .18s';

  // Project filters and accessible Bootstrap modal.
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const filter=btn.dataset.filter;
    document.querySelectorAll('.work-card').forEach(card=>card.classList.toggle('filtered-out',filter!=='all'&&card.dataset.category!==filter));
  }));
  const modalEl=document.getElementById('projectModal');
  const modal=window.bootstrap?new bootstrap.Modal(modalEl):null;
  document.querySelectorAll('.project-detail').forEach(btn=>btn.addEventListener('click',()=>{
    document.getElementById('projectModalTitle').textContent=btn.dataset.title;
    document.getElementById('projectModalDescription').textContent=btn.dataset.description;
    const img=document.getElementById('modalImage');img.src=btn.dataset.image||'';img.style.display='';img.onerror=()=>img.style.display='none';
    document.getElementById('modalSlot').textContent='IMAGE SLOT · '+(btn.dataset.image||'project image');
    modal?.show();
  }));

  // Client-side form validation then compose via mailto. No backend data collection.
  const form=document.getElementById('contactForm'), feedback=document.getElementById('formFeedback');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();feedback.textContent='Please complete all fields and use a valid email address.';feedback.style.color='#e7bd54';return}
    const data=new FormData(form),name=data.get('name'),email=data.get('email'),subject=data.get('subject'),message=data.get('message');
    const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;
    feedback.textContent='Opening your email application…';feedback.style.color='#b8c5d7';
    window.location.href=`mailto:dassonai743425@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  // Close mobile navigation after a selection.
  document.querySelectorAll('#navMenu .nav-link').forEach(link=>link.addEventListener('click',()=>{const menu=document.getElementById('navMenu');if(menu.classList.contains('show')&&window.bootstrap)bootstrap.Collapse.getOrCreateInstance(menu).hide()}));
  // Pointer tilt (desktop only).
  if(!touchDevice&&!reduceMotion){
    document.querySelectorAll('.service-card,.work-card,.portrait-frame,.about-image-wrap').forEach(card=>{
      card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateZ(4px)`});
      card.addEventListener('mouseleave',()=>card.style.transform='');
    });
    const magnetic=document.querySelector('.magnetic');
    magnetic?.addEventListener('mousemove',e=>{const r=magnetic.getBoundingClientRect();magnetic.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});
    magnetic?.addEventListener('mouseleave',()=>magnetic.style.transform='');
  }

  // Three.js architectural lattice with lightweight mobile density.
  const canvas=document.getElementById('space-canvas');
  if(window.THREE){
    try{
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,100);
      camera.position.set(0,0,19);
      const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!touchDevice});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,touchDevice?1.25:1.8));
      renderer.setSize(innerWidth,innerHeight,false);
      const group=new THREE.Group();scene.add(group);
      const isSmall=innerWidth<768, count=isSmall?350:900;
      const positions=new Float32Array(count*3), sizes=new Float32Array(count);
      for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*34;positions[i*3+1]=(Math.random()-.5)*24;positions[i*3+2]=(Math.random()-.5)*22;sizes[i]=Math.random()}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
      const mat=new THREE.PointsMaterial({color:0x7c94b4,size:isSmall?.045:.055,transparent:true,opacity:.45,depthWrite:false});
      const particles=new THREE.Points(geo,mat);group.add(particles);
      // Sparse, fine linework: geometric framework, not a busy particle cloud.
      const lattice=new THREE.Group();
      const lineMat=new THREE.LineBasicMaterial({color:0x30496a,transparent:true,opacity:.2});
      for(let x=-5;x<=5;x++){const pts=[];pts.push(new THREE.Vector3(x*1.35,-8,-5));pts.push(new THREE.Vector3(x*1.35,8,-5));lattice.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat))}
      for(let y=-5;y<=5;y++){const pts=[new THREE.Vector3(-8,y*1.5,-5),new THREE.Vector3(8,y*1.5,-5)];lattice.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat))}
      group.add(lattice);
      const torus=new THREE.Mesh(new THREE.TorusGeometry(4.8,.008,6,100),new THREE.MeshBasicMaterial({color:0xc9a227,transparent:true,opacity:.12}));torus.rotation.x=1.1;torus.position.set(3,0,-3);group.add(torus);
      let mouseX=0,mouseY=0,scrollProgress=0;
      window.addEventListener('pointermove',e=>{mouseX=(e.clientX/innerWidth-.5)*.6;mouseY=(e.clientY/innerHeight-.5)*.35},{passive:true});
      window.addEventListener('scroll',()=>{scrollProgress=Math.min(1,window.scrollY/(document.body.scrollHeight-innerHeight||1) )},{passive:true});
      const clock=new THREE.Clock();
      const animate=()=>{if(!reduceMotion){const t=clock.getElapsedTime();particles.rotation.y=t*.018;particles.rotation.x=Math.sin(t*.08)*.025;lattice.rotation.y=Math.sin(t*.1)*.02;torus.rotation.z=t*.035;camera.position.x+=(mouseX-camera.position.x)*.025;camera.position.y+=(-mouseY-camera.position.y)*.025;camera.position.z=19-scrollProgress*1.8;camera.lookAt(0,0,0);group.rotation.y+=(mouseX*.12-group.rotation.y)*.02;group.rotation.x+=(mouseY*.1-group.rotation.x)*.02}renderer.render(scene,camera);if(!reduceMotion)requestAnimationFrame(animate)};
      animate();
      window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,touchDevice?1.25:1.8));renderer.setSize(innerWidth,innerHeight,false)},{passive:true});
    }catch(err){console.warn('WebGL background disabled:',err);canvas.style.display='none'}
  } else canvas.style.display='none';
})();
