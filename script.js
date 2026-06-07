document.addEventListener('DOMContentLoaded', ()=>{
  const startBtn = document.getElementById('startBtn');
  const letter = document.getElementById('letter');
  const landing = document.getElementById('landing');
  const final = document.getElementById('final');
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const backToLanding = document.getElementById('backToLanding');
  const restart = document.getElementById('restart');

  // Smooth transition from landing to letter
  startBtn.addEventListener('click', ()=>{
    landing.classList.add('hidden');
    letter.scrollIntoView({behavior:'smooth'});
  });
  backToLanding.addEventListener('click', ()=>{
    letter.scrollIntoView({behavior:'smooth'});
    setTimeout(()=>{landing.classList.remove('hidden');window.scrollTo({top:0})},300);
  });

  // Reveal on scroll
  const typed = new Set();
  function typeWrite(el, text, speed=28){
    if(typed.has(el)) return;
    typed.add(el);
    el.textContent = '';
    el.classList.add('typing');
    // ensure element is visible while typing
    el.style.opacity = 1;
    el.style.transform = 'none';
    let i=0;
    const id = setInterval(()=>{
      el.textContent += text.charAt(i);
      i++;
      if(i>=text.length){
        clearInterval(id);
        el.classList.remove('typing');
        el.classList.add('visible');
      }
    }, speed);
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        const el = ent.target;
        // if element should be typewritten, prepare and start typing (don't add visible yet)
        if(el.classList.contains('typewrite')){
          if(typed.has(el)) return;
          const text = (el.dataset.origText !== undefined) ? el.dataset.origText : (el.textContent||'').trim();
          el.dataset.origText = text;
          el.textContent = '';
          // make typing visible immediately (override reveal opacity)
          el.style.opacity = 1;
          el.style.transform = 'none';
          const delay = Number(el.dataset.delay) || 0;
          setTimeout(()=> typeWrite(el, text), delay + 80);
        } else {
          // reveal normally
          el.classList.add('visible');
        }
      }
    })
  },{threshold:0.12});
  document.querySelectorAll('.reveal, .typewrite').forEach(el=>io.observe(el));

  // spawn floating hearts
  const heartsRoot = document.getElementById('floating-hearts-root');
  function spawnHeart(){
    const h = document.createElement('div');
    h.className='heart';
    h.textContent = ['💖','💘','❤️','💕'][Math.floor(Math.random()*4)];
    const size = 12 + Math.random()*28;
    h.style.left = Math.random()*100 + '%';
    h.style.bottom = (-5 + Math.random()*18) + 'vh';
    h.style.fontSize = size + 'px';
    h.style.opacity = 0.95;
    // vary animation duration and a slight negative delay so they appear scattered
    h.style.animationDuration = (6 + Math.random()*6) + 's';
    h.style.animationDelay = (-1 * Math.random()*3) + 's';
    heartsRoot.appendChild(h);
    setTimeout(()=>{ h.remove() }, 10000);
  }
  setInterval(spawnHeart, 700);

  // evasive "no :(" button: repels from the cursor and resists clicks
  function makeNoEvasive(btn){
    const parent = btn.parentElement || btn.closest('.container') || document.body;
    const pstyle = getComputedStyle(parent);
    if(pstyle.position === 'static') parent.style.position = 'relative';
    btn.setAttribute('tabindex','-1');
    // initialize position to center of the parent area
    const init = ()=>{
      const rect = parent.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      const startLeft = Math.max(6, (rect.width - bRect.width)/2);
      const startTop = Math.max(6, (rect.height - bRect.height)/2);
      btn.style.position = 'absolute';
      btn.style.left = startLeft + 'px';
      btn.style.top = startTop + 'px';
      btn.style.transition = 'left 160ms ease, top 160ms ease, transform 120ms ease';
    };
    init();

    function repelFromPoint(clientX, clientY){
      const rect = parent.getBoundingClientRect();
      const bx = parseFloat(btn.style.left) || 0;
      const by = parseFloat(btn.style.top) || 0;
      const btnCenterX = rect.left + bx + btn.offsetWidth/2;
      const btnCenterY = rect.top + by + btn.offsetHeight/2;
      const dx = btnCenterX - clientX;
      const dy = btnCenterY - clientY;
      const dist = Math.hypot(dx, dy);
      const threshold = Math.max(80, Math.min(140, rect.width * 0.18));
      if(dist < threshold){
        const strength = (1 - (dist/threshold)) * 1.2; // stronger when closer
        const move = Math.max(40, rect.width * 0.2) * strength;
        const nx = (dx / (dist || 1));
        const ny = (dy / (dist || 1));
        let newLeft = (parseFloat(btn.style.left) || 0) + nx * move;
        let newTop  = (parseFloat(btn.style.top)  || 0) + ny * move;
        // clamp inside parent
        newLeft = Math.max(4, Math.min(newLeft, rect.width - btn.offsetWidth - 4));
        newTop  = Math.max(4, Math.min(newTop, rect.height - btn.offsetHeight - 4));
        // keep away from YESS button if it exists
        if(yesBtn){
          const yesRect = yesBtn.getBoundingClientRect();
          const yesLeft = yesRect.left - rect.left;
          const yesTop = yesRect.top - rect.top;
          const yesRight = yesLeft + yesRect.width;
          const yesBottom = yesTop + yesRect.height;
          const overlapX = newLeft < yesRight && (newLeft + btn.offsetWidth) > yesLeft;
          const overlapY = newTop < yesBottom && (newTop + btn.offsetHeight) > yesTop;
          if(overlapX && overlapY){
            if(newLeft + btn.offsetWidth/2 < yesLeft + yesRect.width/2){
              newLeft = Math.max(4, yesLeft - btn.offsetWidth - 8);
            } else {
              newLeft = Math.min(rect.width - btn.offsetWidth - 4, yesRight + 8);
            }
            if(newTop + btn.offsetHeight/2 < yesTop + yesRect.height/2){
              newTop = Math.max(4, yesTop - btn.offsetHeight - 8);
            } else {
              newTop = Math.min(rect.height - btn.offsetHeight - 4, yesBottom + 8);
            }
          }
        }
        btn.style.left = newLeft + 'px';
        btn.style.top  = newTop + 'px';
      }
    }

    // on mouse move in parent area, repel
    parent.addEventListener('mousemove', (ev)=>{ repelFromPoint(ev.clientX, ev.clientY); });
    // also react to touch
    parent.addEventListener('touchmove', (ev)=>{ if(ev.touches && ev.touches[0]) repelFromPoint(ev.touches[0].clientX, ev.touches[0].clientY); }, {passive:true});

    // prevent clicking or focusing
    btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); });
    btn.addEventListener('mousedown', (e)=>{ e.preventDefault(); e.stopPropagation(); });
    btn.addEventListener('touchstart', (e)=>{ e.preventDefault(); e.stopPropagation(); });
  }
  // replace previous listeners with evasive behavior
  try{ makeNoEvasive(noBtn); }catch(e){/* ignore if button missing */}

  // YESS -> final page with effects
  yesBtn.addEventListener('click', ()=>{
    document.getElementById('letter').classList.add('hidden');
    final.classList.remove('hidden');
    final.scrollIntoView({behavior:'smooth'});
    playFinalEffects();
  });

  restart && restart.addEventListener('click', ()=>{
    final.classList.add('hidden');
    landing.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  });

  // Final page confetti/hearts
  function playFinalEffects(){
    const out = document.getElementById('final-effects');
    // spawn many small falling hearts and words
    for(let i=0;i<30;i++){
      const e = document.createElement('div');
      e.className='heart';
      e.textContent = ['💖','❤️','💕','✨'][Math.floor(Math.random()*4)];
      e.style.left = (Math.random()*100) + '%';
      e.style.bottom = (-5 + Math.random()*30) + 'vh';
      e.style.fontSize = (10+Math.random()*36)+'px';
      e.style.animationDuration = (4+Math.random()*4)+'s';
      out.appendChild(e);
      setTimeout(()=>e.remove(),7000);
    }
    // little repeating words
    const motto = document.querySelector('.motto');
    if(motto){
      const t = document.createElement('div');
      t.style.position='absolute';t.style.top='18%';t.style.left='8%';t.style.opacity=0.06;fontSize='20px';
      t.textContent = 'forever • always you • my favorite person • forever • always you';
      document.getElementById('final').appendChild(t);
      setTimeout(()=>t.remove(),9000);
    }
  }

  // small initial reveal for header elements
  setTimeout(()=>{document.querySelectorAll('.heading,.lead').forEach(el=>el.classList.add('visible'))},300);

});
