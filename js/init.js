// Progressive loader: track image loading and drive a sleek progress bar
(function(){
  const overlay = document.querySelector('.loading');
  if(!overlay) return;
  const percentEl = overlay.querySelector('.loader-percent span');
  const barInner = overlay.querySelector('.loader-bar-inner');
  const contentWrappers = document.querySelectorAll('body .hidden');

  let total = 0;
  let loaded = 0;
  let visualP = 0; // visual progress (eased)

  function setProgress(p){
    const clamped = Math.max(0, Math.min(100, p));
    visualP = clamped;
    if(barInner) barInner.style.setProperty('--p', (clamped/100).toFixed(3));
    if(percentEl) percentEl.textContent = Math.round(clamped).toString();
    // 高级徽章的单次“擦亮”效果：进度接近完成时触发一次
    if(!setProgress._sheen && clamped >= 86){
      const badge = overlay.querySelector('.orb-badge');
      if(badge){ badge.classList.add('sheen'); }
      setProgress._sheen = true;
    }
  }

  // collect images as primary loading signal
  const imgs = Array.from(document.images || []);
  total = imgs.length || 6; // fallback to 6 steps when no images

  function onOne(){
    loaded++;
    const base = (loaded/Math.max(1,total))*90; // cap at 90% before window.load
    // small easing towards base
    setProgress(Math.max(visualP, base));
  }

  imgs.forEach(img=>{
    if(img.complete){ onOne(); }
    else {
      img.addEventListener('load', onOne, { once: true });
      img.addEventListener('error', onOne, { once: true });
    }
  });

  // safety timer to avoid being stuck on very slow assets
  const safeties = setInterval(()=>{
    // nudge progress slowly up to 85%
    if(visualP < 85) setProgress(visualP + 1.2);
  }, 180);

  // finalize on window load
  window.addEventListener('load', ()=>{
    clearInterval(safeties);
    // eager load images with data-src for later interactions
    document.querySelectorAll('img[loading="lazy"]').forEach(img=>{
      if(img.dataset && img.dataset.src){ img.src = img.dataset.src; }
    });

    const start = performance.now();
    const duration = 380; // smooth tail
    function animate(){
      const t = (performance.now() - start)/duration;
      const eased = t>=1 ? 1 : (1 - Math.pow(1 - t, 3)); // easeOutCubic
      setProgress(visualP + (100 - visualP)*eased);
      if(t < 1) requestAnimationFrame(animate);
      else finish();
    }
    requestAnimationFrame(animate);

    function finish(){
      // show main content
      contentWrappers.forEach(el=> el.classList.remove('hidden'));
      // fade out overlay using existing .hidden animation
      if(overlay){ overlay.classList.add('hidden'); setTimeout(()=> overlay.remove(), 600); }
    }
  });
})();