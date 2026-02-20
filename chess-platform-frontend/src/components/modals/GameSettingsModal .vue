<template>
  <div class="invite-overlay" @click.self="close">
    <div class="invite-card" role="dialog" aria-modal="true">
      <h3 class="title">Параметры игры</h3>
      <hr class="divider">

      <div class="time-controls__wrapper">
        <h3 class="time-controls-title">Контроль времени</h3>
        <div class="time-controls">
          <button
            v-for="time in timeControls"
            :key="time.value"
            class="time-option"
            :class="{ active: selectedTime === time.value }"
            @click="selectedTime = time.value"
          >
            {{ time.value }}
          </button>
        </div>
      </div>

      <div class="game-mode__wrapper">
        <h3 class="game-mode-title">Режим игры</h3>
        <div class="game-mode">
          <button
            v-for="mode in gameModes"
            :key="mode.value"
            class="btn-mode"
            :class="{ active: selectedMode === mode.value }"
            @click="selectedMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <div class="color-select__wrapper">
        <div class="color-select">
          <h3 class="color-select-title">Сторона</h3>
          <div class="color-buttons">
            <button
              v-for="option in colorOptions"
              :key="option.value"
              class="btn color-btn"
              :class="{
                active: selectedColor === option.value,
              }"
             @click="selectedColor = option.value " 
            >
              <div class="color-btn-content">
                <img :src="option.src" :alt="option.label" class="color-icon" />
                <span class="color-label">{{ option.text }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <Button
      variant="primary"
      :icon="personIcom"
      size="sm"
      bgColor="#333333"
      hoverBgColor="#3b82f6"
      @click="createInvite" 
      >
        Бросить вызов другу
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

import whiteIcon from "@/assets/icons/inviteModel/choice-white.svg";
import blackIcon from "@/assets/icons/inviteModel/choice-black.svg";
import randomIcon from "@/assets/icons/inviteModel/choice-random.svg";
import personIcom from "@/assets/icons/main-page/person.svg"

import Button from "@/UI/Button.vue";

const game = useGameStore();
const router = useRouter();

const { lock, unlock } = useBodyScrollLock();

/**
 * Emits компонента InviteModal
 * @emits {close} - Закрытие модального окна
 * @emits {created} - Создание новой комнаты с данными {roomId, color}
 */
const emit = defineEmits(["close"]);


/**
 * Закрывает модальное окно приглашения
 * Вызывает emit события 'close'
 */
function close() {
  emit('close');
}

/**
 * Выбранный цвет фигур игрока
 *
 * "w" | "b" | "random"
 */
const selectedColor = ref("random");
/**
 * Выбранный контроль времени
 */
const selectedTime = ref("3+0")
/**
 * Выбранный режим игры
 */
const selectedMode = ref('rated')

/**
 * Опции выбора цвета фигур
 */
const colorOptions = [
  { value: "b", label: "Черные", src: blackIcon, text: "Чёрные фигуры" },
  { value: "random", label: "Случайно", src: randomIcon, text: "Случайно" },
  { value: "w", label: "Белые", src: whiteIcon, text: "Белые фигуры" },
];

const timeControls = ref([
  { value: "1+0", minutes: 1, increment: 0 },
  { value: "1+1", minutes: 1, increment: 1 },
  { value: "3+0", minutes: 3, increment: 0 },
  { value: "3+1", minutes: 3, increment: 1 },
  { value: "3+2", minutes: 3, increment: 2 },
  { value: "5+0", minutes: 5, increment: 0 },
  { value: "5+1", minutes: 5, increment: 1 },
  { value: "5+2", minutes: 5, increment: 2 },
  { value: "5+3", minutes: 5, increment: 3 },
  { value: "10+0", minutes: 10, increment: 0 },
  { value: "10+2", minutes: 10, increment: 2 },
  { value: "10+5", minutes: 10, increment: 5 },
  { value: "15+10", minutes: 15, increment: 10 },
  { value: "30+0", minutes: 30, increment: 0 },
  { value: "30+20", minutes: 30, increment: 20 },
]);

const gameModes = ref([  
  { value: "friendly", label: "Товарищеская" },
  { value: "rated", label: "Рейтинговая" }
]);

const createInvite = () => {
  game.leaveCurrentGame()

  game.inviteParams = {
    time: selectedTime.value,
    mode: selectedMode.value,
    color: selectedColor.value
  }

  router.push('/inviteShare')
}

onMounted(() => {
  lock();
});

onBeforeUnmount(() => {
  unlock();
});

</script>

<style scoped lang="less">
.invite-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  min-width: 300px;
  background: #222;
  color: @text-light;
  font-family: @font-main;
  border-radius: 12px;
  padding: 20px;
  margin: 0 10px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
}

.title {
  font-size: 25px;
  margin: 0;
  padding: 0;
  font-weight: 500;
}

.invite-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}

.time-controls__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.time-controls {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  width: 100%;
}

.game-mode__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.game-mode {
  display: flex;
  flex-direction: row;
  width: 100%;

  & > :first-child {
    border-radius: 5px 0 0 5px;
  }

  & > :last-child {
    border-radius: 0 5px 5px 0;

  }
}

.btn-mode {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  flex: 1;
  background-color: @black-600;
  color: @white-150;
  border: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: @black-500;
  }

  &.active {
    background-color: @blue-500;
  }
}

.color-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px; 
}

.time-controls-title,
.game-mode-title,
.color-select-title {
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 400;
}

.time-option {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: @black-600;
  border: none;
  border-radius: 3px;
  padding: 8px 0;
  color: @text-light;
  transition: all 0.2s ease;

  &:hover {
    background-color: @black-500;
  }

  &.active {
  background-color: @blue-500;
  }
}

.color-select__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.color-select {
  margin-bottom: 12px;
  text-align: center;
  width: 100%;
}

.color-buttons {
  display: flex;
  justify-content: center;
  margin-top: 6px;

  & > :first-child {
    border-radius: 5px 0 0 5px;
  }

  & > :last-child {
    border-radius: 0 5px 5px 0;
  }
}

.color-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.color-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 3px 5px;
  background-color: @black-600;
  border: none;
  color: @white-300;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: @black-500;
  }

  &.active {
    background-color: @blue-500;
  }
}

@media (max-width: 576px) {
  .invite-card {
    padding: 10px;
  }
}

.divider {
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  border-top: 1px solid @text-light;  
}
</style>
