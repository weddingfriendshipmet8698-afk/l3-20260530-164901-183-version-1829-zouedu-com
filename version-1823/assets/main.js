(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || '';
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return b.localeCompare(a, 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    var controls = document.querySelector('[data-filter-controls]');
    if (!grid || !controls) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var search = controls.querySelector('[data-filter-search]');
    var year = controls.querySelector('[data-filter-year]');
    var type = controls.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');

    fillSelect(year, uniqueValues(cards, 'data-year'));
    fillSelect(type, uniqueValues(cards, 'data-type'));

    function apply() {
      var query = normalize(search ? search.value : '');
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchesType = !selectedType || card.getAttribute('data-type') === selectedType;
        var matches = matchesQuery && matchesYear && matchesType;
        card.classList.toggle('is-hidden', !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
