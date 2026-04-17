import { defineStore } from "pinia";
import { ref, computed, onMounted, watch } from "vue";

export const useReviewStore = defineStore("review", () => {
    const theme = ref('dark')
 

  
  
  
    return {
        theme

  };
});
