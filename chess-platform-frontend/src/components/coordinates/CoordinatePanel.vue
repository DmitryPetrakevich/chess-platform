<template>
  <div class="panel">
    <div class="panel__container">
      <div class="result" :class="{ error: coordinatesStore.showError }">
        <span class="result-text"> Результат </span>

        <span class="result-number">
          {{ coordinatesStore.score }}
        </span>
      </div>

      <div v-if="coordinatesStore.isActive" class="timer">
        <span class="timer-text"> Время </span>

        <span
          v-if="coordinatesStore.activeMode === 'timer'"
          class="timer-time"
          :class="{ 'low-time': coordinatesStore.timeLeft < 5 }"
        >
          {{ coordinatesStore.formattedTime }}
        </span>

        <img
          v-if="coordinatesStore.activeMode === 'infinite'"
          class="timer-img"
          :src="infiniteIcon"
        />
      </div>

      <div v-if="coordinatesStore.isActive" class="color">
        <img
          class="color-img"
          :src="
            coordinatesStore.activeColor === 'white' ? whiteIcon : blackIcon
          "
        />

        <span class="color-text">
          Вы играете
          {{
            coordinatesStore.activeColor === "white" ? "белыми" : "черными"
          }}
          фигурами
        </span>
      </div>

      <div v-if="!coordinatesStore.isActive" class="settings">
        <TrainingSettings></TrainingSettings>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import { useCoordinatesStore } from "@/store/coordinatesStore";
import { disposePinia } from "pinia";
import Button from "@/UI/Button.vue";

import CoordinateMode from "./CoordinateMode.vue";
import CoordinateBoardOrientation from "./CoordinateBoardOrientation.vue";
import CoordinateStats from "./CoordinateStats.vue";
import Toggle from "@/UI/Toggle.vue";

import whiteIcon from "@/assets/game/inviteModel/choice-white.svg";
import blackIcon from "@/assets/game/inviteModel/choice-black.svg";
import infiniteIcon from "@/assets/icons/coordinate-page/infinite.svg";
import TrainingSettings from "./TrainingSettings.vue";

const coordinatesStore = useCoordinatesStore();
</script>

<style lang="less" scoped>
.panel {
  display: flex;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 10px;
  background-color: #2a2a2a;
  margin-left: auto;
  width: 100%;
}

.panel__container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 15px;
  width: 100%;
  height: 100%;
}

.result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  gap: 15px;
  width: 100%;
  height: 160px;
  background-color: #454545;
  border-radius: 10px;
  transition: all 0.3s ease;

  &-text {
    font-size: 45px;
    color: rgb(209, 209, 209);
  }

  &-number {
    font-size: 60px;
    color: rgb(209, 209, 209);
  }

  &.error {
    .result-number {
      color: #ff3b30;
    }
  }
}

.timer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  gap: 15px;
  width: 100%;
  height: 160px;
  padding: 10px;
  background-color: #454545;
  border-radius: 10px;

  &-text {
    font-size: 45px;
    color: rgb(209, 209, 209);
  }

  &-time {
    font-size: 60px;
    color: rgb(209, 209, 209);

    &.low-time {
      color: #df2c2c;
    }
  }

  &-img {
    height: 50px;
    width: 50px;
    filter: invert(1);
  }
}

.color {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  gap: 10px;
  width: 100%;
  height: 100px;
  background-color: #454545;
  border-radius: 10px;

  &-img {
    width: 50px;
    height: 50px;
  }

  &-text {
    font-size: 18px;
    color: rgb(209, 209, 209);
  }
}

.settings {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 20px;
  border-radius: 10px;
  background-color: #2a2a2a;
  width: 100%;
  // min-width: 300px;
}

@media (max-width: 480px) {
  .result {
    &-text {
      font-size: 36px;
      color: rgb(209, 209, 209);
    }

    &-number {
      font-size: 50px;
      color: rgb(209, 209, 209);
    }
  }

  .timer {
    &-text {
      font-size: 36px;
    }

    &-time {
      font-size: 50px;
    }
  }
}
</style>
