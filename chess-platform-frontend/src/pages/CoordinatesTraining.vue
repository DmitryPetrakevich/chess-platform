<template>
  <div class="coordinates">
    <TrainingSettings class="settings" v-if="!coordinateStore.activeTraining" />

    <CoordinatePanel class="settings" v-if="coordinateStore.activeTraining" />

    <CoordinateBoard class="board" />

    <div class="sidebar-right">
      <CoordinateDescription v-if="!coordinateStore.activeTraining" class="description" />

      <CoordinatePanel class="settings" v-if="coordinateStore.activeTraining" />
      <Button
        v-if="!coordinateStore.isActive"
        @click="coordinateStore.startTraining()"
        variant="primary"
        class="btn"
        :class="{'btn-start': coordinateStore.activeTraining}"
      >
        Начать игру
      </Button>

      <Button
        v-else
        @click="coordinateStore.stopTraining()"
        variant="secondary"
        class="btn btn-finish"
      >
        Завершить тренировку
      </Button>

      <TrainingSettings
        class="settings"
        v-if="!coordinateStore.activeTraining"
      />
    </div>
  </div>
</template>

<script setup>
import CoordinateBoard from "@/components/coordinates/CoordinateBoard.vue";
import CoordinateDescription from "@/components/coordinates/CoordinateDescription.vue";
import TrainingSettings from "@/components/coordinates/TrainingSettings.vue";
import Button from "@/UI/Button.vue";
import TimeProgress from "@/UI/TimeIndicator .vue";
import CoordinatePanel from "@/components/coordinates/CoordinatePanel.vue";

import { useCoordinatesStore } from "@/store/coordinatesStore";

const coordinateStore = useCoordinatesStore();
</script>

<style lang="less" scoped>
.coordinates {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  background-color: #1c1c1c;
  width: 100%;
  min-height: calc(100vh - 60px);
  gap: 30px;
  padding: 0 20px 20px 20px;
}

.sidebar-right {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 350px;
  width: 100%;
  gap: 20px;
  margin-right: auto;
}

.settings {
  max-width: 350px;
  min-width: 250px;
}

@media (max-width: 1400px) {
  .coordinates > .settings {
    display: none;
  }
}

@media (min-width: 1400px) {
  .sidebar-right > .settings {
    display: none;
  }

  .btn-finish,
  .btn-start {
    margin-top: 40vh;
  }
}

@media (max-width: 1100px) {
  .coordinates {
    flex-direction: column;
    padding: 10px;
  }

  .sidebar-right {
    margin: 0 auto;
    max-width: 800px;
  }

  .settings {
    max-width: 800px;
  }
}

.btn {
  font-family: 'Roboto', sans-serif;
}
</style>
