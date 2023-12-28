const bannerSlides = document.querySelector('.banner-slides');
const prevButton = document.querySelector('.banner-prev');
const nextButton = document.querySelector('.banner-next');
let slideIndex = 0;

var change;

function changeBanner() {
  slideIndex = (slideIndex === bannerSlides.children.length - 1) ? 0 : (slideIndex + 1);
  updateSlide();
}

prevButton.addEventListener('click', () => {
  slideIndex = (slideIndex === 0) ? (bannerSlides.children.length - 1) : (slideIndex - 1);
  updateSlide();
  // 停止当前的自动换页定时器
  clearInterval(change);

  // 重新设置自动换页的定时器
  change = setInterval(changeBanner, 10000);
});

nextButton.addEventListener('click', () => {
  slideIndex = (slideIndex === bannerSlides.children.length - 1) ? 0 : (slideIndex + 1);
  updateSlide();
  // 停止当前的自动换页定时器
  clearInterval(change);

  // 重新设置自动换页的定时器
  change = setInterval(changeBanner, 10000);
});

function updateSlide() {
  bannerSlides.style.transform = `translateX(-${slideIndex * 100}%)`;
}

// 添加触摸事件处理程序
bannerSlides.addEventListener('touchstart', handleTouchStart, false);
bannerSlides.addEventListener('touchmove', handleTouchMove, false);

let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX;
}

bannerSlides.addEventListener('touchend', handleTouchEnd, false);

function handleTouchEnd() {
  // 检测手势方向
  if (touchStartX !== 0 && touchEndX !== 0) {
    if (touchStartX - touchEndX > 50) {
      // 向左滑动，下一张幻灯片
      slideIndex = (slideIndex === bannerSlides.children.length - 1) ? 0 : (slideIndex + 1);
    } else if (touchStartX - touchEndX < -50) {
      // 向右滑动，上一张幻灯片
      slideIndex = (slideIndex === 0) ? (bannerSlides.children.length - 1) : (slideIndex - 1);
    } else {
      // 没有滑动足够远，不做任何操作
      return;
    }
  }

  updateSlide();

  // 停止当前的自动换页定时器
  clearInterval(change);

  // 重新设置自动换页的定时器
  change = setInterval(changeBanner, 10000);
}

// change = setInterval(changeBanner, 10000);
