(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var button = document.getElementById(options.buttonId);
    var errorBox = document.getElementById(options.errorId);
    var attached = false;
    var hls = null;

    if (!video || !cover || !button) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.textContent = "影片暂时无法播放，请稍后再试。";
        errorBox.classList.add("is-open");
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else {
        video.src = options.url;
      }
    }

    function start() {
      attach();
      cover.classList.add("is-hidden");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    function toggle() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    button.addEventListener("click", start);
    cover.addEventListener("click", start);
    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    video.addEventListener("error", showError);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
