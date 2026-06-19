
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function initMobileMenu(){
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    if(!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initSearchFilters(){
    $$('.js-filter').forEach(input => {
      const targetSel = input.getAttribute('data-target');
      const target = targetSel ? $(targetSel) : null;
      if(!target) return;
      const items = $$('[data-item]', target);
      const apply = () => {
        const q = (input.value || '').trim().toLowerCase();
        const year = $('[data-year-filter]')?.value || '';
        const type = $('[data-type-filter]')?.value || '';
        let visible = 0;
        items.forEach(item => {
          const text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
          const itemYear = item.getAttribute('data-year') || '';
          const itemType = item.getAttribute('data-type') || '';
          const okQ = !q || text.includes(q);
          const okY = !year || itemYear === year;
          const okT = !type || itemType.includes(type);
          const ok = okQ && okY && okT;
          item.style.display = ok ? '' : 'none';
          if(ok) visible++;
        });
        const empty = target.parentElement?.querySelector('[data-empty]');
        if(empty) empty.style.display = visible ? 'none' : '';
      };
      input.addEventListener('input', apply);
      const y = $('[data-year-filter]');
      const t = $('[data-type-filter]');
      if(y) y.addEventListener('change', apply);
      if(t) t.addEventListener('change', apply);
      apply();
    });
  }

  function initHeroCarousel(){
    const shell = $('[data-hero-carousel]');
    if(!shell) return;
    const slides = $$('.slide', shell);
    const dotsWrap = $('[data-dots]', shell);
    if(!slides.length || !dotsWrap) return;

    let index = 0;
    const dots = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.type = 'button';
      btn.setAttribute('aria-label', '第 ' + (i+1) + ' 张');
      btn.addEventListener('click', () => show(i, true));
      dotsWrap.appendChild(btn);
      return btn;
    });

    function show(i, manual){
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, s) => slide.hidden = s !== index);
      dots.forEach((dot, d) => dot.classList.toggle('active', d === index));
      if(manual && timer){ clearInterval(timer); timer = setInterval(step, 5500); }
    }
    function step(){ show(index + 1); }
    let timer = setInterval(step, 5500);
    shell.addEventListener('mouseenter', () => clearInterval(timer));
    shell.addEventListener('mouseleave', () => timer = setInterval(step, 5500));
    const prev = $('[data-prev]', shell);
    const next = $('[data-next]', shell);
    if(prev) prev.addEventListener('click', ()=>show(index-1, true));
    if(next) next.addEventListener('click', ()=>show(index+1, true));
    show(0);
  }

  function initPlayer(){
    const video = $('[data-video]');
    if(!video) return;
    const playBtn = $('[data-play-button]');
    const stream = video.getAttribute('data-stream') || '';
    const fallback = video.getAttribute('data-fallback') || '';
    const hlsMaybe = !!stream && /\.m3u8(\?|$)/i.test(stream);

    // Prefer HLS if the browser supports it or if Hls.js is already present.
    if(stream){
      if(video.canPlayType('application/vnd.apple.mpegurl')){
        video.src = stream;
      }else if(window.Hls && window.Hls.isSupported()){
        const hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        window.__pageHls = hls;
      }else if(fallback){
        video.src = fallback;
      }else{
        video.src = stream;
      }
    }

    const doPlay = () => {
      const p = video.play();
      if(p && typeof p.catch === 'function') p.catch(()=>{});
    };
    if(playBtn) playBtn.addEventListener('click', doPlay);
    video.addEventListener('click', doPlay);
    video.addEventListener('loadeddata', () => {
      if(playBtn){
        playBtn.textContent = '播放预览';
      }
    });
  }

  function initScrollToTop(){
    const btn = $('[data-top]');
    if(!btn) return;
    const onScroll = () => {
      btn.style.opacity = window.scrollY > 400 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 400 ? 'auto' : 'none';
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  document.addEventListener('DOMContentLoaded', function(){
    initMobileMenu();
    initSearchFilters();
    initHeroCarousel();
    initPlayer();
    initScrollToTop();
  });
})();
