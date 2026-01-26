<template>
  <div class="main">

  <div class="play-friends">
    <template v-if="userStore.isLoggedIn">
      <button class="play-friends-btn">
        Сыграть с компьютером
      </button>

      <button class="play-friends-btn" @click="openInvite">
        Бросить вызов другу
      </button>
    </template>

    <template v-else>
      <div class="auth-message">
        <p class="auth-title">Зарегистрируйтесь, чтобы играть</p>
        <p class="auth-desc">Создайте аккаунт или войдите, чтобы начать партию с другом</p>
        <div class="auth-buttons">
          <router-link to="/login" class="auth-btn login">
            Войти
          </router-link>
          <router-link to="/signup" class="auth-btn signup">
            Регистрация
          </router-link>
        </div>
      </div>
    </template>
  </div>

    <InviteModal v-if="showInvite" @close="showInvite = false" @created="onRoomCreated" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';
import { RouterLink } from 'vue-router'

import InviteModal from '@/components/InviteModal.vue';

const userStore = useUserStore();

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
  background: #1c1c1c; 
  width: 100%;
  height: 100vh;
  padding-top: 100px;
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
  background-color: #202020; 
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

.auth-message {
  text-align: center;
  padding: 20px;
  color: #bdc3c7;
}

.auth-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: white;
}

.auth-desc {
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
}

.login {
  background: #555;
  color: white;
}

.login:hover {
  background: #666;
}

.signup {
  background: #e74c3c;
  color: white;
}

.signup:hover {
  background: #c0392b;
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
