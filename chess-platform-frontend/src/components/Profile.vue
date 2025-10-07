<template>
    <div class="coordinates">
        <div class="info">
            <h1 class="title">
                Профиль игрока {{userStore.username}}
            </h1>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';

const userStore = useUserStore()

</script>

<style scoped>
.coordinates {
    background: #2c2c2c; 
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.info {
    text-align: center;
    max-width: 600px;
}

.title {
    color: #e74c3c;
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 20px 0;
}
</style>