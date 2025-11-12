// Page init: handle loader fadeout and eager image load
window.addEventListener('load', ()=>{
  const loading = document.querySelector('.loading');
  const wrapper = document.querySelectorAll('.hidden');
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  // show main content
  wrapper.forEach(el=> el.classList.remove('hidden'));
  // eager load hero images for better first interaction
  imgs.forEach(img=>{ if(img.dataset && img.dataset.src){ img.src = img.dataset.src; } });
  // fade out spinner
  if(loading){ loading.classList.add('hidden'); setTimeout(()=> loading.remove(), 600); }
});