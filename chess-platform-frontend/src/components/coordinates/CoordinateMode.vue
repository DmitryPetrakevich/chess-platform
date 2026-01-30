<template>
  <div class="mode">
    <button 
    class="btn"
    :class="{active: activeButton === 'timer'}"
    @click="activeButton= 'timer'"
    >
        0:30
    </button>

    <button 
    class="btn"
    :class="{active: activeButton === 'infinite'}"
    @click="activeButton= 'infinite'"
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

const activeButton = ref('timer')

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
    width: 100%;
    border: 1px solid gray;
    background-color: @gray-300;
    transition: all 0.3s ease;

    &.active {
        background-color: @blue-400;
    }
}

.btn-img {
    height: 25px;
    width: 25px;
}
</style>
