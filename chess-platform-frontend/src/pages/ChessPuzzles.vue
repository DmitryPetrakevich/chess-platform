<template>
    <div class="coordinates">
        <div class="info">
            <h1 class="title">
                Решение шахматных заадч
            </h1>
            
            <p class="description">
                Скоро на этой странице будет логика решения шахматных задач
            </p>
        </div>
    </div>
</template>

<script setup>

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

.description {
    color: #bdc3c7;
    font-size: 1.3rem;
    line-height: 1.6;
    margin: 0;
}
</style>