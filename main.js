/* OKIS 80th — scroll indicator + section reveals */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- stagger index for sequenced content ---- */
  function index(sel) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) nodes[i].style.setProperty('--i', i);
  }
  index('.tl-row');
  index('.people li');

  /* ---- reveal: 연혁 레일 + 행, 역대 이사장 그리드 ---- */
  var reveals = document.querySelectorAll('[data-timeline], [data-people]');

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    reveals.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---- 섹션 인디케이터 ---- */
  var nav = document.querySelector('.dots');
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  /* 어두운 배경 섹션에서는 인디케이터를 밝게 */
  var DARK = { s1: true, s3: true, s4: true };

  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (nav) nav.classList.toggle('on-dark', !!DARK[id]);
  }

  if (sections.length && 'IntersectionObserver' in window) {
    /* 화면 중앙선을 지나는 섹션을 현재 섹션으로 본다 */
    var mid = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { mid.observe(s); });
  }

  setActive('s1');

  /* ---- 앵커 이동: smooth 미지원 브라우저 보정 ---- */
  var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  if (!supportsSmooth) {
    links.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        ev.preventDefault();
        window.scrollTo(0, t.getBoundingClientRect().top + window.pageYOffset);
      });
    });
  }

  /* =========================================================
     페이지 단위 스냅
     섹션이 화면보다 크면 화면 높이에 맞춰 균등하게 쪼갠 뒤
     각 페이지 시작 지점에 1px 정지점을 심는다.
     - 섹션이 화면보다 작으면 정지점 1개(섹션 머리)
     - 크면 ceil(높이/화면) 개, 마지막 정지점은 섹션 끝에 정확히 맞춤
       → 어떤 내용도 스냅에 가려 못 보는 구간이 생기지 않는다
     ========================================================= */
  var page = document.querySelector('.page');
  var root = document.documentElement;
  var marks = [];

  function buildStops() {
    marks.forEach(function (m) { if (m.parentNode) m.parentNode.removeChild(m); });
    marks = [];
    root.classList.remove('snap-pages');

    if (reduce || !page) return;

    var vh = window.innerHeight;
    if (!vh) return;

    var pageTop = page.getBoundingClientRect().top + window.scrollY;
    var stops = [];

    Array.prototype.forEach.call(document.querySelectorAll('.sec'), function (s) {
      var r = s.getBoundingClientRect();
      var top = r.top + window.scrollY;
      var h = r.height;
      var pages = Math.max(1, Math.ceil(h / vh));

      if (pages === 1) {
        stops.push(top);
      } else {
        var step = (h - vh) / (pages - 1);
        for (var i = 0; i < pages; i++) stops.push(top + step * i);
      }
    });

    stops.sort(function (a, b) { return a - b; });

    var frag = document.createDocumentFragment();
    var prev = -Infinity;
    stops.forEach(function (y) {
      if (y - prev < 24) return;          /* 너무 가까운 정지점은 합친다 */
      prev = y;
      var m = document.createElement('div');
      m.className = 'snap-mark';
      m.setAttribute('aria-hidden', 'true');
      m.style.top = Math.round(y - pageTop) + 'px';
      frag.appendChild(m);
      marks.push(m);
    });
    page.appendChild(frag);

    /* 마커를 붙인 프레임에 바로 mandatory를 켜면 스크롤이 튈 수 있다 */
    requestAnimationFrame(function () { root.classList.add('snap-pages'); });
  }

  var lastW = window.innerWidth;
  var lastH = window.innerHeight;
  var resizeTimer;

  function onResize() {
    /* 모바일 주소창이 접히며 발생하는 높이 변화로는 재계산하지 않는다 */
    if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return;
    lastW = window.innerWidth;
    lastH = window.innerHeight;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStops, 200);
  }

  buildStops();
  window.addEventListener('load', buildStops);
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', function () {
    setTimeout(buildStops, 300);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(buildStops);
  }
})();
