<template>
  <div class="share">
    <div class="share__container">
      <h1 class="title">Вызвать на игру</h1>

      <div class="description">
        <div class="description-left">
          <img :src="blitzIcon" class="description-left-icon" />
          <div class="description-left-text">
            <span>{{ inviteParams.time }}</span>
            <span>{{
              inviteParams.mode === "rated" ? "Рейтинговая" : "Товарищеская"
            }}</span>
          </div>
        </div>
        <div class="description-right">
          <span>{{
            inviteParams.color === "random"
              ? "Случайный цвет"
              : inviteParams.color === "w"
                ? "Белые"
                : "Чёрные"
          }}</span>
        </div>
      </div>

      <div class="main">
        <div class="invite-link">
          <p>тобы пригласить друга, отправьте ему эту ссылку</p>

          <div class="link-row">
            <input class="link-input" :value="inviteLink" readonly />
            <button class="btn" @click="copyLink">
              {{ copied ? "Скопировано!" : "Копировать" }}
            </button>
          </div>

          <p>С вами сыграет первый, кто перейдёт по этой ссылке.</p>
        </div>

        <div class="qr">
            <p>Или позвольте вашему сопернику отсканировать этот QR-код</p>

          <Qrcode :value="inviteLink" :size="200" level="Q"></Qrcode>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import Qrcode from "qrcode.vue";

import blitzIcon from "@/assets/game/profile/blitz.svg";

const game = useGameStore();
const router = useRouter();
const user = useUserStore();

const copied = ref(false);

const inviteParams = computed(
  () =>
    game.inviteParams || {
      time: "3+0",
      mode: "friendly",
      color: "random",
    },
);

const roomId = ref(game.roomId || genId());

const inviteLink = computed(() => {
  const params = new URLSearchParams({
    time: inviteParams.value.time,
    mode: inviteParams.value.mode,
    color: inviteParams.value.color,
  });
  return `${window.location.origin}/play/${roomId.value}?${params.toString()}`;
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error("Не удалось скопировать");
  }
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

watch(
  () => game.playersCount,
  (count) => {
    if (count >= 2) {
      router.push(`/play/${roomId.value}`);
    }
  },
);

onMounted(() => {
  game.connectToServer(
    roomId.value, 
    inviteParams.value.color, 
    user.username,
    inviteParams.value.time
  );
});
</script>

<!-- <style scoped lang="less">
/* твои стили */
.waiting-message {
  margin-top: 20px;
  font-size: 18px;
  color: #aaa;
  text-align: center;
}
</style> -->

<style scoped lang="less">
.share {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: calc(100vh - 60px);
  background-color: #1c1c1c;
  color: white;
  font-family: @font-mono;
}

.share__container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 20px;
  //   height: 80vh;
  //   width: 100%;
  width: 95vw;
  max-width: 1000px;
  background-color: #2a2a2a;
  padding: 40px;
  border-radius: 10px;
}

.title {
  font-size: 36px;
  font-weight: 300;
  margin-bottom: 20px;
}

.description {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 40px;
  width: 100%;
  height: 100px;
  font-size: 25px;
  gap: 20px;
  border-radius: 5px;
  background-color: #545454;
  border: 2px solid @blue-400;

  &-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    &-icon {
      height: 100%;
      filter: invert(36%) sepia(79%) saturate(2000%) hue-rotate(202deg)
        brightness(95%) contrast(90%);
    }

    &-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  &-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.main {
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  min-height: 250px;
}

.invite-link {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  box-sizing: border-box;
  border-radius: 5px;
  background-color: #545454;
  flex: 1;
}

.qr {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #545454;
  border-radius: 5px;
  gap: 10px;
  padding: 10px;
  flex: 1;
}

.link-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.link-input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  font-family: "Manrope", sans-serif;
  color: #696969;
  border: 1px solid #333;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 3px 5px;
  height: 100%;
  width: 100px;
  border-radius: 3px;
  background: #7c838d;
  font-family: "Manrope", sans-serif;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgb(102, 109, 118);
  }
}

@media (max-width: 768px) {
  .share__container {
    height: 90vh;
    width: 90vw;
    padding: 20px;
  }

  .title {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .description {
    padding: 0 10px;
    font-size: 20px;

    &-left {
      &-icon {
        display: none;
      }
    }
  }

  .main {
    flex-direction: column;
    gap: 20px;
  }
}

@media(max-width: 578px) {
    .description {
        font-size: 16px;
    }
}
</style>
