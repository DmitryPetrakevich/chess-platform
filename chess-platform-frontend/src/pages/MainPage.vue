<template>
  <div class="main">
    <div class="play-friends">
      <template v-if="userStore.isLoggedIn">
        <Button variant="primary" @click="playWithComputer">
          Сыграть с компьютером
        </Button>

        <Button variant="primary" @click="openInvite">
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

import InviteModal from "@/components/InviteModal.vue";
import NewsFeed from "@/components/news/NewsFeed.vue";
import Button from "@/UI/Button.vue";
import AuthPrompt from "@/UI/AuthPrompt.vue";

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
  background: #1c1c1c;
  width: 100%;
  height: 100vh;
  padding-top: 100px;
  color: #ecf0f1;
}

.play-friends {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 50px;
  border-radius: 12px;
  padding: 20px;
  margin: 0 auto;
}

</style>
