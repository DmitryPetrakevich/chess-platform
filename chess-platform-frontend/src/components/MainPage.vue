<template>
    <div class="main">
        <div class="quick-start">
            <router-link 
            to="/play"
            class="quick-start-btn">
                Сыграть с компьютером
            </router-link>
            <button
            class="quick-start-btn">
                Бросить вызов другу
            </button>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

</script>

<style scoped>
.main {
    background: #2c2c2c; 
    width: 100%;
    height: 100vh;
    padding-top: 80px
}

.quick-start {
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center ;
    gap: 20px;
    margin-top: 80px;
    border: 1px solid #34495e;
    border-radius: 12px;
    padding: 30px;
    max-width: 400px;
    margin: 0 auto;
    background-color: #353535; 
}

.quick-start-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 300px;
    width: 100%;
    padding: 15px 20px;
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.quick-start-btn:hover {
    background: linear-gradient(135deg, #2980b9, #2471a3);
}

.quick-start-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(52, 152, 219, 0.4);
}

@media (max-width: 480px) {
    .quick-start {
        margin: 0 20px;
        padding: 25px 20px;
    }
    
    .quick-start-btn {
        padding: 14px 18px;
        font-size: 15px;
    }
}
</style>