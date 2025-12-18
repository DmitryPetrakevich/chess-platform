<template>
  <div class="games-section">
    <div class="section-header">
      <h2 class="section-title">Последние партии</h2>
    </div>

    <div class="games-list">
      <div v-if="loading" class="games-empty">
        <div class="empty-title">Загрузка партий...</div>
      </div>

      <div v-else-if="filteredGames.length === 0" class="games-empty">
        <div class="empty-icon">♔</div>
        <h3 class="empty-title">Партии скоро появятся</h3>
        <p class="empty-description">
          Здесь будут отображаться ваши последние партии.<br>
          Начните играть, чтобы увидеть их здесь.
        </p>
      </div>

      <div v-else class="games-items">
        <div
          v-for="game in filteredGames"
          :key="game.id"
          class="game-item"
          @click="viewGame(game.id)"
        >
          <div class="game-result" :class="getResultClass(game)">
            {{ getResultText(game) }}
            <small v-if="game.reason" class="reason-text">
              {{ getReasonText(game.reason) }}
            </small>
          </div>

          <div class="game-opponent">
            <div class="opponent-name">
              {{ game.whiteUsername || "Anonymous" }} vs {{ game.blackUsername || "Anonymous" }}
            </div>
          </div>

          <div class="game-moves">
            {{ game.moves.length }} {{ declOfNum(game.moves.length, ["ход", "хода", "ходов"]) }}
          </div>

          <!-- Дата -->
          <div class="game-date">
            {{ formatDate(game.date) }}
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

const tabs = [
  { id: "all", label: "Все" },
  { id: "blitz", label: "Блиц" },
  { id: "bullet", label: "Пуля" },
  { id: "rapid", label: "Рапид" },
];

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

const viewGame = (gameId) => {
  router.push(`/replay/${gameId}`);
};

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
    timeOut: "Истекло время",
    "give-up": "Сдался",
    "agreed-draw": "По соглашению",
    no_move: "Отменена",
  };
  return reasons[reason] || reason;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Неизвестно";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } else {
    return date.toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const declOfNum = (n, titles) => {
  return titles[
    n % 10 === 1 && n % 100 !== 11
      ? 0
      : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
      ? 1
      : 2
  ];
};
</script>

<style scoped lang="less">
.games-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.game-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }
}

.game-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 20px;
  min-width: 90px;
  text-align: center;

  &.win {
    background: #d1fae5;
    color: #065f46;
  }

  &.loss {
    background: #fee2e2;
    color: #991b1b;
  }

  &.draw {
    background: #fef3c7;
    color: #92400e;
  }

  .reason-text {
    font-size: 11px;
    margin-top: 4px;
    opacity: 0.9;
    font-weight: normal;
  }
}

.game-opponent {
  flex: 1;
  margin-left: 20px;
}

.opponent-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 20px;
}

.opponent-rating {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.game-moves,
.game-date {
  font-size: 14px;
  color: #6b7280;
  width: 120px;
  text-align: right;
}

@media (max-width: 768px) {
  .game-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .game-result {
    align-self: flex-start;
  }

  .game-moves,
  .game-date {
    width: auto;
    text-align: left;
  }
}
</style>