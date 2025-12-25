<template>
  <div class="chess-timer" role="region" aria-label="Chess clock">
    <div class="chess-timer__container">
      <div
        v-if="mode !== 'bottom'"
        class="player-info player-top"
        :class="{ active: topActive }"
        aria-live="polite"
      >
        <div class="player-left">
          <div class="player-avatar" :title="topPlayer.username">
            {{ topInitial }}
          </div>
          <div class="player-details">
            <div class="player-name" :title="topPlayer.username">
              {{ topPlayer.username }}
            </div>
            <div class="player-rating">⟡ {{ topPlayer.blitzRating }}</div>
          </div>
        </div>

        <div class="timer-wrap">
          <div
            class="timer timer-top"
            :class="{
              active: topActive,
              'low-time': isLowTime(topTimeRaw),
            }"
            aria-label="Top player time"
          >
            {{ topTimeDisplay }}
          </div>
        </div>
      </div>

      <div class="middle">
        <GameReplayer v-if="mode === 'both'" />
        <MoveHistory v-if="mode === 'both'" />
        
        <div
          v-if="mode === 'both' && gameStore.result.type"
          class="game-status"
          role="status"
          aria-live="polite"
        >
          {{ gameStatusText }}
        </div>

        <div v-if="gameStore.result.type && mode === 'both'">
          <router-link 
          class="back-to-main"
          to="/"
          >
            Вернуться на главную
          </router-link>
        </div>

        <div v-if="gameStore.offerDraw && !gameStore.result.type && mode === 'both'" class="offer-draw">
          <button @click="onClickAccceptDraw()" class="offer-draw-btn accept">
            &#10004;
          </button>

          <p class="offer-draw-text">Ваш соперник предлагает ничью, принять?</p>

          <button @click="onClickCancelDraw()" class="offer-draw-btn cancel">
            &#10005;
          </button>
        </div>

        <div v-if="gameStore.offerUndo && !gameStore.result.type && mode === 'both'" class="offer-undo">
          <button @click="onClickAcceptUndo()" class="offer-undo-btn accept">
            &#10004;
          </button>

          <p class="offer-undo-text">
            Ваш соперник предлагает вернуть ход назад, принять?
          </p>

          <button @click="onClickRejectUndo()" class="offer-undo-btn cancel">
            &#10005;
          </button>
        </div>

        <GameActions
          v-if="mode == 'both' && !gameStore.result.type"
          class="game-actions"
        />

        <div
          v-if="mode === 'both' && timerStore.preSeconds > 0"
          class="prestart-countdown"
          aria-live="assertive"
        >
          <div class="prestart-label">Ожидание первого хода</div>
          <div class="prestart-value">{{ timerStore.formattedPre }}</div>
        </div>
      </div>

      <div
        v-if="mode !== 'top'"
        class="player-info player-bottom"
        :class="{ active: bottomActive }"
      >
        <div class="player-left">
          <div class="player-avatar" :title="bottomPlayer.username">
            {{ bottomInitial }}
          </div>
          <div class="player-details">
            <div class="player-name" :title="bottomPlayer.username">
              {{ bottomPlayer.username }}
            </div>
            <div class="player-rating">⟡ {{ bottomPlayer.blitzRating }}</div>
          </div>
        </div>

        <div class="timer-wrap">
          <div
            class="timer timer-bottom"
            :class="{
              active: bottomActive,
              'low-time': isLowTime(bottomTimeRaw),
            }"
            aria-label="Bottom player time"
          >
            {{ bottomTimeDisplay }}
          </div>
        </div>
      </div>

      <div
        v-if="mode === 'bottom' && gameStore.result.type"
        class="game-status"
        role="status"
        aria-live="polite"
      >
        {{ gameStatusText }}
      </div>

      <div v-if="gameStore.result.type && mode === 'bottom'">
          <router-link 
          class="back-to-main"
          to="/"
          >
            Вернуться на главную
          </router-link>
      </div>

      <GameReplayer v-if="mode === 'bottom'" />
      <!-- <MoveHistory v-if="mode === 'bottom'" /> -->

      <GameActions v-if="mode == 'bottom' && !gameStore.result.type" />

      <div
        v-if="mode === 'top' && timerStore.preSeconds > 0"
        class="prestart-countdown"
        aria-live="assertive"
      >
        <div class="prestart-label">Ожидание первого хода</div>
        <div class="prestart-value">{{ timerStore.formattedPre }}</div>
      </div>

      <div v-if="gameStore.offerDraw && !gameStore.result.type && mode === 'bottom'" class="offer-draw">
        <button @click="onClickAccceptDraw()" class="offer-draw-btn accept">
          &#10004;
        </button>

        <p class="offer-draw-text">Ваш соперник предлагает ничью, принять?</p>

        <button @click="onClickCancelDraw()" class="offer-draw-btn cancel">
          &#10005;
        </button>
      </div>

      <div v-if="gameStore.offerUndo && !gameStore.result.type && mode === 'bottom'" class="offer-undo">
        <button @click="onClickAcceptUndo()" class="offer-undo-btn accept">
          &#10004;
        </button>

        <p class="offer-undo-text">Ваш соперник предлагает вернуть ход назад, принять?</p>

        <button @click="onClickRejectUndo()" class="offer-undo-btn cancel">
          &#10005;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  defineProps,
} from "vue";
import { useUserStore } from "@/store/userStore";
import { useGameStore } from "@/store/gameStore";
import { useTimerStore } from "@/store/timerStore";

import MoveHistory from "./MoveHistory.vue";
import GameActions from "./GameActions.vue";
import GameReplayer from "./GameReplayer.vue";

const userStore = useUserStore();
const gameStore = useGameStore();
const timerStore = useTimerStore();

const props = defineProps({
  mode: {
    type: String,
    default: "both",
  },
  managePrestart: {
    type: Boolean,
    default: true,
  },
});

/**
 * Определяет данные верхнего игрока (оппонента)
 */
const topPlayer = computed(() => {
  if (gameStore.opponent && Object.keys(gameStore.opponent).length) {
    return {
      username: gameStore.opponent.username || "Opponent",
      blitzRating: gameStore.opponent.blitzRating ?? 1200,
      color:
        gameStore.opponent.color || (gameStore.playerColor === "w" ? "b" : "w"),
    };
  }
  const fallbackColor = gameStore.playerColor === "b" ? "w" : "b";
  return { username: "Opponent", blitzRating: 1200, color: fallbackColor };
});

/**
 * Данные нижнего игрока (пользователь)
 */
const bottomPlayer = computed(() => ({
  username: userStore.username || "You",
  blitzRating: userStore.blitzRating ?? 1200,
  color: gameStore.playerColor || "w",
}));

/**
 * Первая буква имени игрока для аватара
 */
const topInitial = computed(() =>
  (topPlayer.value.username?.[0] || "O").toUpperCase()
);
const bottomInitial = computed(() =>
  (bottomPlayer.value.username?.[0] || "Y").toUpperCase()
);

/**
 * Активность игроков теперь определяется по currentTurn с сервера
 */
const topActive = computed(
  () => topPlayer.value.color === timerStore.activeColor
);
const bottomActive = computed(
  () => bottomPlayer.value.color === timerStore.activeColor
);

/**
 * Время берем из timerStore который синхронизируется с сервера
 */
const topTimeRaw = computed(() =>
  topPlayer.value.color === "w"
    ? timerStore.whiteSeconds
    : timerStore.blackSeconds
);
const bottomTimeRaw = computed(() =>
  bottomPlayer.value.color === "w"
    ? timerStore.whiteSeconds
    : timerStore.blackSeconds
);

/**
 * Отформатированное время
 */
const topTimeDisplay = computed(() =>
  topPlayer.value.color === "w"
    ? timerStore.formattedWhite
    : timerStore.formattedBlack
);
const bottomTimeDisplay = computed(() =>
  bottomPlayer.value.color === "w"
    ? timerStore.formattedWhite
    : timerStore.formattedBlack
);

/**
 * Статус игры
 */
const gameStatusText = computed(() => {
  if (gameStore.result && gameStore.result.type) {
    if (gameStore.result.type === "draw") {
      if (gameStore.result.reason === "stalemate") {
        return "Пат, ничья";
      }

      if (gameStore.result.reason === "50-move-rule") {
        return "Ничья по правилу 50 ходов";
      }

      if (gameStore.result.reason === "threefold-repetition") {
        return "Ничья, троекратное повторение";
      }

      if (gameStore.result.reason === "insufficient-material") {
        return "Ничья, недостаточно материала";
      }

      if (gameStore.result.reason === "agreed-draw") {
        return "Ничья, сопернки согласилсь на ничью ";
      }
    }

    if (gameStore.result.type === "whiteWin") {
      if (gameStore.result.reason === "timeOut") {
        return "Время истекло, победа белых";
      }

      if (gameStore.result.reason === "checkMate") {
        return "Мат, победа белых";
      }

      if (gameStore.result.reason === "give-up") {
        return "Черные сдались, победа белых";
      }
    }
    if (gameStore.result.type === "blackWin") {
      if (gameStore.result.reason === "timeOut") {
        return "Время истекло, победа черных";
      }

      if (gameStore.result.reason === "checkMate") {
        return "Мат, победа черных";
      }

      if (gameStore.result.reason === "give-up") {
        return "Белые сдались, победа черных";
      }
    }
    if (gameStore.result.type === "canceledGame") {
      return "Игра отменена";
    }
  }
});

function onClickAccceptDraw() {
  gameStore.sendToServer("accept-draw");
  gameStore.offerDraw = false; 
}

function onClickCancelDraw() {
  gameStore.offerDraw = false;
}

function onClickAcceptUndo() {
  gameStore.acceptUndo();
}

function onClickRejectUndo() {
  gameStore.rejectUndo();
}

/**
 * Проверка на малое время
 */
function isLowTime(sec) {
  return Number(sec) <= 30;
}

/**
 * Отменяем предстарт при первом ходе
 */
watch(
  () => gameStore.currentTurn,
  (turn) => {
    if (turn) {
      timerStore.cancelPreStart();
    }
  }
);

watch(
  () => gameStore.result.type,
  () => {
    timerStore.activeColor = null;
  }
);
</script>

<style scoped lang="less">
.chess-timer {
  min-width: 280px;
  width: 100%;
  box-shadow: var(0 6px 18px rgba(30, 41, 59, 0.08));
  font-family: Inter, "Segoe UI", system-ui, -apple-system, "Helvetica Neue",
    Arial;
  color: #0f172a;

  &__container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
}

.player-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  background: @gray-50;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  border: 1px solid #e6eefb;
}
.player-info.active {
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
  transform: translateY(-2px);
}

.player-top {
  border-radius: 10px 10px 0 0;
}

.player-bottom {
  border-radius: 0 0 10px 10px;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 7px;
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
  color: @gray-700;
  flex-shrink: 0;
}
.player-details {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}
.player-name {
  font-size: 15px;
  font-weight: 700;
  color: @gray-900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-rating {
  font-size: 12px;
  color: @gray-700;
  margin-top: 4px;
}

.timer-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}
.timer {
  padding: 3px 5px;
  border-radius: 5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  background-color: rgb(212, 211, 211);
  text-align: center;

  &.active {
    background-color: @green-100;
  }
}

.timer-top,
.timer-bottom {
  font-size: clamp(24px, 5vw, 54px);
  color: @gray-700;
}

.timer.low-time {
  background-color: @red-100;
}

.middle {
  display: flex;
  flex-direction: column;
}

.game-status {
  text-align: center;
  padding: 15px 8px;
  font-weight: 700;
  color: @gray-900;
  background: @gray-50;
  border: 1px solid @gray-200;
  font-size: 13px;
}

.back-to-main {
  display: inline-block;
  box-sizing: border-box;
  font-weight: 700;
  cursor: pointer;
  padding: 20px 30px;
  width: 100%;
  background-color: @green-200;
  transition: all 0.3s ease;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  color: inherit;

  &:hover {
    background-color: @green-300;
  }

}

.offer-draw,
.offer-undo {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 0 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  background: @gray-50;
  border: 1px solid @gray-200;

  &-text {
    padding-bottom: 10px;
  }

  &-btns {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }

  &-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #cadef2;
    width: 40px; 
    height: 40px;
    border: none;
    padding: 8px 20px;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
}

.cancel {
  background-color: @red-200;

  &:hover {
    background-color: @red-300;
  }
}

.accept {
  background-color: @green-200;

  &:hover {
    background-color: @green-300;
  }
}

.prestart-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 5px 0;
  background: @gray-50;
  border: 1px solid @gray-200;
}

.prestart-label {
  font-size: 13px;
  font-weight: 600;
  color: @red-600;
}
.prestart-timer {
  font-size: 26px;
  font-weight: 800;
  color: @red-600;
}

@media (max-width: 990px) {
  .player-avatar {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    font-weight: 500;
    font-size: 16px;
  }

  .back-to-main {
    font-size: 14px;
  }

  .player-name {
    font-size: 14px;
  }

  .timer {
    padding: 4px 8px;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .player-info {
    padding: 0 10px;
  }

  .player-top {
    border-radius: 10px;
  }

  .player-bottom {
    border-radius: 10px;
    margin-top: 12px;
  }

  .game-actions {
    margin-top: 5px;
  }

  .chess-timer {
    padding: 0;
    gap: 10px;

    &__container {
      background-color: none;
    }
  }

  .game-status {
    margin-top: 5px;
  }

  .back-to-main {
    font-size: 12px;
    padding: 15px 30px;
  }
}

@media (max-width: 480px) {
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.05);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
