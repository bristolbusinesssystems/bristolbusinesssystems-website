/* Shared: theme toggle + mobile nav (subpages) */
(function () {
  var root = document.documentElement, KEY = 'bbs-theme';
  var stored = localStorage.getItem(KEY);
  if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next); localStorage.setItem(KEY, next);
  });
  var mb = document.getElementById('menu-btn'), mn = document.getElementById('mobile-nav');
  if (mb && mn) {
    mb.addEventListener('click', function () {
      var open = mn.classList.toggle('open');
      mb.setAttribute('aria-expanded', String(open));
    });
    mn.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }); });
  }
})();
