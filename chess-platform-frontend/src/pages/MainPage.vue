<template>
  <div class="main">
    <div class="quick-start">
      <h2 class="quick-start__title">Быстрый старт</h2>
      <div class="quick-start__container">
        <div class="quick-start-item" v-for="mode in modes" :key="mode.id">
          <p class="quick-start-item-time">{{ mode.time }}</p>
          <p class="quick-start-item-label">{{ mode.label }}</p>
        </div>
      </div>
    </div>

    <div class="play-friends">
      <router-link to="/play" class="play-friends-btn">
        Сыграть с компьютером
      </router-link>

      <button class="play-friends-btn" @click="openInvite">
        Бросить вызов другу
      </button>
    </div>

    <InviteModal v-if="showInvite" @close="showInvite = false" @created="onRoomCreated" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InviteModal from '@/components/InviteModal.vue';
import { RouterLink } from 'vue-router'

const modes = [
  { id: 1, time: '1 мин', label: 'Пуля' },
  { id: 2, time: '5 мин', label: 'Блиц' },
  { id: 3, time: '10 мин', label: 'Классика' }
]

const showInvite = ref(false); 

function openInvite() { 
  showInvite.value = true;
}

function onRoomCreated(roomData) {
  console.log('Создана комната:', roomData); // roomData = { roomId: '...', color: '...' }
}
</script>

<style scoped>
.main {
  background: #2c2c2c;
  width: 100%;
  height: 100vh;
  padding-top: 100px;
  /* padding-left: 40px;
  padding-right: 40px; */
  color: #ecf0f1;
}

.quick-start {
  margin: 0 auto 60px;
  max-width: 900px;
  text-align: center;
}

.quick-start__title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 25px;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  letter-spacing: 1px;
}

.quick-start__container {
  display: flex;
  flex-direction: row;
  /* justify-content: flex-start; */
  justify-content: center;
  flex-wrap: wrap;
  gap: 25px;
  
}

.quick-start-item {
  width: 200px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(145deg, #353535, #2b2b2b);
  border: 1px solid #3d3d3d;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.quick-start-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
  background: linear-gradient(145deg, #3b3b3b, #2f2f2f);
}

.quick-start-item-time {
  font-size: 26px;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 5px;
}

.quick-start-item-label {
  font-size: 15px;
  text-transform: uppercase;
  color: #ccc;
  letter-spacing: 0.5px;
}

.play-friends {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  border: 1px solid #34495e;
  border-radius: 12px;
  padding: 35px;
  max-width: 300px;
  margin: 0 auto;
  background-color: #353535;
}

.play-friends-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 250px;                
  width: auto; 
  padding: 14px 20px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-family: 'Poppins', sans-serif;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  font-family: inherit;
}

.play-friends-btn:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
}

.play-friends-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(52, 152, 219, 0.4);
}

@media (max-width: 600px) {
  .quick-start__container {
    flex-direction: column;
    align-items: center;
  }

  .quick-start-item {
    width: 80%;
    max-width: 280px;
  }
}
</style>
