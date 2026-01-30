<template>
    <div class="coordinates">
            <TrainingSettings />

            <CoordinateBoard />

            

            <div class="sidebar-right">
                <CoordinateDescription></CoordinateDescription>
                <Button variant="primary">Начать игру</Button>

            </div>

    </div>
</template>

<script setup>
import CoordinateBoard from '@/components/coordinates/CoordinateBoard.vue';
import CoordinateDescription from '@/components/coordinates/CoordinateDescription.vue';
import TrainingSettings from '@/components/coordinates/TrainingSettings.vue';
import Button from '@/UI/Button.vue';

</script>

<style lang="less" scoped>
.coordinates {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
    width: 100%;
    max-width: 350px;
    gap: 40px;
}

</style>