import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTimerStore = defineStore("timer", () => {
    /**
   * Время по умолчанию (в секундах) — 5 минут.
   * В будущем планируется доабвить еще несколько контролев 
   */
  const defaultSeconds = 5 * 60;
  /**
   * Оставшееся время у белых (в секундах).
   */
  const whiteSeconds = ref(defaultSeconds);
  /**
   * Оставшееся время у черных (в секундах).
   */
  const blackSeconds = ref(defaultSeconds);
  /**
   * Активный цвет игрока — "w", "b" или null.
   * Определяет, чей таймер сейчас тикает.
   */
  const activeColor = ref(null);
  /**
   * Флаг состояния таймера.
   * true — если таймер запущен; false — если остановлен.
   */
  const isRunning = ref(false);
  /**
   * Количество секунд до начала партии.
   * 
   * Когда 0 — предстарт не активен, партия отменяется
   */
  const preSeconds = ref(0);
  /**
   * ID интервала предстартового отсчёта.
   * Используется для его остановки.
   */
  let preIntervalId = null;
  /**
   * ID интервала основного таймера.
   */
  let mainIntervalId = null;
  /**
   * Отформатированное время для белых ("ММ:СС").
   */
  const formattedWhite = computed(() => formatTime(whiteSeconds.value));
  /**
   * Отформатированное время для черных ("ММ:СС").
   */
  const formattedBlack = computed(() => formatTime(blackSeconds.value));
  /**
   * Отформатированное предстартовое время (например, "10s").
   * 
   * Если отсчёт не активен — возвращает пустую строку.
   */
  const formattedPre = computed(() => {
    if (preSeconds.value <= 0) return "";
    return `${preSeconds.value}s`;
  });
  /**
   * Форматирует секунды в строку "ММ:СС".
   */
  function formatTime(sec) {
    if (sec <= 0) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
  /**
   * Внутренняя функция — уменьшает секунды активного игрока каждую секунду.
   * 
   * Если время закончилось, вызывает stop().
   */
  function _tickMain() {
    if (activeColor.value === "w") {
      if (whiteSeconds.value > 0) whiteSeconds.value -= 1;
      else stop();
    } else if (activeColor.value === "b") {
      if (blackSeconds.value > 0) blackSeconds.value -= 1;
      else stop();
    }
  }
  /**
   * Запускает основной таймер для указанного цвета.
   * 
   * Предыдущий интервал очищается.
   */
  function start(color) {
    activeColor.value = color;
    if (mainIntervalId) clearInterval(mainIntervalId);
    mainIntervalId = setInterval(_tickMain, 1000);
    isRunning.value = true;
  }
  /**
   * Останавливает основной таймер.
   * Интервал очищается, флаг isRunning становится false.
   * activeColor при этом не меняется.
   */
  function stop() {
    if (mainIntervalId) {
      clearInterval(mainIntervalId);
      mainIntervalId = null;
    }
    isRunning.value = false;
  }
  /**
   * Переключает ход между игроками.
   * 
   * Если параметр не передан — автоматически переключает
   * с белых на чёрных и наоборот.
   */
  function switchTurn(nextColor) {
    const next = nextColor || (activeColor.value === "w" ? "b" : "w");
    start(next);
  }
  /**
   * Сбрасывает оба таймера на указанное количество минут.
   * По умолчанию 5 минут. 
   */
  function reset(minutes = 5) {
    stop();
    const secs = Math.max(1, Math.floor(minutes)) * 60;
    whiteSeconds.value = secs;
    blackSeconds.value = secs;
    activeColor.value = "w";
  }
  /**
   * Устанавливает время (в секундах) для белых и чёрных.
   * 
   * Значения округляются вниз и не могут быть меньше нуля.
   */
  function setTimes(whiteSec, blackSec) {
    whiteSeconds.value = Math.max(0, Math.floor(whiteSec));
    blackSeconds.value = Math.max(0, Math.floor(blackSec));
  }
  /**
   * Устанавливает активный цвет без запуска таймера.
   * 
   * Используется для визуального выделения хода.
   */
  function setActiveColor(color) {
    activeColor.value = color;
  }
  /**
   * Запускает предстартовый отсчёт перед началом партии.
   * 
   * Если отсчёт достигает нуля — вызывает колбэк onExpired (если задан).
   * Если секунды равны нулю или меньше — сразу вызывает onExpired.
   */
  function startPreStart(seconds = 15, onExpired = null) {
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
  /**
   * Отменяет предстартовый отсчёт и сбрасывает preSeconds в 0.
   */
  function cancelPreStart() {
    if (preIntervalId) {
      clearInterval(preIntervalId);
      preIntervalId = null;
    }
    preSeconds.value = 0;
  }

  return {
    whiteSeconds,
    blackSeconds,
    formattedWhite,
    formattedBlack,
    activeColor,
    isRunning,
    preSeconds,
    formattedPre,
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
