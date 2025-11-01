<template>
  <div class="chess-timer" role="region" aria-label="Chess clock">
    <div
      class="player-info player-top"
      :class="{ active: topActive }"
      aria-live="polite"
    >
      <div class="player-left">
        <div class="player-avatar" :title="topPlayer.username">{{ topInitial }}</div>
        <div class="player-details">
          <div class="player-name" :title="topPlayer.username">{{ topPlayer.username }}</div>
          <div class="player-rating">⟡ {{ topPlayer.blitzRating }}</div>
        </div>
      </div>

      <div class="timer-wrap">
        <div
          class="timer timer-top"
          :class="{ 'low-time': isLowTime(topTimeRaw) }"
          aria-label="Top player time"
        >
          {{ topTimeDisplay }}
        </div>
      </div>
    </div>

    <div class="middle">

      <!-- Moves -->
      <div class="moves-history" aria-label="Moves history">
        <div class="moves-title">История ходов</div>
        <div class="moves-placeholder">
          <template v-if="gameStore.moveHistory?.length">
            <div v-for="(m, i) in formattedMoves" :key="i">{{ m }}</div>
          </template>
          <template v-else>Нет ходов</template>
        </div>
      </div>

      <div class="game-status" role="status" aria-live="polite">
        {{ gameStatusText }}
      </div>

      <div
        v-if="timerStore.preSeconds > 0"
        class="prestart-countdown"
        aria-live="assertive"
      >
        <div class="prestart-label">Ожидание первого хода</div>
        <div class="prestart-value">{{ timerStore.formattedPre }}</div>
      </div>
    </div>

    <div
      class="player-info player-bottom"
      :class="{ active: bottomActive }"
    >
      <div class="player-left">
        <div class="player-avatar" :title="bottomPlayer.username">{{ bottomInitial }}</div>
        <div class="player-details">
          <div class="player-name" :title="bottomPlayer.username">{{ bottomPlayer.username }}</div>
          <div class="player-rating">⟡ {{ bottomPlayer.blitzRating }}</div>
        </div>
      </div>

      <div class="timer-wrap">
        <div
          class="timer timer-bottom"
          :class="{ 'low-time': isLowTime(bottomTimeRaw) }"
          aria-label="Bottom player time"
        >
          {{ bottomTimeDisplay }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/store/user";
import { useGameStore } from "@/store/gameStore";
import { useTimerStore } from "@/store/timerStore";

const userStore = useUserStore();
const gameStore = useGameStore();
const timerStore = useTimerStore();

/**
 * Определяет данные верхнего игрока (оппонента):
 * - имя, рейтинг и цвет фигур.
 * Если данных оппонента нет, используется fallback-значение ("Opponent", рейтинг 1200).
 */
const topPlayer = computed(() => {
  if (gameStore.opponent && Object.keys(gameStore.opponent).length) {
    return {
      username: gameStore.opponent.username || "Opponent",
      blitzRating: gameStore.opponent.blitzRating ?? 1200,
      color: gameStore.opponent.color || (gameStore.playerColor === "w" ? "b" : "w"),
    };
  }
  const fallbackColor = gameStore.playerColor === "b" ? "w" : "b";
  return { username: "Opponent", blitzRating: 1200, color: fallbackColor };
});

/**
 * Данные нижнего игрока (пользователь):
 * - берётся из userStore.
 */
const bottomPlayer = computed(() => ({
  username: userStore.username || "You",
  blitzRating: userStore.blitzRating ?? 1200,
  color: gameStore.playerColor || "w",
}));

/**
 * Первая буква имени игрока для аватара.
 */
const topInitial = computed(() => (topPlayer.value.username?.[0] || "O").toUpperCase());
/**
 * Первая буква имени игрока для аватара.
 */
const bottomInitial = computed(() => (bottomPlayer.value.username?.[0] || "Y").toUpperCase());
/**
 * Определяет, чей сейчас ход (чей таймер должен идти).
 */
const topActive = computed(() => topPlayer.value.color === gameStore.currentTurn);
/**
 * Определяет, чей сейчас ход (чей таймер должен идти).
 */
const bottomActive = computed(() => bottomPlayer.value.color === gameStore.currentTurn);
/**
 * Сырое значение секунд для из timerStore.
 */
const topTimeRaw = computed(() =>
  topPlayer.value.color === "w" ? timerStore.whiteSeconds : timerStore.blackSeconds
);
/**
 * Сырое значение секунд для из timerStore.
 */
const bottomTimeRaw = computed(() =>
  bottomPlayer.value.color === "w" ? timerStore.whiteSeconds : timerStore.blackSeconds
);
/**
 * Отформатированное отображение времени (в виде 05:00 и т.д.).
 */
const topTimeDisplay = computed(() =>
  topPlayer.value.color === "w" ? timerStore.formattedWhite : timerStore.formattedBlack
);
/**
 * Отформатированное отображение времени (в виде 05:00 и т.д.).
 */
const bottomTimeDisplay = computed(() =>
  bottomPlayer.value.color === "w" ? timerStore.formattedWhite : timerStore.formattedBlack
);
/**
 * Преобразует историю ходов в формат:
 * 1. e4
 * 2. e5
 * и т.д.
 */
const formattedMoves = computed(() =>
  gameStore.moveHistory?.map((m, i) => `${i + 1}. ${m}`) || []
);
/**
 * Формирует текстовое описание текущего состояния партии:
 * - "Ничья", "Победа белых", "Ожидание первого хода", "Ход белых" и т.д.
 */
const gameStatusText = computed(() => {
  if (gameStore.result && gameStore.result.type) {
    if (gameStore.result.type === "draw") {
      console.log("Результат игры", gameStore.result.type )
      return "Ничья";
    }
    if (gameStore.result.type === "whiteWin") {
      return "Победа белых"
    }

    if (gameStore.result.type === "blackWin") {
      return "Победа черных"
    }

    if (gameStore.result.type === "canceledGame") {
       return "Игра отменена";
    }
  }
  
  if (gameStore.currentTurn) {
    return `Ход ${gameStore.currentTurn === "w" ? "белых" : "чёрных"}`;
  } else {
    return "Ожидание игроков";
  }
});

/**
 * Проверяет, осталось ли менее 30 секунд.
 * Используется для визуального предупреждения игрока (красный цвет, анимация).
 * @param {number} sec - оставшееся время в секундах
 * @returns {boolean}
 */
function isLowTime(sec) {
  return Number(sec) <= 30;
}

/**
 * При монтировании компонента запускается pre-start таймер (если игра ещё не началась).
 * Если по истечении 15 секунд никто не сделал первый ход — партия завершается вничью.
 */
onMounted(() => {
  if (!gameStore.result.type) {
    timerStore.startPreStart(10, () => {
      gameStore.result = {
        type: "canceledGame",
        reason: "no_move",
      };
    });
  }
});

/**
 * Реакция на смену хода:
 * - если текущий ход есть → запускаем соответствующий таймер (черных или белых);
 * - если хода нет (или есть результат) → останавливаем таймер.
 */
watch(
  () => gameStore.currentTurn,
  (newTurn) => {
    if (!newTurn || gameStore.result.type) {
      timerStore.stop();
      return;
    }
    timerStore.start(newTurn);
  }
);

/**
 * При завершении партии — останавливаем таймер.
 */
watch(
  () => gameStore.result,
  (res) => {
    if (res) timerStore.stop();
  }
);

/**
 * При размонтировании компонента останавливаем все таймеры,
 * чтобы избежать утечек памяти или дублирования интервалов.
 */
onBeforeUnmount(() => {
  timerStore.stop();
});


/**
 * Как только кто-то сделал первый ход — отменяем pre-start таймер.
 */
watch(
  () => gameStore.currentTurn,
  (turn) => {
    if (turn) {
      timerStore.cancelPreStart();
    }
  }
);
</script>

<style scoped>
:root {
  --card-bg: #fbfdff;
  --panel-bg: #ffffff;
  --muted: #6b7280;
  --accent: #2563eb;
  --accent-2: #f59e0b;
  --shadow: 0 6px 18px rgba(30, 41, 59, 0.08);
  --radius: 12px;
}

.chess-timer {
  width: min(430px, 96%);
  background: linear-gradient(180deg, var(--card-bg), #f6fbff);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow);
  font-family: Inter, "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial;
  color: #0f172a;
}

/* Player card */
.player-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  background: var(--panel-bg);
  border-radius: 10px;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  border: 1px solid #e6eefb;
}
.player-info.active {
  background: linear-gradient(90deg, rgba(37,99,235,0.06), rgba(245,158,11,0.03));
  box-shadow: 0 6px 18px rgba(37,99,235,0.08);
  transform: translateY(-2px);
}

.player-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(180deg, #eef2ff, #e6f0ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  color: #1e293b;
  flex-shrink: 0;
}
.player-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.player-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-rating {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

/* Timer */
.timer-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}
.timer {
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  text-align: center;
}
.timer-top {
  font-size: clamp(24px, 5vw, 54px);
  color: var(--accent-2);
}
.timer-bottom {
  font-size: clamp(24px, 5vw, 54px);
  color: var(--accent);
}
.timer.low-time {
  color: #dc2626;
  animation: pulse 1s infinite;
  background: rgba(220, 38, 38, 0.04);
}

/* Middle section */
.middle {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.moves-history {
  background: #f8fbff;
  border-radius: 8px;
  padding: 10px;
  border: 1px dashed #e8f0ff;
  font-size: 13px;
}
.moves-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
}
.moves-placeholder {
  color: var(--muted);
  font-size: 12px;
}
.game-status {
  text-align: center;
  padding: 8px;
  font-weight: 700;
  border-radius: 8px;
  color: #0f172a;
  background: rgba(236, 249, 255, 0.6);
  border: 1px solid #e3f6ff;
  font-size: 13px;
}

/* Prestart countdown */
.prestart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #fffaf0;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 8px;
  animation: fadeIn 0.4s ease;
}

.prestart-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

}

.prestart-label {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
}
.prestart-timer {
  font-size: 26px;
  font-weight: 800;
  color: #b45309;
}

/* Responsive tweaks */
@media (max-width: 480px) {
  .chess-timer {
    padding: 10px;
    gap: 10px;
  }
  .player-avatar {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  .timer-wrap {
    min-width: 110px;
  }
  .timer-top,
  .timer-bottom {
    font-size: 32px;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.05); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
