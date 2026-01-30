<template>
    <div class="settings">
        <CoordinateMode></CoordinateMode>
        <CoordinateBoardOrientation></CoordinateBoardOrientation>
        <CoordinateStats></CoordinateStats>

        <Toggle v-model="showPieces">Показать фигуры</Toggle>
        <Toggle v-model="showCoordinates">Показать координаты</Toggle>

    </div>
</template>

<script setup>
import { ref } from 'vue';

import Button from '@/UI/Button.vue';
import CoordinateMode from './CoordinateMode.vue';
import CoordinateBoardOrientation from './CoordinateBoardOrientation.vue';
import CoordinateStats from './CoordinateStats.vue';
import Toggle from '@/UI/Toggle.vue';

const showPieces = ref(true)
const showCoordinates = ref(true)


</script>

<style lang="less" scoped>
.settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 10px;
    background-color: #2a2a2a;
    min-width: 300px;
    max-width: 400px;
}
</style>