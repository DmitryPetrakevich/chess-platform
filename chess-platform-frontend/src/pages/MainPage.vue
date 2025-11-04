<template>
  <div class="main">

    <div class="play-friends">
      <!-- <router-link to="/play" class="play-friends-btn">
        Сыграть с компьютером
      </router-link> -->

      <button class="play-friends-btn">
        Сыграть с компьютером
      </button>

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

.play-friends {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  border: 1px solid #34495e;
  border-radius: 12px;
  padding: 20px;
  min-width: 200px;
  max-width: 300px;
  margin: 0 auto;
  background-color: #353535;
}

.play-friends-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;                
  max-width: 500px;
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
  transition: all 0.3s ease;
}

.play-friends-btn:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-1px);
}

.play-friends-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(52, 152, 219, 0.4);
}

@media(max-width: 480px) {
  .play-friends {
    padding: 10px;
    width: 250px;
  }

  .play-friends-btn {
    font-size: 12px;
    min-width: 220px;  
    padding: 10px 5px;
  }
}
</style>
