<template>
  <div class="games-section">
    <div class="section-header">
      <h2 class="section-title">Последние партии</h2>
    </div>

    <div class="games-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Загружаем партии...</div>
      </div>

      <div v-else-if="filteredGames.length === 0" class="empty-state">
        <div class="empty-icon">♔</div>
        <h3 class="empty-title">Партии скоро появятся</h3>
        <p class="empty-description">
          Здесь будут отображаться ваши последние партии.<br>
          Начните играть, чтобы увидеть их здесь.
        </p>
        <button class="play-button" @click="$router.push('/')">
          Играть
        </button>
      </div>

      <div v-else class="games-grid">
        <div
          v-for="game in filteredGames"
          :key="game.id"
          class="game-card"
        >
          <div class="game-header">
            <div class="game-result" :class="getResultClass(game)">
              {{ getResultText(game) }}
            </div>
            <div class="game-date">
              {{ formatDate(game.date) }}
            </div>
          </div>

          <div class="game-players">
            <div class="player white">
              <div class="player-color white"></div>
              <div class="player-info">
                <div class="player-name">{{ game.whiteUsername || "Anonymous" }}</div>
                <!-- <div class="player-rating">?</div> -->
              </div>
            </div>
            
            <div class="vs">vs</div>
            
            <div class="player black">
              <div class="player-color black"></div>
              <div class="player-info">
                <div class="player-name">{{ game.blackUsername || "Anonymous" }}</div>
                <!-- <div class="player-rating">?</div> -->
              </div>
            </div>
          </div>

          <div class="game-footer">
            <div class="game-meta">
              <div class="meta-item">
                <span class="meta-icon">📊</span>
                <span>{{ game.moves.length }} ходов</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span>{{ game.timeControl || "5+0" }}</span>
              </div>
            </div>
            
            <div class="game-reason" v-if="game.reason">
              <span class="reason-badge">{{ getReasonText(game.reason) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref("all");
const games = ref([]);
const loading = ref(true);

const filteredGames = computed(() => games.value);

const fetchGames = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/games?userId=${userStore.userId}`
    );
    if (response.ok) {
      games.value = await response.json();
    }
  } catch (err) {
    console.error("Ошибка загрузки партий:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (userStore.userId) {
    fetchGames();
  }
});

const getResultClass = (game) => {
  if (game.result === "draw") return "draw";

  const userWon =
    (game.result === "whiteWin" && game.playerColor === "white") ||
    (game.result === "blackWin" && game.playerColor === "black");

  return userWon ? "win" : "loss";
};

const getResultText = (game) => {
  if (game.result === "draw") return "Ничья";
  const userWon = getResultClass(game) === "win";
  return userWon ? "Победа" : "Поражение";
};

const getReasonText = (reason) => {
  const reasons = {
    checkMate: "Мат",
    stalemate: "Пат",
    "threefold-repetition": "Трёхкратное повторение",
    "insufficient-material": "Недостаточно материала",
    "50-move-rule": "Правило 50 ходов",
    timeOut: "Время истекло",
    "give-up": "Игрок сдался",
    "agreed-draw": "Ничья по договоренности",
    no_move: "Игра отменена",
  };
  return reasons[reason] || reason;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Неизвестно";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Сегодня " + date.toLocaleTimeString("ru-RU", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } else if (diffDays === 1) {
    return "Вчера " + date.toLocaleTimeString("ru-RU", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } else if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  } else {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short"
    });
  }
};
</script>

<style scoped lang="less">
.games-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.play-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2563eb;
  }
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.game-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.game-result {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.win {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  &.loss {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }

  &.draw {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }
}

.game-date {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.game-players {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f9fafb;
  border-radius: 8px;

  &.white {
    justify-content: flex-end;
    text-align: right;
    
    .player-color {
      background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
      border: 2px solid #d1d5db;
      order: 2; 
      margin-left: 8px;
    }
    
    .player-info {
      order: 1; 
    }
  }

  &.black {
    justify-content: flex-start;
    text-align: left;
    
    .player-color {
      background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
      border: 2px solid #111827;
      order: 1; 
      margin-right: 8px;
    }
    
    .player-info {
      order: 2; 
    }
  }
}

.player-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  
  .player.white & {
    align-items: flex-end;
  }
  
  .player.black & {
    align-items: flex-start;
  }
}

.player-name {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-rating {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  opacity: 0.7;
}

.vs {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  padding: 0 4px;
  flex-shrink: 0;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.game-meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.meta-icon {
  font-size: 12px;
  opacity: 0.7;
}

.reason-badge {
  font-size: 11px;
  padding: 3px 8px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 12px;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .games-section {
    padding: 16px;
  }

  .games-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .game-players {
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .player {
    width: auto;
    flex: 1;
    min-width: 0;
    padding: 6px 8px;
    
    &.white {
      justify-content: flex-end; 
      text-align: right;
      flex-direction: row; 
      
      .player-color {
        order: 2; /* Кружок справа (ближе к VS) */
        margin-left: 8px;
        margin-right: 0;
      }
      
      .player-info {
        order: 1; 
        align-items: flex-end; 
      }
    }
    
    &.black {
      justify-content: flex-start; 
      text-align: left;
      flex-direction: row; 
      
      .player-color {
        order: 1; /* Кружок слева (ближе к VS) */
        margin-right: 8px;
        margin-left: 0;
      }
      
      .player-info {
        order: 2; 
        align-items: flex-start; 
      }
    }
  }

  .vs {
    order: 0;
    margin: 0;
    flex-shrink: 0;
    padding: 0 6px;
    font-size: 11px;
  }

  .player-color {
    width: 14px;
    height: 14px;
  }

  .player-name {
    font-size: 13px;
  }

  .game-footer {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding-top: 10px;
  }

  .game-meta {
    width: auto;
    justify-content: flex-start;
    gap: 12px;
  }

  .game-reason {
    text-align: right;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .game-card {
    padding: 14px;
  }

  .section-title {
    font-size: 18px;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }

  .game-players {
    gap: 6px;
  }

  .player {
    padding: 5px 6px;
    
    &.white {
      .player-color {
        margin-left: 6px;
      }
    }
    
    &.black {
      .player-color {
        margin-right: 6px;
      }
    }
  }

  .player-color {
    width: 12px;
    height: 12px;
  }

  .player-name {
    font-size: 12px;
  }

  .vs {
    font-size: 10px;
    padding: 0 4px;
  }

  .game-footer {
    flex-wrap: wrap;
    gap: 6px;
  }

  .game-meta {
    gap: 8px;
  }

  .meta-item {
    font-size: 11px;
  }

  .meta-icon {
    font-size: 11px;
  }

  .reason-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}

@media (max-width: 360px) {
  .game-players {
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .player-name {
    font-size: 11px;
  }

  .vs {
    font-size: 9px;
    padding: 0 3px;
  }

  .game-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .game-meta {
    width: 100%;
    justify-content: space-between;
  }

  .game-reason {
    text-align: center;
    margin-top: 4px;
  }
}
</style>