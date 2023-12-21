const bannerSlides = document.querySelector('.banner-slides');
const prevButton = document.querySelector('.banner-prev');
const nextButton = document.querySelector('.banner-next');
let slideIndex = 0;

var change;

function changeBanner(){
    slideIndex = (slideIndex === bannerSlides.children.length - 1) ? 0 : (slideIndex + 1);
    updateSlide();
}

prevButton.addEventListener('click', () => {
  slideIndex = (slideIndex === 0) ? (bannerSlides.children.length - 1) : (slideIndex - 1);
  updateSlide();
  // 停止当前的自动换页定时器
  clearInterval(change);

  // 重新设置自动换页的定时器
  change = setInterval(changeBanner, 5000);
});

nextButton.addEventListener('click', () => {
  slideIndex = (slideIndex === bannerSlides.children.length - 1) ? 0 : (slideIndex + 1);
  updateSlide();
  // 停止当前的自动换页定时器
  clearInterval(change);

  // 重新设置自动换页的定时器
  change = setInterval(changeBanner, 5000);
});

function updateSlide() {
  bannerSlides.style.transform = `translateX(-${slideIndex * 100}%)`;
}

change = setInterval(changeBanner, 5000);
