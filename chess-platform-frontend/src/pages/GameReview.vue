<template>
  <div class="review">
    <div class="review-content">
      <div class="board-section">
         <!-- <div> {{ review.currentGame }}</div> -->
        <ReviewClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-top"
          mode="top"
          :managePrestart="false"
          :id="id"
          :currentGame="review.currentGame"
          :flipped="review.flipped"
        />

        <ReviewBoard 
          :fen="review.currentFen"
          :flipped="review.flipped"
        />

        <ReviewClock
          v-if="isMobile"
          class="mobile-clock mobile-clock-bottom"
          mode="bottom"
          :managePrestart="false"
          :id="id"
          :currentGame="review.currentGame"
           :flipped="review.flipped"
        />
      </div>

      <ReviewClock 
        v-if="!isMobile"
        class="desktop-clock"
        mode="both"
        :managePrestart="false"
        :id="id"
        :currentGame="review.currentGame"
        :flipped="review.flipped"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, defineProps } from "vue";
import { useReviewStore } from "@/store/reviewStore";

import ReviewClock from "@/components/review/ReviewClock.vue";
import ReviewBoard from "@/components/review/ReviewBoard.vue";

const props = defineProps({
  id: String
})

const review = useReviewStore()
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  if (props.id) {
    review.loadGame(props.id)
    
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

onUnmounted(() => {
  review.clearCurrentGame()
})
</script>

<style lang="less" scoped>
.review {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
  background-color: @gray-300;

  &-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1200px;
    gap: 24px;
  }

  &__replayer {
    width: 100%;
    max-width: 800px;
    margin-top: 24px;
  }
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
  width: min(800px, 60%);
  max-width: 430px;
}

.mobile-clock {
  display: none;
}

@media (max-width: 768px) {
  .review {
    padding: 10px;

    &-content {
      flex-direction: column;
      gap: 0;
    }

    &__replayer {
      margin-top: 16px;
    }
  }

  .desktop-clock {
    display: none;
  }

  .board-section {
    max-width: 100%;
    width: 100%;
    padding: 0;
    gap: 0;
  }

  .mobile-clock {
    display: block;
    width: 100%;
    max-width: 430px;

    &-top {
      margin-bottom: 4px;
    }
    
    &-bottom {
      margin-top: 4px;
    }
  }
}
</style>