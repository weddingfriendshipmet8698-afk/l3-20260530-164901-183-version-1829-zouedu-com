
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupLocalFilters();
        setupPlayers();
        setupGlobalSearch();
    });

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
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
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var container = scope.closest('.container') || document;
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-year-filter]');
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var selectedYear = year ? year.value : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    var yearMatch = !selectedYear || card.getAttribute('data-year') === selectedYear;
                    card.classList.toggle('is-hidden', !(keywordMatch && yearMatch));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var start = box.querySelector('[data-player-start]');
            var message = box.querySelector('[data-player-message]');
            var src = box.getAttribute('data-src');
            var initialized = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function initialize() {
                if (!video || !src || initialized) {
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        box.classList.add('loaded');
                        video.play().catch(function () {
                            setMessage('播放器已就绪，请再次点击播放。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源暂时无法加载，请刷新页面后重试。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    box.classList.add('loaded');
                    video.play().catch(function () {
                        setMessage('播放器已就绪，请再次点击播放。');
                    });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放，请更换浏览器访问。');
                }
            }

            if (start) {
                start.addEventListener('click', initialize);
            }
            if (video) {
                video.addEventListener('click', initialize);
            }
        });
    }

    function setupGlobalSearch() {
        var input = document.getElementById('global-search');
        var category = document.getElementById('global-category');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-search-count]');
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q');
        if (queryFromUrl) {
            input.value = queryFromUrl;
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderCard(movie) {
            var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + movie.detail + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">',
                '        <span class="poster-badge">' + movie.year + '</span>',
                '        <span class="poster-play">▶</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '        <h3><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var selectedCategory = category ? category.value : '';
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.category,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var categoryMatch = !selectedCategory || movie.category === selectedCategory;
                return keywordMatch && categoryMatch;
            }).slice(0, 120);

            results.innerHTML = matched.map(renderCard).join('\n');
            if (count) {
                count.textContent = '找到 ' + matched.length + ' 条结果，最多显示 120 条。';
            }
        }

        input.addEventListener('input', apply);
        if (category) {
            category.addEventListener('change', apply);
        }
        apply();
    }
})();
