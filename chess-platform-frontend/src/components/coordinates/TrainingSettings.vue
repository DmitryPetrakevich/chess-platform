<template>
    <div class="settings">
        <CoordinateMode/>
        <CoordinateBoardOrientation/>
        <CoordinateStats />

        <Toggle v-model="coordinatesStore.showPieces">Показать фигуры</Toggle>
        <Toggle v-model="coordinatesStore.showCoordinates">Показать координаты</Toggle>

    </div>
</template>

<script setup>
import { ref } from 'vue';

import Button from '@/UI/Button.vue';
import CoordinateMode from './CoordinateMode.vue';
import CoordinateBoardOrientation from './CoordinateBoardOrientation.vue';
import CoordinateStats from './CoordinateStats.vue';
import Toggle from '@/UI/Toggle.vue';

import { useCoordinatesStore } from '@/store/coordinatesStore';

const coordinatesStore = useCoordinatesStore();

</script>

<style lang="less" scoped>
.settings {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    gap: 20px;
    padding: 10px;
    height: 400px;
    border-radius: 10px;
    background-color: #2a2a2a;
    min-width: 350px;
    max-width: 500px;
}
</style>