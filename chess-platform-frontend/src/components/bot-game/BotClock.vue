<template>
  <div class="chess-timer" role="region" aria-label="Chess clock">
    <div class="chess-timer__container">

      <div v-if="mode !== 'bottom'" class="player-info player-top" :class="{ active: topActive }" aria-live="polite">
        <div class="player-left">
          <div class="player-avatar">🤖</div>
          <div class="player-details">
            <div class="player-name">
              {{ botGame.isBotThinking ? 
              "Бот думает..." 
              : `Stockfish (уровень ${botGame.botParams.difficulty })` }}
            </div>
          </div>
        </div>
      </div>

      <div class="middle">
        <GameReplayer v-if="mode === 'both'" />
        <MoveHistory v-if="mode === 'both'" />

        <div v-if="mode === 'both' && game.result.type" class="game-status" role="status" aria-live="polite">
          {{ gameStatusText }}
        </div>

        <div v-if="game.result.type && mode === 'both'">
          <button
          class="revanche-btn"
          @click="botGame.revanche"
          >
            Реванш
          </button>
        </div>
      </div>

      <div v-if="mode !== 'top'" class="player-info player-bottom" :class="{ active: bottomActive }">
        <div class="player-left">
          <div class="player-avatar" :title="bottomPlayer.username">
            {{ bottomInitial }}
          </div>
          <div class="player-details">
            <div class="player-name">{{ user.username }}</div>
            <div class="player-rating">⟡ {{ bottomPlayer.blitzRating }}</div>
          </div>
        </div>
      </div>

      <div v-if="mode === 'bottom' && game.result.type" class="game-status" role="status" aria-live="polite">
        {{ gameStatusText }}
      </div>

      <div v-if="game.result.type && mode === 'bottom'">
        <button
          class="revanche-btn"
          >
            Реванш
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGameStore } from "@/store/gameStore";
import { useBotGameStore } from "@/store/gameBotStore";
import { useUserStore } from "@/store/userStore";

import MoveHistory from "../game/MoveHistory.vue";
import GameReplayer from "../game/GameReplayer.vue";
import Button from "@/UI/Button.vue";

const game = useGameStore();
const botGame = useBotGameStore();
const user = useUserStore();

const props = defineProps({
  mode: {
    type: String,
    default: "both"
  }
});

/** 
 * Верхний игрок — Stockfish 
 */
const topPlayer = computed(() => ({
  username: `Stockfish (уровень ${botGame.botParams.difficulty})`,
  color: "b"
}));

/** 
 * Нижний игрок — пользователь 
*/
const bottomPlayer = computed(() => ({
  username: user.username || "Вы",
  blitzRating: user.blitzRating ?? 1200,
  color: game.playerColor || "w"
}));

const bottomInitial = computed(() =>
  (bottomPlayer.value.username?.[0] || "Y").toUpperCase()
);

/** 
 * Активность игроков 
*/
const topActive = computed(() => topPlayer.value.color === game.currentTurn);
const bottomActive = computed(() => bottomPlayer.value.color === game.currentTurn);

/** 
 * Статус игры 
 */
const gameStatusText = computed(() => {
  if (!game.result?.type) return "";
  if (game.result.type === "draw") return "Ничья";
  if (game.result.type === "whiteWin") return "Победа белых";
  if (game.result.type === "blackWin") return "Победа чёрных";
  return "Игра окончена";
});
</script>

<style scoped lang="less">
.chess-timer {
    min-width: 280px;
    width: 100%;
    font-family: @font-main;
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
    transition:
        transform 160ms ease,
        box-shadow 160ms ease,
        background 160ms ease;
    border: 1px solid #e6eefb;
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

.revanche-btn {
    display: inline-block;
    box-sizing: border-box;
    font-weight: 700;
    cursor: pointer;
    padding: 15px 30px;
    width: 100%;
    background-color: @green-200;
    border: none;
    color: @text-main;
    font-size: 16px;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      background-color: @green-300;
    }
}



@media (max-width: 990px) {
    .player-avatar {
        width: 40px;
        height: 40px;
        border-radius: 7px;
        font-size: 16px;
    }

    .player-name {
        font-size: 14px;
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
}

@media (max-width: 480px) {}

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
