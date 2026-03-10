// IntersectionObserver scroll reveal
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return; // Respect user preference

  const targets = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    targets.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const container = entry.target;
        container.classList.add('is-visible');

        // stagger for grid children
        const grids = container.querySelectorAll('.skills-grid, .photography-grid, .mini-program-grid');
        grids.forEach(grid=>{
          const children = Array.from(grid.children);
          children.forEach((child,i)=>{
            child.classList.add('stagger-item');
            child.style.transitionDelay = `${Math.min(i*60, 600)}ms`;
          });
          // trigger next frame to apply transition
          requestAnimationFrame(()=>{
            children.forEach(ch=> ch.classList.add('is-revealed'));
          });
        });
        obs.unobserve(container);
      }
    });
  },{ threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
  targets.forEach(el=>obs.observe(el));
})();