<template>
  <div class="play">
      <div class="board_chess">
        <!-- <p>Цвет игрока: {{ game.playerColor }}</p> -->
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

const game = useGameStore();
const route = useRoute();

onMounted(() => {
  const roomId = route.params.roomId;
  const colorQuery = route.query.color;

  let finalColor = colorQuery || "random"; 
  
  console.log("🎨 PlayPage МОНТИРУЕТСЯ:");
  console.log(" - Room ID из URL:", roomId);
  console.log(" - Цвет из URL:", colorQuery);
  console.log(" - Итоговый цвет для сервера:", finalColor);
  console.log(" - Текущий playerColor в store ДО подключения:", game.playerColor);
  console.log(" - Текущий currentRoomId в store:", game.currentRoomId);

  if (roomId) {
    console.log("🔄 Вызываю game.connectToServer()...");
    game.connectToServer(roomId, finalColor);
  } else {
    console.log("❌ Room ID не найден в URL!");
  }
});

// 🔥 ДОБАВЬ ЭТОТ watch ДЛЯ ДИАГНОСТИКИ
watch(() => game.playerColor, (newColor, oldColor) => {
  console.log("🔴 playerColor ИЗМЕНИЛСЯ:", { 
    from: oldColor, 
    to: newColor,
    timestamp: new Date().toISOString()
  });
}, { immediate: true });

// onMounted(() => {
//   const roomId = route.params.roomId;
//   const colorQuery = route.query.color;

//   let finalColor = colorQuery || "random"; 
  
//   console.log("🎨 PlayPage:");
//   console.log(" - Цвет из URL:", colorQuery);
//   console.log(" - Отправляем на сервер:", finalColor);
//   console.log(" - Текущий playerColor в store:", game.playerColor);

//   if (roomId) {
//     game.connectToServer(roomId, finalColor);
//   }
// });
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
