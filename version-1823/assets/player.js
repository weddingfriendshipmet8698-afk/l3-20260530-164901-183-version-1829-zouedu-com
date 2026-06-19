(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function attachVideo(video, stream) {
    if (!video || !stream) {
      return;
    }
    if (video.__streamAttached) {
      return;
    }
    video.__streamAttached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.__hls = hls;
      return;
    }
    video.src = stream;
  }

  function setupPlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var stream = root.getAttribute('data-stream') || '';
    if (!video || !cover || !stream) {
      return;
    }

    function start() {
      attachVideo(video, stream);
      cover.classList.add('is-hidden');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
