// src/stores/timerStore.js
import { ref, computed } from "vue";
import { defineStore } from "pinia";

/**
 * Timer store с поддержкой:
 * - main timers (whiteSeconds / blackSeconds)
 * - preStart countdown (preSeconds) — короткий таймер перед первым ходом
 *
 * API:
 * - start(color), stop(), switchTurn(nextColor), reset(minutes)
 * - startPreStart(seconds, onExpiredCallback), cancelPreStart()
 */
export const useTimerStore = defineStore("timer", () => {
  const defaultSeconds = 5 * 60;

  const whiteSeconds = ref(defaultSeconds);
  const blackSeconds = ref(defaultSeconds);

  const activeColor = ref(null);
  const isRunning = ref(false);

  // Pre-start
  const preSeconds = ref(0);
  let preIntervalId = null;

  // interval for main timers
  let mainIntervalId = null;

  const formattedWhite = computed(() => formatTime(whiteSeconds.value));
  const formattedBlack = computed(() => formatTime(blackSeconds.value));
  const formattedPre = computed(() => {
    if (preSeconds.value <= 0) return "";
    return `${preSeconds.value}s`;
  });

  function formatTime(sec) {
    if (sec <= 0) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function _tickMain() {
    if (activeColor.value === "w") {
      if (whiteSeconds.value > 0) whiteSeconds.value -= 1;
      else stop();
    } else if (activeColor.value === "b") {
      if (blackSeconds.value > 0) blackSeconds.value -= 1;
      else stop();
    }
  }

  function start(color) {
    activeColor.value = color;
    if (mainIntervalId) clearInterval(mainIntervalId);
    mainIntervalId = setInterval(_tickMain, 1000);
    isRunning.value = true;
  }

  function stop() {
    if (mainIntervalId) {
      clearInterval(mainIntervalId);
      mainIntervalId = null;
    }
    isRunning.value = false;
  }

  function switchTurn(nextColor) {
    const next = nextColor || (activeColor.value === "w" ? "b" : "w");
    start(next);
  }

  function reset(minutes = 5) {
    stop();
    const secs = Math.max(1, Math.floor(minutes)) * 60;
    whiteSeconds.value = secs;
    blackSeconds.value = secs;
    activeColor.value = "w";
  }

  function setTimes(whiteSec, blackSec) {
    whiteSeconds.value = Math.max(0, Math.floor(whiteSec));
    blackSeconds.value = Math.max(0, Math.floor(blackSec));
  }

  function setActiveColor(color) {
    activeColor.value = color;
  }

  // ---------- Pre-start implementation ----------
  /**
   * startPreStart(seconds, onExpired)
   * - seconds: количество секунд (например 10)
   * - onExpired: функция вызываемая, когда отсчёт дошёл до 0
   */
  function startPreStart(seconds = 10, onExpired = null) {
    cancelPreStart();
    preSeconds.value = Math.max(0, Math.floor(seconds));

    if (preSeconds.value <= 0) {
      if (typeof onExpired === "function") onExpired();
      return;
    }

    preIntervalId = setInterval(() => {
      preSeconds.value -= 1;
      if (preSeconds.value <= 0) {
        cancelPreStart();
        if (typeof onExpired === "function") onExpired();
      }
    }, 1000);
  }

  function cancelPreStart() {
    if (preIntervalId) {
      clearInterval(preIntervalId);
      preIntervalId = null;
    }
    preSeconds.value = 0;
  }

  // expose
  return {
    whiteSeconds,
    blackSeconds,
    formattedWhite,
    formattedBlack,
    activeColor,
    isRunning,

    // pre-start
    preSeconds,
    formattedPre,

    // actions
    start,
    stop,
    switchTurn,
    reset,
    setTimes,
    setActiveColor,

    startPreStart,
    cancelPreStart,
    formatTime,
  };
});
