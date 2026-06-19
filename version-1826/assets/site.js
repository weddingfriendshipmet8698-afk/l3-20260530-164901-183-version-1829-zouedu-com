(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearch() {
    var boxes = document.querySelectorAll("[data-search-box]");
    boxes.forEach(function (box) {
      var input = box.querySelector("[data-site-search]");
      var panel = box.querySelector("[data-search-results]");
      if (!input || !panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        updateLocalCards(query);
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var list = Array.isArray(window.movieIndex) ? window.movieIndex : [];
        var results = list.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.oneLine,
            (item.tags || []).join(" ")
          ].join(" "));
          return haystack.indexOf(query) !== -1;
        }).slice(0, 10);
        panel.innerHTML = results.map(function (item) {
          return '<a class="search-result-link" href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></a>';
        }).join("");
        panel.classList.toggle("is-open", results.length > 0);
      });
      input.addEventListener("blur", function () {
        setTimeout(function () {
          panel.classList.remove("is-open");
        }, 180);
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function updateLocalCards(query) {
    var cards = document.querySelectorAll("[data-movie-card]");
    if (!cards.length) {
      return;
    }
    var shown = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !matched);
      if (matched) {
        shown += 1;
      }
    });
    document.querySelectorAll("[data-empty-message]").forEach(function (message) {
      message.classList.toggle("is-open", shown === 0);
    });
  }

  function setupFilters() {
    var buttons = document.querySelectorAll("[data-filter-button]");
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter-button");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        var shown = 0;
        document.querySelectorAll("[data-movie-card]").forEach(function (card) {
          var value = card.getAttribute("data-filter-value") || "";
          var matched = filter === "all" || value.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            shown += 1;
          }
        });
        document.querySelectorAll("[data-empty-message]").forEach(function (message) {
          message.classList.toggle("is-open", shown === 0);
        });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  ready(function () {
    setupMobileNav();
    setupSearch();
    setupFilters();
    setupHero();
  });
})();
