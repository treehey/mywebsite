window.addEventListener("scroll", function() {
    var navbar = document.querySelector(".bar");
    if (window.scrollY > 50) {
      navbar.classList.remove("bar-fixed");
      navbar.classList.add("bar-fixed");
    } else {
      navbar.classList.remove("bar-fixed");
    }
  });

// script.js

window.addEventListener('scroll', function() {
  var sections = document.querySelectorAll('section');
  var main = document.querySelector('main');
  var bar = document.querySelector('nav.bar');
  var currentSection = '';
  sections.forEach(function(section) {
    if(section.getAttribute('class')=='banner'){
      return
    }
    var sectionTop = section.offsetTop;
    var mainTop = main.offsetTop;
    var barHeight = bar.offsetHeight+5;
    var sectionHeight = section.offsetHeight;
    var pageHeight = document.body.offsetHeight;
    // console.log(window.scrollY + window.innerHeight,pageHeight)
    if (window.scrollY >= mainTop-barHeight) {
      if (window.scrollY >= sectionTop+mainTop-barHeight-window.innerHeight/2.8 && window.scrollY < sectionTop+mainTop+sectionHeight/1){
        currentSection = section.getAttribute('id');
      }
      if (window.scrollY >= pageHeight) {
        currentSection = 'contact';
      }
    }
  });

  var navLinks = document.querySelectorAll('nav ul li a');

  navLinks.forEach(function(link) {
    link.classList.remove('active')

    if (link.getAttribute('href').slice(1) === currentSection) {
      link.classList.add('active');
    }
  });
  // navLinks[0].classList.add('active')
});