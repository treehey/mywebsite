(function(){
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;
  const btn = ()=> document.querySelector('.theme-toggle i');

  function currentPref(){
    const stored = localStorage.getItem(STORAGE_KEY);
    if(stored==='light' || stored==='dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme){
    if(theme==='dark'){
      root.setAttribute('data-theme','dark');
    } else {
      root.removeAttribute('data-theme');
    }
    const icon = btn();
    if(icon){ icon.className = theme==='dark' ? 'bi bi-moon-stars' : 'bi bi-sun'; }
  }

  window.toggleTheme = function(){
    const next = currentPref()==='dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // init
  applyTheme(currentPref());

  // if no stored preference, follow system changes
  if(!localStorage.getItem(STORAGE_KEY)){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e=>{
      applyTheme(e.matches? 'dark':'light');
    });
  }
})();