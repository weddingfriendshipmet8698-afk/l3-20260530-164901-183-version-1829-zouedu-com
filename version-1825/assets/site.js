(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(idx);
                play();
            });
        });
        play();
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-group]").forEach(function (group) {
            var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter-btn]"));
            var scope = group.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-btn");
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var haystack = [
                            card.getAttribute("data-title"),
                            card.getAttribute("data-type"),
                            card.getAttribute("data-region"),
                            card.getAttribute("data-year"),
                            card.getAttribute("data-genre"),
                            card.textContent
                        ].join(" ");
                        var matched = value === "all" || haystack.indexOf(value) !== -1;
                        card.style.display = matched ? "" : "none";
                    });
                });
            });
        });
    }

    function setupSearch() {
        var input = document.getElementById("globalSearch");
        var panel = document.getElementById("searchPanel");
        if (!input || !panel || !Array.isArray(window.movieSearchData)) {
            return;
        }
        function closePanel() {
            panel.classList.remove("is-open");
            panel.innerHTML = "";
        }
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            if (query.length < 1) {
                closePanel();
                return;
            }
            var results = window.movieSearchData.filter(function (item) {
                return item.q.indexOf(query) !== -1;
            }).slice(0, 36);
            if (!results.length) {
                panel.innerHTML = "<p>未找到匹配内容</p>";
                panel.classList.add("is-open");
                return;
            }
            panel.innerHTML = results.map(function (item) {
                return "<a href=\"./" + item.url + "\"><strong>" + item.title + "</strong><span>" + item.meta + "</span></a>";
            }).join("");
            panel.classList.add("is-open");
        });
        document.addEventListener("click", function (event) {
            if (!panel.contains(event.target) && event.target !== input) {
                closePanel();
            }
        });
    }

    function initMoviePlayer(videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !sourceUrl) {
            return;
        }
        var prepared = false;
        var hls = null;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = sourceUrl;
        }
        function start() {
            prepare();
            button.classList.add("is-hidden");
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearch();
    });
})();
