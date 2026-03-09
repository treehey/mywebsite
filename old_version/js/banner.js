const bannerSlides = document.querySelector('.banner-slides');
const prevButton = document.querySelector('.banner-prev');
const nextButton = document.querySelector('.banner-next');
const dotsContainer = document.querySelector('.banner-dots');

if (bannerSlides) {
  let autoTimer;
  const TRANSITION = 'transform 0.5s ease-in-out';
  const slides = Array.from(bannerSlides.children);
  const total = slides.length;

  // Create clones for infinite loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[total - 1].cloneNode(true);
  bannerSlides.insertBefore(lastClone, bannerSlides.firstChild);
  bannerSlides.appendChild(firstClone);

  // Current index within augmented list
  let index = 1; // start at first real slide
  bannerSlides.style.transform = `translateX(-${index * 100}%)`;

  // Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'banner-dot' + (i === 0 ? ' is-active' : '');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `第 ${i + 1} 张`);
      dot.addEventListener('click', () => {
        goTo(i + 1);
        restartAuto();
      });
      dotsContainer.appendChild(dot);
    }
    // moving indicator
    const indicator = document.createElement('span');
    indicator.className = 'banner-dot-indicator';
    dotsContainer.appendChild(indicator);

    function indicatorToActive() {
      const dots = dotsContainer.querySelectorAll('.banner-dot');
      const active = (index - 1 + total) % total;
      const dot = dots[active];
      if(!dot) return;
      // Use offset positions relative to container to avoid transform-induced drift
      const x = dot.offsetLeft + dot.offsetWidth / 2;
      const y = dot.offsetTop + dot.offsetHeight / 2;
      const iw = indicator.getBoundingClientRect().width || indicator.offsetWidth;
      const ih = indicator.getBoundingClientRect().height || indicator.offsetHeight;
      indicator.style.transform = `translate(${x - iw/2}px, ${y - ih/2}px)`;
    }

    // Initial position
    requestAnimationFrame(()=> indicatorToActive());

    // Reposition on resize
    let resizeTimer;
    window.addEventListener('resize', ()=>{
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(indicatorToActive, 100);
    });

    // Hook into setters
    const _setActiveDot = setActiveDot;
    setActiveDot = function(){
      _setActiveDot();
      indicatorToActive();
    }
  }

  function setActiveDot() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.banner-dot');
    dots.forEach(d => d.classList.remove('is-active'));
    const active = (index - 1 + total) % total; // map [1..total] => [0..total-1]
    if (dots[active]) dots[active].classList.add('is-active');
  }

  function goTo(newIndex) {
    index = newIndex;
    bannerSlides.style.transition = TRANSITION;
    bannerSlides.style.transform = `translateX(-${index * 100}%)`;
    // update dots & indicator immediately for Apple-like sync
    setActiveDot();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // Handle seamless jump on clone edges
  bannerSlides.addEventListener('transitionend', () => {
    const childrenCount = bannerSlides.children.length; // total + 2
    if (index === childrenCount - 1) { // moved to firstClone (after last real)
      // jump to first real
      bannerSlides.style.transition = 'none';
      index = 1;
      bannerSlides.style.transform = `translateX(-${index * 100}%)`;
      // force reflow then restore transition
      void bannerSlides.offsetWidth;
      bannerSlides.style.transition = TRANSITION;
    } else if (index === 0) { // moved to lastClone (before first real)
      bannerSlides.style.transition = 'none';
      index = total;
      bannerSlides.style.transform = `translateX(-${index * 100}%)`;
      void bannerSlides.offsetWidth;
      bannerSlides.style.transition = TRANSITION;
    }
    setActiveDot();
  });

  // Buttons
  if (prevButton) prevButton.addEventListener('click', () => { prev(); restartAuto(); });
  if (nextButton) nextButton.addEventListener('click', () => { next(); restartAuto(); });

  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;
  bannerSlides.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, false);
  bannerSlides.addEventListener('touchmove', (e) => { touchEndX = e.touches[0].clientX; }, false);
  bannerSlides.addEventListener('touchend', () => {
    if (touchStartX !== 0 && touchEndX !== 0) {
      const delta = touchStartX - touchEndX;
      if (delta > 50) next();
      else if (delta < -50) prev();
      restartAuto();
    }
    touchStartX = touchEndX = 0;
  }, false);

  function auto() { autoTimer = setInterval(() => next(), 10000); }
  function restartAuto() { if (autoTimer) clearInterval(autoTimer); auto(); }
  auto();
}
