(function() {
  function initPullToRefresh() {
    var startY = 0;
    var currentY = 0;
    var isPulling = false;
    var threshold = 55;
    
    // Create visual pull indicator container
    var banner = document.createElement('div');
    banner.id = 'pullToRefreshBanner';
    banner.className = 'fixed top-0 left-1/2 -translate-x-1/2 bg-[#172d47] text-white px-5 py-2.5 rounded-b-2xl border-b border-x border-cyan-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.8)] z-[99999] text-xs font-bold flex items-center gap-2.5 pointer-events-none transition-all duration-200 opacity-0 -translate-y-full';
    banner.innerHTML = '<i id="pullSpinnerIcon" class="fa-solid fa-arrow-down text-gold transition-transform duration-200 text-sm"></i> <span id="pullBannerText" class="tracking-wide">Pull down to refresh...</span>';
    document.body.appendChild(banner);

    var targetEl = document.querySelector('main') || document.body;

    function onStart(y) {
      var scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      var targetScroll = targetEl ? targetEl.scrollTop : 0;
      if (scrollPos <= 5 && targetScroll <= 5) {
        startY = y;
        isPulling = true;
      }
    }

    function onMove(y) {
      if (!isPulling) return;
      currentY = y;
      var diff = currentY - startY;
      if (diff > 0) {
        var pullDist = Math.min(diff * 0.45, 90);
        banner.style.opacity = Math.min(pullDist / threshold, 1).toString();
        banner.style.transform = 'translate(-50%, ' + (pullDist - 35) + 'px)';
        
        var textEl = document.getElementById('pullBannerText');
        var iconEl = document.getElementById('pullSpinnerIcon');
        
        if (pullDist >= threshold) {
          if (textEl) textEl.innerText = 'Release to refresh...';
          if (iconEl) iconEl.style.transform = 'rotate(180deg)';
        } else {
          if (textEl) textEl.innerText = 'Pull down to refresh...';
          if (iconEl) iconEl.style.transform = 'rotate(0deg)';
        }
      }
    }

    function onEnd() {
      if (!isPulling) return;
      var diff = currentY - startY;
      var pullDist = Math.min(diff * 0.45, 90);
      var textEl = document.getElementById('pullBannerText');
      var iconEl = document.getElementById('pullSpinnerIcon');

      if (pullDist >= threshold) {
        banner.style.transform = 'translate(-50%, 12px)';
        banner.style.opacity = '1';
        if (textEl) textEl.innerText = 'Refreshing data...';
        if (iconEl) {
          iconEl.className = 'fa-solid fa-rotate text-emerald-400 animate-spin text-sm';
          iconEl.style.transform = 'rotate(0deg)';
        }
        setTimeout(function() {
          window.location.reload();
        }, 400);
      } else {
        banner.style.opacity = '0';
        banner.style.transform = 'translate(-50%, -100%)';
      }

      isPulling = false;
      startY = 0;
      currentY = 0;
    }

    // Touch Event Listeners
    window.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches[0]) onStart(e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', function(e) {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', function() {
      onEnd();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPullToRefresh);
  } else {
    initPullToRefresh();
  }
})();
