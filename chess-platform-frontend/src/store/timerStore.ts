import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTimerStore = defineStore("timer", () => {
  /**
   * Оставшееся время у белых (в секундах).
   * Обновляется только по сообщениям от сервера.
   */
  const whiteSeconds = ref(600); // 10 минут по умолчанию (значение будет перезаписано сервером)

  /**
   * Оставшееся время у чёрных (в секундах).
   * Обновляется только по сообщениям от сервера.
   */
  const blackSeconds = ref(600);

  /**
   * Активный цвет игрока ("w" или "b").
   * Используется для визуальной подсветки часов.
   */
  const activeColor = ref<"w" | "b" | null>(null);

  /**
   * Флаг, указывающий, идёт ли отсчёт времени.
   * Синхронизируется с сервером.
   */
  const isRunning = ref(false);

  /**
   * Секунды предстартового отсчёта (ожидание первого хода).
   * 0 — отсчёт не активен.
   */
  const preSeconds = ref(0);

  /**
   * Отформатированное время для белых ("ММ:СС").
   */
  const formattedWhite = computed(() => formatTime(whiteSeconds.value));

  /**
   * Отформатированное время для чёрных ("ММ:СС").
   */
  const formattedBlack = computed(() => formatTime(blackSeconds.value));

  /**
   * Отформатированное предстартовое время (например, "10s").
   */
  const formattedPre = computed(() => {
    if (preSeconds.value <= 0) return "";
    return `${preSeconds.value}s`;
  });

  /**
   * Форматирует секунды в строку "ММ:СС".
   */
  function formatTime(sec: number): string {
    if (sec <= 0) return "00:00";
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  /**
   * Отменяет предстартовый отсчёт и сбрасывает счётчик.
   * Вызывается при первом ходе.
   */
  function cancelPreStart() {
    preSeconds.value = 0;
  }

  /**
   * Основная функция синхронизации таймера с сервером.
   * Вызывается при получении сообщения timerUpdate.
   */
  function updateFromServer(data: {
    whiteTime: number;
    blackTime: number;
    currentTurn: "w" | "b";
    isRunning: boolean;
  }) {
    whiteSeconds.value = Math.max(0, Math.floor(data.whiteTime));
    blackSeconds.value = Math.max(0, Math.floor(data.blackTime));
    activeColor.value = data.currentTurn;
    isRunning.value = data.isRunning;
    // Предстарт отменяется при любом обновлении (на всякий случай)
    cancelPreStart();
  }

  return {
    // Состояние
    whiteSeconds,
    blackSeconds,
    activeColor,
    isRunning,
    preSeconds,

    // Форматированное время
    formattedWhite,
    formattedBlack,
    formattedPre,

    // Методы
    cancelPreStart,
    updateFromServer,
  };
});