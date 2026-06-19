(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navPanel = document.querySelector('.nav-panel');

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function () {
      var open = navPanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var slideIndex = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === slideIndex);
      dot.setAttribute('aria-pressed', i === slideIndex ? 'true' : 'false');
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });
    setInterval(function () {
      setSlide(slideIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.site-search');
  var clearButton = document.querySelector('.clear-search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var noResults = document.querySelector('.no-results');

  function applySearch() {
    if (!searchInput || !cards.length) {
      return;
    }

    var keyword = searchInput.value.trim().toLowerCase();
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });

    if (noResults) {
      noResults.style.display = shown ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }

  var player = document.querySelector('.player-box');

  if (player) {
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    var source = player.getAttribute('data-video');
    var loaded = false;

    function loadVideo() {
      if (!video || !source || loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    function startVideo() {
      loadVideo();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
    }
  }
})();
