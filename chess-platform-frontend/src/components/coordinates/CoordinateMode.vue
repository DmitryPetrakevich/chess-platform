<template>
  <div class="mode">
    <button 
    class="btn"
    :class="{active: coordinatesStore.activeMode === 'timer'}"
    @click="coordinatesStore.activeMode= 'timer'"
    style="border-radius: 5px 0 0 5px;"
    >
        0:30
    </button>

    <button 
    class="btn"
    :class="{active: coordinatesStore.activeMode === 'infinite'}"
    @click="coordinatesStore.activeMode= 'infinite'"
    style="border-radius: 0 5px 5px 0;"
    >
      <img 
      :src="infiniteIcon" 
      alt="Бесконечный режим" 
      class="btn-img" 
      />
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import infiniteIcon from "@/assets/icons/coordinate-page/infinite.svg"

import { useCoordinatesStore } from "@/store/coordinatesStore";

const coordinatesStore = useCoordinatesStore()

</script>

<style lang="less" scoped>
.mode {
    display: flex;
    flex-direction: row;
    width: 100%;
}

.btn {
    display: inline-flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    font-size: 20px;
    font-family: "Manrope", sans-serif;
    width: 100%;
    border: 1px solid gray;
    background-color: @gray-300;
    transition: all 0.3s ease;

    &.active {
        background-color: @blue-400;
    }
}

.btn-img {
    height: 30px;
    width: 30px;
}
</style>
