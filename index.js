window.addEventListener('load', function () {
  console.log('load')
  var loading = document.querySelector('.loading');
  var main = document.querySelector('.hidden');
  document.body.classList.add('loaded');
  loading.style.display = 'none';
  main.classList.remove('hidden')
});