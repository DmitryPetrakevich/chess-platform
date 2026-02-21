import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useBotGameStore = defineStore("gameBot", () => {
  const botParams = ref({
    difficulty: "4",
  });

  const playerColor = ref("w");

  return {
    botParams,
    playerColor,
  };
});
