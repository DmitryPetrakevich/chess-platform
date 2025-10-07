<template>
  <div class="chess-timer">
    <div class="player-info player-top">
      <div class="player-avatar">♛</div>
      <div class="player-details">
        <div class="player-name">{{userStore.username}}</div>
        <div class="player-rating">{{userStore.blitzRating}}</div>
      </div>
      <div class="timer timer-top">5:00</div>
    </div>

    <div class="moves-history">История ходов</div>

    <div class="game-result"></div>

    <div class="game-status">Мат, победа белых</div>

    <div class="player-info player-bottom">
      <div class="player-avatar">♛</div>
      <div class="player-details">
        <div class="player-name">Player1</div>
        <div class="player-rating">1000</div>
      </div>
      <div class="timer timer-bottom">5:00</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useGameStore } from "../store/gameStore";
import { useUserStore } from "@/store/user";

const gameStore = useGameStore();
const userStore = useUserStore();
</script>

<style scoped>
.chess-timer {
  width: 300px;
  max-height: 400px;
  background: rgba(30, 30, 46, 0.9);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(40, 40, 60, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.player-info.active {
  background: rgba(50, 50, 80, 0.9);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.player-avatar {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.player-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.player-rating {
  font-size: 12px;
  color: #aaa;
}

.timer {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  min-width: 80px;
  text-align: center;
  transition: all 0.3s ease;
}

.timer-top {
  color: #ff9800;
}

.timer-bottom {
  color: #2196f3;
}

.timer.low-time {
  color: #f44336;
  animation: pulse 1s infinite;
  background: rgba(244, 67, 54, 0.1);
}

/*ХЗ что этл */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.game-status {
  text-align: center;
  padding: 12px;
  background: rgba(50, 50, 70, 0.8);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.moves-history {
  background: rgba(35, 35, 50, 0.8);
  border-radius: 6px;
  padding: 15px;
  color: white;
}

.game-result {
  text-align: center;
  padding: 20px;
  background: rgba(25, 25, 35, 0.9);
  border-radius: 8px;
}
</style>
