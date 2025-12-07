<template>
  <div class="play">
    <div class="play-content">
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
import { useUserStore } from "@/store/userStore";

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
  console.log(" playerColor ИЗМЕНИЛСЯ:", { 
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
  padding: 10px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
  background-color: rgb(236, 236, 236);
}

.play-content {
  display: flex;
  align-items: center;     
  justify-content: center; 
  width: 100%;
  max-width: 1200px;
}

.board_chess {
  display: flex;
  flex-direction: row;
  max-width: 1800px;
}

.board-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.desktop-clock {
  margin: auto 0;
  width:  min(800px, 60%);
  max-width: 430px;
}

.mobile-clock {
  display: none;
}

@media (max-width: 768px) {
  .board_chess {
    flex-direction: column;
    align-items: center;
    padding: 8px;
    gap: 10px;
  }

  .play-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .desktop-clock {
    display: none;
  }

  .board-section {
    max-width: 100%;
    width: 100%;
    padding: 0 8px;
    gap: 0;
  }

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
