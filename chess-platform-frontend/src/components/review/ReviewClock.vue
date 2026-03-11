<template>
    <div class="chess-timer" role="region" aria-label="Chess clock">
        <div class="chess-timer__container">
            <div v-if="mode !== 'bottom'" class="player-info player-top"
                aria-live="polite">
                <div class="player-left">
                    <div class="player-avatar" :title="topPlayer.username">
                        {{ topInitial }}
                    </div>
                    <div class="player-details">
                        <div class="player-name" :title="topPlayer.username">
                            {{ topPlayer.username }}
                        </div>
                        <div class="player-rating">{{ topPlayer.blitzRating }}</div>
                    </div>
                </div>
            </div>

            <div class="middle">
                <ReviewReplayer v-if="mode === 'both'" />
                <ReviewHistory v-if="mode === 'both'" />

                <div v-if="mode === 'both' && gameStore.result.type" class="game-status" role="status"
                    aria-live="polite">
                    {{ gameStatusText }}
                </div>

                <div v-if="gameStore.result.type && mode === 'both'">
                    <router-link class="back-to-main" to="/">
                        Вернуться на главную
                    </router-link>
                </div>
            </div>

            <div v-if="mode !== 'top'" class="player-info player-bottom">
                <div class="player-left">
                    <div class="player-avatar" :title="bottomPlayer.username">
                        {{ bottomInitial }}
                    </div>
                    <div class="player-details">
                        <div class="player-name" :title="bottomPlayer.username">
                            {{ bottomPlayer.username }}
                        </div>
                        <div class="player-rating">{{ bottomPlayer.blitzRating }}</div>
                    </div>
                </div>
            </div>

            <div v-if="mode === 'bottom' && gameStore.result.type" class="game-status" role="status" aria-live="polite">
                {{ gameStatusText }}
            </div>

            <div v-if="gameStore.result.type && mode === 'bottom'">
                <router-link class="back-to-main" to="/">
                    Вернуться на главную
                </router-link>
            </div>
            <ReviewReplayer v-if="mode === 'bottom'" />
        </div>
    </div>
</template>

<script setup>
import {ref,computed,watch,onMounted,onBeforeUnmount,defineProps,} from "vue";
import { useUserStore } from "@/store/userStore";
import { useGameStore } from "@/store/gameStore";
import { useTimerStore } from "@/store/timerStore";

import ReviewHistory from "./ReviewHistory.vue";
import ReviewReplayer from "./ReviewReplayer.vue";

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
    currentGame: {
        type: Object
    },
    flipped: {
        type: Boolean,
        default: false
    }
});

/**
 * Определяет данные верхнего игрока (оппонента)
 */
const topPlayer = computed(() => {
  if (props.flipped) {
    return {
      username: props.currentGame?.whiteUsername || "Opponent",
      blitzRating: props.currentGame?.whiteRating ?? 1200,
      color: "w"
    };
  }
  
  return {
    username: props.currentGame?.blackUsername || "Opponent",
    blitzRating: props.currentGame?.blackRating ?? 1200,
    color: "b"
  };
});

/**
 * Данные нижнего игрока (пользователь)
 */
const bottomPlayer = computed(() => {
  if (props.flipped) {
    return {
      username: props.currentGame?.blackUsername || userStore.username || "You",
      blitzRating: props.currentGame?.blackRating ?? userStore.blitzRating ?? 1200,
      color: "b"
    };
  }
  
  return {
    username: props.currentGame?.whiteUsername || userStore.username || "You",
    blitzRating: props.currentGame?.whiteRating ?? userStore.blitzRating ?? 1200,
    color: "w"
  };
});

const bottomInitial = computed(() =>
  (bottomPlayer.value.username?.[0] || "Y").toUpperCase()
);

const topInitial = computed(() =>
  (topPlayer.value.username?.[0] || "O").toUpperCase()
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

.chess-timer.flipped {
  transform: rotate(180deg);
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

@media (max-width: 990px) {
    .player-avatar {
        width: 40px;
        height: 40px;
        border-radius: 7px;
        font-size: 16px;
    }

    .back-to-main {
        font-size: 14px;
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

    .back-to-main {
        font-size: 12px;
        padding: 15px 30px;
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