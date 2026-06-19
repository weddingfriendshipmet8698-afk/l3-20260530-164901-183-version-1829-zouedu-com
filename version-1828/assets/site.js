(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-target')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter(scope) {
    var input = scope.querySelector('.local-filter');
    var year = scope.querySelector('.year-filter');
    var region = scope.querySelector('.region-filter');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var empty = scope.querySelector('.empty-tip');

    function apply() {
      var query = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' '));
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var okRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
        var visible = okQuery && okYear && okRegion;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
    apply();
  }

  document.querySelectorAll('.filter-section').forEach(runFilter);

  document.querySelectorAll('.video-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var loaded = false;

    function begin() {
      if (!video || !stream) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = stream;
          video.load();
        }
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          begin();
        }
      });
    }
  });
})();
