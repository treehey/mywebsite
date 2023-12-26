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
  var currentSection = '';

  sections.forEach(function(section) {
    var sectionTop = section.offsetTop;
    var sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop + sectionHeight / 2) {
      currentSection = section.getAttribute('id');
    }
  });

  var navLinks = document.querySelectorAll('nav ul li a');

  navLinks.forEach(function(link) {
    link.classList.remove('active')

    if (link.getAttribute('href').slice(1) === currentSection) {
      link.classList.add('active');
    }
  });
});