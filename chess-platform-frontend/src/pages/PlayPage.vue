<template>
  <div class="play">
      <div class="board_chess">
        <div class="board-section">
        <ChessClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-top"
          mode="top"
          :managePrestart="false"
        />

        <ChessBoard 
          :flipped="game.playerColor === 'b'" 
          :playerColor="game.playerColor" 
        /> 

        <ChessClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-bottom"
          mode="bottom"
          :managePrestart="false"
        />
        </div>
        
        <ChessClock 
          v-if="!isMobile"
          class="desktop-clock"
          mode="both"
          :managePrestart="true"
        />
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import ChessBoard from "@/components/ChessBoard.vue";
import ChessClock from "@/components/ChessClock.vue";
import { useUserStore } from "@/store/user";

const game = useGameStore();
const user = useUserStore();
const route = useRoute();

const isMobile = ref(false);

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  const roomId = route.params.roomId;
  const colorQuery = route.query.color;

  let finalColor;
  if (colorQuery === "w") finalColor = "b";
  else if (colorQuery === "b") finalColor = "w";
  else finalColor = Math.random() > 0.5 ? "w" : "b"; // если "random" или нет параметра

  if (roomId) {
    game.connectToServer(roomId, finalColor, user.username);
  } else {
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});

watch(() => game.playerColor, (newColor, oldColor) => {
  console.log("🔴 playerColor ИЗМЕНИЛСЯ:", { 
    from: oldColor, 
    to: newColor,
    timestamp: new Date().toISOString()
  });
}, { immediate: true });

</script>

<style scoped>
.play {
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}
.board_chess {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.board-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  /* max-width оставляет место для десктопных часов. при желании подправь */
  max-width: calc(100% - 480px);
  box-sizing: border-box;
}

/* Desktop clock: фиксируем ширину, чтобы она выглядела как панель */
.desktop-clock {
  width: min(430px, 30%);
  max-width: 430px;
}

/* Mobile clocks по умолчанию скрыты */
.mobile-clock {
  display: none;
}

/* ===== Mobile rules ===== */
@media (max-width: 768px) {
  .board_chess {
    flex-direction: column;
    align-items: center;
    padding: 8px;
    gap: 10px;
  }

  /* скрываем десктоп-таймер на мобильных */
  .desktop-clock {
    display: none;
  }

  .board-section {
    max-width: 100%;
    width: 100%;
    padding: 0 8px;
  }

  /* Показываем мобильные часы */
  .mobile-clock {
    display: block;
    width: 100%;
    max-width: 430px;
  }

  .mobile-clock-top {
    margin-bottom: 4px;
  }
  .mobile-clock-bottom {
    margin-top: 4px;
  }
}
</style>
