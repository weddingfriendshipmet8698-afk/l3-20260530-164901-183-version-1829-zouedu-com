(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (slides.length === 0) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-local-search]").forEach(function (form) {
            var input = form.querySelector("input[type='search']");
            var list = document.querySelector("[data-card-list]");
            var empty = document.querySelector("[data-empty-state]");

            if (!input || !list) {
                return;
            }

            function filterCards() {
                var keyword = input.value.trim().toLowerCase();
                var visible = 0;
                list.querySelectorAll("[data-filter-card]").forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                    var matched = keyword.length === 0 || text.indexOf(keyword) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }

            input.addEventListener("input", filterCards);
            form.addEventListener("submit", function (event) {
                if (input.value.trim()) {
                    return;
                }
                event.preventDefault();
                filterCards();
            });
        });

        renderSearchPage();
    });

    function renderSearchPage() {
        var container = document.getElementById("search-results");
        if (!container || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-global-search-input]");
        var summary = document.querySelector("[data-search-summary]");
        var empty = document.querySelector("[data-search-empty]");

        if (input) {
            input.value = query;
        }

        var keyword = query.toLowerCase();
        var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
            if (!keyword) {
                return item.featured;
            }
            return item.searchText.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 96);

        if (summary) {
            summary.textContent = keyword ? "为你匹配到相关剧集" : "展示近期值得关注的精选剧集";
        }

        container.innerHTML = results.map(function (item) {
            return [
                "<article class="movie-card">",
                "<a class="poster-wrap" href="" + escapeHtml(item.file) + "" aria-label="" + escapeHtml(item.title) + "">",
                "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
                "<span class="poster-shade"></span>",
                "<span class="card-badge">" + escapeHtml(item.category) + "</span>",
                "</a>",
                "<div class="card-body">",
                "<h3><a href="" + escapeHtml(item.file) + "">" + escapeHtml(item.title) + "</a></h3>",
                "<p>" + escapeHtml(item.oneLine) + "</p>",
                "<div class="card-meta"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span><span class="score-pill">" + escapeHtml(item.score) + "</span></div>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        container.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });

        if (empty) {
            empty.classList.toggle("visible", results.length === 0);
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
