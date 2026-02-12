<template>
  <div class="main">
    <div class="play-friends">
      <template v-if="userStore.isLoggedIn">
        <Button 
        variant="primary" 
        @click="playWithComputer"
        :icon="cpuIcon"
        >
          Сыграть с компьютером
        </Button>

        <Button 
        variant="primary" 
        @click="openInvite"
        :icon="personIcon"
        >
          Бросить вызов другу
        </Button>
      </template>

      <template v-else>
        <AuthPrompt />
      </template>
    </div>
    
    <NewsFeed></NewsFeed>

    <InviteModal
      v-if="showInvite"
      @close="showInvite = false"
      @created="onRoomCreated"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/userStore";
import { RouterLink } from "vue-router";

import InviteModal from "@/components/modals/InviteModal.vue";
import NewsFeed from "@/components/news/NewsFeed.vue";
import Button from "@/UI/Button.vue";
import AuthPrompt from "@/UI/AuthPrompt.vue";

import cpuIcon from "@/assets/icons/main-page/cpu.svg"
import personIcon from "@/assets/icons/main-page/person.svg"

const userStore = useUserStore();

const showInvite = ref(false);

function openInvite() {
  showInvite.value = true;
}

function onRoomCreated(roomData) {
  console.log("Создана комната:", roomData); // roomData = { roomId: '...', color: '...' }
}
</script>

<style scoped>
.main {
  box-sizing: border-box;
  background: #1c1c1c;
  width: calc(100% - 60px); 
  height: 100%;
  padding-top: 100px;
  margin: 0 30px;
  color: #ecf0f1;
}

.play-friends {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  gap: 20px;
  padding: 20px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 15px;
  max-width: 600px;
  margin-bottom: 100px;
}

@media (max-width: 768px) {
  .main {
    width: calc(100% - 30px); 
    margin: 0 15px;
  }
}
</style>
