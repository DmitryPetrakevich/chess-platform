<template>
  <div class="main">
    <div class="play-friends">
      <template v-if="userStore.isLoggedIn">
        <Button 
        variant="primary" 
        @click="openBotModal"
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

    <GameSettingsModal
      v-if="showInvite"
      @close="showInvite = false"
      @created="onRoomCreated"
    />

    <BotGameSettingsModal
    v-if="showBotModal"
    @close="showBotModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/userStore";
import { useGameStore } from "@/store/gameStore";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";

import GameSettingsModal from "@/components/modals/GameSettingsModal .vue";
import NewsFeed from "@/components/news/NewsFeed.vue";
import Button from "@/UI/Button.vue";
import AuthPrompt from "@/UI/AuthPrompt.vue";

import cpuIcon from "@/assets/icons/main-page/cpu.svg"
import personIcon from "@/assets/icons/main-page/person.svg"
import BotGameSettingsModal from "@/components/modals/BotGameSettingsModal.vue";

const userStore = useUserStore();
const game = useGameStore()
const router = useRouter()

const showInvite = ref(false);
const showBotModal = ref(false)

function openInvite() {
  game.leaveCurrentGame()
  showInvite.value = true;
}

function onRoomCreated(roomData) {
  console.log("Создана комната:", roomData); // roomData = { roomId: '...', color: '...' }
}

function openBotModal () {
  showBotModal.value = true;
}
</script>

<style scoped lang="less">
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  background: @black-900;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding: 0 20px;
  padding-top: 80px;
  color: #ecf0f1;
}

.play-friends {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  gap: 20px;
  padding: 20px;
  background-color: @black-800;
  border: 1px solid #444;
  border-radius: 15px;
  max-width: 600px;
  margin-bottom: 100px;
}

@media (max-width: 768px) {
  .main {
    padding: 0 10px;
  }
}
</style>
