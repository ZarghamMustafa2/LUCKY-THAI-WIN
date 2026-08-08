/**
 * LUCKY THAI WIN - Standalone Real-Time Scheduled Draw Timer Module
 * Authoritative 1-Hour Wall-Clock Sync Engine
 */

(function (global) {
  'use strict';

  var TimerEngine = {
    DRAW_INTERVAL_MS: 3600 * 1000,

    /**
     * Calculates the exact timestamp of the next 1-hour scheduled draw.
     * @returns {Date}
     */
    getNextScheduledDrawDate: function () {
      var now = new Date();
      var nextDraw = new Date(now);
      nextDraw.setMinutes(0, 0, 0);
      nextDraw.setHours(nextDraw.getHours() + 1);

      if (nextDraw.getTime() - now.getTime() <= 0) {
        nextDraw.setHours(nextDraw.getHours() + 1);
      }
      return nextDraw;
    },

    /**
     * Returns remaining milliseconds until the next scheduled draw.
     * @returns {number}
     */
    getRemainingMs: function () {
      var now = new Date();
      var nextDraw = this.getNextScheduledDrawDate();
      var rem = nextDraw.getTime() - now.getTime();
      return Math.max(1000, rem);
    },

    /**
     * Formats total seconds into HH:MM:SS object and formatted string.
     * @param {number} totalSecs
     * @returns {{hhmmss: string, formatted: string, h: number, m: number, s: number}}
     */
    formatSeconds: function (totalSecs) {
      var secs = Math.max(0, Math.floor(totalSecs));
      var h = Math.floor(secs / 3600);
      var m = Math.floor((secs % 3600) / 60);
      var s = Math.floor(secs % 60);

      var hStr = h.toString().padStart(2, '0');
      var mStr = m.toString().padStart(2, '0');
      var sStr = s.toString().padStart(2, '0');

      var hhmmss = hStr + ':' + mStr + ':' + sStr;
      var formatted = h > 0 ? h + 'h ' + m + 'm ' + sStr + 's' : (m > 0 ? m + 'm ' + sStr + 's' : '0m ' + sStr + 's');

      return {
        hhmmss: hhmmss,
        formatted: formatted,
        h: h,
        m: m,
        s: s
      };
    },

    /**
     * Starts an authoritative 1-second interval ticker.
     * @param {function(object)} onTick - Callback executed every second with formatted time.
     * @returns {number} Interval ID
     */
    startTicker: function (onTick) {
      var self = this;
      var tick = function () {
        var remMs = self.getRemainingMs();
        var totalSecs = Math.floor(remMs / 1000);
        var formattedData = self.formatSeconds(totalSecs);
        formattedData.remainingMs = remMs;
        if (typeof onTick === 'function') {
          onTick(formattedData);
        }
      };

      tick();
      return setInterval(tick, 1000);
    }
  };

  // Export module to global scope (Browser & CommonJS/ESM)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerEngine;
  } else {
    global.TimerEngine = TimerEngine;
  }
})(typeof window !== 'undefined' ? window : this);
