window.addEventListener("scroll", function() {
    var navbar = document.querySelector(".bar");
    if (window.scrollY > 50) {
      navbar.classList.add("bar-fixed");
    } else {
      navbar.classList.remove("bar-fixed");
    }
  });