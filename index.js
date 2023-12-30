window.addEventListener('load', function () {
  var loading = document.getElementsByClassName('loading');
  var main = document.querySelector('main');
  document.body.classList.add('loaded');
  loading.style.display = 'none';
  main.classList.remove('hidden')
});