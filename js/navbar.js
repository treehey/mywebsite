var lastScrollY = 0;
window.addEventListener("scroll", function () {
  var navbar = document.querySelector(".bar");
  
  var currentScrollY = window.scrollY;
  if (currentScrollY > 50) {
    navbar.classList.remove("bar-fixed");
    navbar.classList.add("bar-fixed");

    // 判断滚动方向
    if (currentScrollY > lastScrollY) {
      // 向下滚动，隐藏导航栏
      navbar.classList.add('bar-hidden');
    } else {
      // 向上滚动，显示导航栏
      navbar.classList.remove('bar-hidden');
    }

    // 更新上次滚动位置
    lastScrollY = currentScrollY;

  } else {
    navbar.classList.remove("bar-fixed");
  }

});

// script.js

window.addEventListener('scroll', function () {
  var sections = document.querySelectorAll('section');
  var main = document.querySelector('main');
  var bar = document.querySelector('nav.bar');
  var currentSection = '';
  sections.forEach(function (section) {
    if (section.getAttribute('class') == 'banner') {
      return
    }
    var sectionTop = section.offsetTop;
    var mainTop = main.offsetTop;
    var barHeight = bar.offsetHeight + 5;
    var sectionHeight = section.offsetHeight;
    var pageHeight = document.body.offsetHeight;
    // console.log(window.scrollY + window.innerHeight,pageHeight)
    if (window.scrollY >= mainTop - barHeight) {
      if (window.scrollY >= sectionTop + mainTop - barHeight - window.innerHeight / 2.8 && window.scrollY < sectionTop + mainTop + sectionHeight / 1) {
        currentSection = section.getAttribute('id');
      }
      if (window.scrollY >= pageHeight) {
        currentSection = 'contact';
      }
    }
  });

  var navLinks = document.querySelectorAll('nav ul li a');

  navLinks.forEach(function (link) {
    link.classList.remove('active')

    if (link.getAttribute('href').slice(1) === currentSection) {
      link.classList.add('active');
    }
  });
  // navLinks[0].classList.add('active')
});

function showLanguageMenu() {
  var dropdown = document.querySelector('.language-menu');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';

    // 如果需要关闭下拉菜单，可以监听窗口点击事件
    window.addEventListener('click', function(e) {
        if (!e.target.closest('.language-select') && !e.target.closest('.language-menu')) {
            dropdown.style.display = 'none';
        }
    });
}