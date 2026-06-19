(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  var prev = document.querySelector('.hero-arrow.prev');
  var next = document.querySelector('.hero-arrow.next');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length) {
    showSlide(0);
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-region')
    ].join(' ').toLowerCase();
  }

  function bindFilter(inputSelector, cardSelector) {
    var input = document.querySelector(inputSelector);
    var cards = Array.prototype.slice.call(document.querySelectorAll(cardSelector));
    var noResult = document.querySelector('.no-result');

    if (!input || !cards.length) {
      return;
    }

    function apply() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var matched = !q || textOf(card).indexOf(q) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (noResult) {
        noResult.style.display = shown ? 'none' : 'block';
      }
    }

    input.addEventListener('input', apply);

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      input.value = initial;
    }

    apply();
  }

  bindFilter('[data-filter-input]', '.movie-card');
  bindFilter('[data-search-input]', '.movie-card');

  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-button');
    var layer = box.querySelector('.play-layer');

    if (!video || !button) {
      return;
    }

    var src = video.getAttribute('data-src');
    var started = false;

    function start() {
      if (!src) {
        return;
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }

        started = true;
      }

      if (layer) {
        layer.classList.add('is-hidden');
      }

      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', start);
    if (layer) {
      layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-box')).forEach(initPlayer);
})();
