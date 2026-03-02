<template>
  <div class="games-section">
    <div class="section-header">
      <h2 class="section-title">Последние партии</h2>
    </div>

    <div class="games-list">
      <div v-if="loading" class="loading-state">
        <div class="material-spinner"></div>
        <div class="loading-text">Загружаем партии...</div>
      </div>

      <div v-else-if="filteredGames.length === 0" class="empty-state">
        <div class="empty-icon">♔</div>
        <h3 class="empty-title">Партии скоро появятся</h3>
        <p class="empty-description">
          Здесь будут отображаться ваши последние партии.<br />
          Начните играть, чтобы увидеть их здесь.
        </p>
        <button class="play-button" @click="$router.push('/')">Играть</button>
      </div>

      <div v-else class="games-grid">
        <div v-for="game in filteredGames" :key="game.id" class="game-card">
          <div class="mini-board-wrapper">
            <MiniChessBoard :fen="game.finalFen" :size="200" />
          </div>

          <div class="game-info">
            <div class="game-mode">
              <span class="mode-time">{{ game.timeControl || "5+0" }}</span>
              • {{ getGameMode(game.timeControl) }} • {{ game.mode || "ТОВАРИЩЕСКАЯ" }}
            </div>

            <div class="game-players">
              <div class="player white">
                <span class="player-name">{{
                  game.whiteUsername || "Anonymous"
                }}</span>
                <span class="player-rating"
                  >({{ game.whiteRating || "1500" }})</span
                >
              </div>
              <div class="vs">VS</div>
              <div class="player black">
                <span class="player-name">{{
                  game.blackUsername || "Anonymous"
                }}</span>
                <span class="player-rating"
                  >({{ game.blackRating || "1500" }})</span
                >
              </div>
            </div>

            <div
              class="game-result"
              :class="{
                win:
                  (game.result === 'whiteWin' && game.playerColor === 'white') 
                  ||
                  (game.result === 'blackWin' && game.playerColor === 'black'),
                lose:
                  (game.result === 'whiteWin' && game.playerColor === 'black') 
                  ||
                  (game.result === 'blackWin' && game.playerColor === 'white'),
              }"
            >
              {{ getResultText(game) }}  {{ getReasonText(game.reason) }}
            </div>

            <div class="game-opening">
              {{ getOpeningText(game) }} •
              {{ Math.ceil(game.moves.length / 2) }} ходов
            </div>

            <div class="game-date">
              {{ formatDate(game.date) }}
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

import MiniChessBoard from "./MiniChessBoard.vue";

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
      `http://localhost:3000/api/games?userId=${userStore.userId}`,
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
  if (game.result === "draw") return "";
  const userWon = getResultClass(game) === "win";
  return userWon ? "Победа •" : "Поражение •";
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

const getGameMode = (timeControl) => {
  if(!timeControl) return "10+0"

  const [minutes] = timeControl.split("+").map(Number)

  if(minutes <= 2) {
    return "ПУЛЯ"
  } else if(minutes < 10) {
    return "БЛИЦ"
  } else if(minutes < 60) {
    return "РАПИД"
  } else {
    return "КЛАССИКА"
  }
}

const getOpeningText = (game) => {
  const movesToShow = game.moves.slice(0, 6);
  
  const formattedMoves = [];
  for (let i = 0; i < movesToShow.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = movesToShow[i];
    const blackMove = movesToShow[i + 1] ? movesToShow[i + 1] : '';
    
    if (blackMove) {
      formattedMoves.push(`${moveNumber}. ${whiteMove} ${blackMove}`);
    } else {
      formattedMoves.push(`${moveNumber}. ${whiteMove}...`);
    }
  }
  
  return formattedMoves.join(' ') + (game.moves.length > 6 ? ' ...' : '');
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Неизвестно";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return (
      "Сегодня " +
      date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (diffDays === 1) {
    return (
      "Вчера " +
      date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  } else {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  }
};

</script>

<style scoped lang="less">
.games-section {
  background-color: @black-700;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #ddd;
  margin: 0;
}

.games-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.game-card {
  display: flex;
  gap: 16px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.mini-board-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  // width: 140px;
  // height: 140px;
  // border: 2px solid #444;
  border-radius: 8px;
  overflow: hidden;
}

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-mode {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #aaa;
}

.mode-time {
  font-size: 25px;
  font-weight: 600;
}

.game-players {
  display: flex;
  align-self: center;
  gap: 8px;
  margin-top: 40px;
  font-size: 15px;
  font-weight: 500;
  color: #ddd;
}

.player {
  display: flex;
  align-items: center;
  gap: 4px;
}

.player-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 20px;
}

.player-rating {
  color: #888;
  font-size: 13px;
}

.vs {
  color: #666;
  font-size: 14px;
  padding: 0 8px;
}

.game-result {
  display: flex;
  align-items: center;
  align-self: center;
  gap: 8px;
  font-weight: 500;
  font-size: 15px;
  color: @gray-400;;

  &.win {
    color: @green-500;
  }

  &.lose {
    color: @red-500;
  }
}

.game-opening {
  margin-top: auto;
  font-size: 13px;
  color: #888;
  font-style: italic;
}

.game-date {
  font-size: 12px;
  color: #666;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.material-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #333;
  border-top-color: @green-500;  
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #888;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 48px 24px;
  text-align: center;
  background: #1a1a1a;
  border-radius: 16px;
  border: 1px solid #2a2a2a;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #3a3a3a;
  }
}

.empty-icon {
  font-size: 48px;
  color: #444;
  margin-bottom: 16px;
  line-height: 1;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  color: #999;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
}

.empty-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
  max-width: 300px;
}

.play-button {
  background: transparent;
  color: #888;
  border: 1px solid #333;
  border-radius: 30px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: @green-500;
    border-color: @green-500;
    background: rgba(@green-500, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
}

@media (max-width: 768px) {
  .game-card {
    flex-direction: column;
    gap: 12px;
  }

  .mini-board-wrapper {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
  }
}
</style>
