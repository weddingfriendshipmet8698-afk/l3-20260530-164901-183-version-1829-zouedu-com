function initializePlayer(source, videoId) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
        return;
    }

    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector("[data-play-button]") : null;
    var streamReady = false;
    var hlsInstance = null;

    function bindStream() {
        if (streamReady) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            streamReady = true;
            return;
        }

        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            streamReady = true;
            return;
        }

        video.src = source;
        streamReady = true;
    }

    function play() {
        bindStream();
        if (shell) {
            shell.classList.add("is-playing");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                if (shell) {
                    shell.classList.remove("is-playing");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (shell) {
            shell.classList.add("is-playing");
        }
    });

    video.addEventListener("pause", function () {
        if (shell && video.currentTime === 0) {
            shell.classList.remove("is-playing");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
