// Lightweight tilt effect for cards
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  const maxTilt = 8; // deg
  const elements = [
    ...document.querySelectorAll('.skill-item'),
    ...document.querySelectorAll('.photography-item'),
    ...document.querySelectorAll('.mini-program-item')
  ];

  elements.forEach(el=>{
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', (e)=>{
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * maxTilt;
      const ry = (px - 0.5) * 2 * maxTilt;
      el.style.transition = 'transform 120ms ease-out';
      el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', ()=>{
      el.style.transition = 'transform 300ms ease';
      el.style.transform = '';
    });
  });
})();