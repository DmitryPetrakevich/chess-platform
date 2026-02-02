<template>
  <div class="coordinates">
    <TrainingSettings class="settings" v-if="!coordinateStore.activeTraining" />

    <CoordinatePanel class="settings" v-if="coordinateStore.activeTraining" />

    <CoordinateBoard />

    <div class="sidebar-right">
      <CoordinateDescription  />
      
      <Button 
        v-if="!coordinateStore.isActive"
        @click="coordinateStore.startTraining()"
        variant="primary"
        class="btn"
      >
        Начать игру
      </Button>
      
      <Button 
        v-else
        @click="coordinateStore.stopTraining()"
        variant="secondary"
        class="btn"
      >
        Завершить тренировку
      </Button>

      <TrainingSettings class="settings" v-if="!coordinateStore.activeTraining" />

      <CoordinatePanel class="settings" v-if="coordinateStore.activeTraining" />


    </div>

  </div>
</template>

<script setup>
import CoordinateBoard from "@/components/coordinates/CoordinateBoard.vue";
import CoordinateDescription from "@/components/coordinates/CoordinateDescription.vue";
import TrainingSettings from "@/components/coordinates/TrainingSettings.vue";
import Button from "@/UI/Button.vue";

import { useCoordinatesStore } from "@/store/coordinatesStore";
import CoordinatePanel from "@/components/coordinates/CoordinatePanel.vue";

const coordinateStore = useCoordinatesStore()
</script>

<style lang="less" scoped>
.coordinates {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start; 
  box-sizing: border-box;
  background-color: #1c1c1c;
  width: 100%;
  min-height: 100vh;
  gap: 20px;
  padding: 0 20px 20px 20px;
}

.sidebar-right {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 350px;
  gap: 20px;
  margin-left: auto;
}

@media (max-width: 1200px) {
  .coordinates > .settings {
    display: none;
  }


}

@media (min-width: 1200px) {
  .sidebar-right > .settings {
    display: none;
  }




}

</style>
