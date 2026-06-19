(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      navPanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var filterBox = document.querySelector('[data-filter-box]');
  if (filterBox) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var keywordInput = filterBox.querySelector('[data-filter-keyword]');
    var yearSelect = filterBox.querySelector('[data-filter-year]');
    var typeSelect = filterBox.querySelector('[data-filter-type]');
    var regionSelect = filterBox.querySelector('[data-filter-region]');
    var empty = document.querySelector('[data-empty-state]');

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        var search = card.getAttribute('data-search') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';

        if (keyword && search.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }
        if (type && cardType !== type) {
          ok = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_MOVIES) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var status = searchPage.querySelector('[data-search-status]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function createCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a href="' + movie.url + '" class="movie-link">' +
        '<span class="cover-wrap">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
        '</span>' +
        '<span class="movie-info">' +
        '<span class="movie-title">' + escapeHtml(movie.title) + '</span>' +
        '<span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>' +
        '<span class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></span>' +
        '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
        '</a>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function runSearch(query) {
      var q = query.trim().toLowerCase();
      if (input) {
        input.value = query;
      }
      if (!q) {
        status.textContent = '输入关键词查找影片';
        results.innerHTML = '';
        return;
      }

      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }).slice(0, 120);

      status.textContent = '“' + query + '” 的搜索结果';
      results.innerHTML = matched.length ? matched.map(createCard).join('') : '<div class="empty-state is-visible">没有找到相关影片</div>';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var q = input ? input.value.trim() : '';
        var nextUrl = q ? './search.html?q=' + encodeURIComponent(q) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        runSearch(q);
      });
    }

    runSearch(initialQuery);
  }
}());
