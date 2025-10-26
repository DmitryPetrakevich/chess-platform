<template>
  <div class="play">
      <div class="board_chess">
        <ChessBoard 
          :flipped="game.playerColor === 'b'" 
          :playerColor="game.playerColor" 
        />  
        <!-- <ChessClock /> -->
      </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import ChessBoard from "@/components/ChessBoard.vue";
import ChessClock from "@/components/ChessClock.vue";
import { useUserStore } from "@/store/user";

const game = useGameStore();
const user = useUserStore();
const route = useRoute();

onMounted(() => {
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
  /* margin-top: 50px; */
}
.board_chess {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
