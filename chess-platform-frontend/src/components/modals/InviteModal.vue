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

      <router-link
      to="/inviteShare"
      >
      <Button
      variant="primary"
      :icon="personIcom"
      size="sm"
      @click="selectColor()" 
      >
        Бросить вызов другу
      </Button>
      </router-link>
    </div>
  </div>

    <!-- <p class="desc">
        Отправь эту ссылку другу — по ней он попадёт в твою игру:
      </p>

      <div class="link-row">
        <input
          class="link-input"
          :value="link"
          readonly
          :disabled="!colorWasSelected"
        />
        <button
          class="btn"
          :class="{ disabled: !colorWasSelected }"
          @click="copy"
        >
          {{ copied ? "Скопировано!" : "Копировать" }}
        </button>
      </div>

      <p v-if="waiting" class="invite-waiting">
        Ждём, пока друг перейдёт по ссылке...
      </p> -->
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";

import whiteIcon from "@/assets/game/inviteModel/choice-white.svg";
import blackIcon from "@/assets/game/inviteModel/choice-black.svg";
import randomIcon from "@/assets/game/inviteModel/choice-random.svg";
import personIcom from "@/assets/icons/main-page/person.svg"

import Button from "@/UI/Button.vue";

const game = useGameStore();
const user = useUserStore();
const router = useRouter();

/**
 * Props компонента InviteModal
 * @property {string} [initialRoomId] - Идентификатор комнаты, переданный извне
 */
const props = defineProps({
  initialRoomId: { type: String, default: null },
});

/**
 * Emits компонента InviteModal
 * @emits {close} - Закрытие модального окна
 * @emits {created} - Создание новой комнаты с данными {roomId, color}
 */
const emit = defineEmits(["close", "created"]);
/**
 * Идентификатор игровой комнаты
 */
const roomId = ref(props.initialRoomId);
/**
 * Флаг, указывающий что ссылка скопирована в буфер обмена
 */
const copied = ref(false);
/**
 * Флаг ожидания подключения второго игрока
 */
const waiting = ref(false);
/**
 * Выбранный цвет фигур игрока
 *
 * "w" | "b" | "random"
 */
const selectedColor = ref("random");

const colorWasSelected = ref(false);
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
  { value: "5+3", minutes: 5, increment: 3 },
  { value: "10+0", minutes: 10, increment: 0 },
  { value: "10+5", minutes: 10, increment: 5 },
  { value: "15+10", minutes: 15, increment: 10 }
]);

const gameModes = ref([  
  { value: "friendly", label: "Товарищеская" },
  { value: "rated", label: "Рейтинговая" }
]);

/**
 * Вычисляемое свойство - ссылка для приглашения друга
 *
 * Формат: http://localhost:5173/play/{roomId}?color={selectedColor}
 */
const link = computed(() => {
  const colorParam = selectedColor.value ? `?color=${selectedColor.value}` : "";
  return `${window.location.origin}/play/${roomId.value}${colorParam}`;
});

/**
 * Генерирует уникальный идентификатор комнаты
 * Использует crypto.randomUUID() если доступно, иначе случайную строку
 */
function genId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID().slice(0, 8);
    }
  } catch (e) {}
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Обрабатывает выбор цвета фигур игроком
 * Обновляет selectedColor и пересчитывает ссылку через computed свойство
 */
function selectColor() {
  roomId.value = genId();
  waiting.value = true;

  game.shouldRedirect = null;
  
  game.disconnect();

  emit("created", { roomId: roomId.value, color: selectedColor.value });

  game.connectToServer(roomId.value, selectedColor.value, user.username);
}

/**
 * Копирует ссылку приглашения в буфер обмена
 * Использует modern Clipboard API с fallback для старых браузеров
 */
function copy() {
  if (!colorWasSelected.value) return;
  if (!link.value) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(link.value)
      .then(() => {
        copied.value = true;
        setTimeout(() => (copied.value = false), 1500);
      })
      .catch(() => fallbackCopy());
  } else fallbackCopy();
}

/**
 * Fallback метод копирования для браузеров без поддержки Clipboard API
 * Создает временный textarea элемент для копирования
 */
function fallbackCopy() {
  const el = document.createElement("textarea");
  el.value = link.value;
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand("copy");
    copied.value = true;
  } catch (e) {
    console.warn(e);
  }
  el.remove();
  setTimeout(() => (copied.value = false), 1500);
}

/**
 * Закрывает модальное окно приглашения
 * Вызывает emit события 'close'
 */
function close() {
  emit("close");
}

/**
 * Выполняет переход на страницу игры и закрывает модалку
 */
function performRedirect() {
  router.push(`/play/${roomId.value}`);
  game.clearRedirect?.();
  emit("close");
}

watch(
  [() => game.shouldRedirect, () => game.playersCount],
  ([newShouldRedirect, newPlayersCount]) => {
    console.log(" Reactivity: Проверяем переход...", {
      shouldRedirect: newShouldRedirect,
      playersCount: newPlayersCount,
      roomId: roomId.value,
    });

    if (newShouldRedirect && newShouldRedirect.roomId === roomId.value) {
      performRedirect();
      return;
    }

    if (newPlayersCount >= 2) {
      performRedirect();
      return;
    }
  }
);

onMounted(() => {
  document.body.style.overflow = 'hidden';
})

onBeforeUnmount(() => {
  document.body.style.overflow = '';
})
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
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
}

.title {
  font-size: 25px;
  margin: 0;
  // margin-bottom: 10px;
  padding: 0;
  font-family: "Manrope", sans-serif;
  font-weight: 500;
}

.desc {
  font-family: "Manrope", sans-serif;
}

.invite-waiting {
  text-align: center;
  margin-top: 10px;
  font-family: "Manrope", sans-serif;
  color: #aaa;
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
  background-color: @gray-400;
  color: @white-150;
  border: none;

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
  font-family: "Manrope", sans-serif;
}

.time-option {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: @gray-400;
  border: none;
  border-radius: 3px;
  padding: 8px 0;
  color: @white-150;

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
  font-family: "Manrope", sans-serif;
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
  background-color: @gray-400;
  font-family: "Manrope", sans-serif;
  border: none;
  color: @white-150;
  cursor: pointer;

  &.active {
    background-color: @blue-500;
  }
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
  background: #121212;
  color: #eee;
  border: 1px solid #333;
}

.btn {
  // display: inline-flex;
  // justify-content: center;
  // align-items: center;
  // flex: 1;
  // padding: 3px 5px;
  // /* border-radius: 6px; */
  // background: #7c838d;
  // font-family: "Manrope", sans-serif;
  // border: none;
  // color: white;
  // cursor: pointer;
}

.btn.outline {
  background: transparent;
  border: 1px solid #666;
  color: #ddd;
}

.btn.primary {
  background: #10b981;
}

.btn.cancel {
  background: #555;
  margin-left: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn.disabled {
  background: #6b7280;
  cursor: not-allowed;
  opacity: 0.6;
}

.link-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .invite-card {
    width: 300px;
    padding: 10px;
  }

  .btn {
    /* padding: 6px 15px; */
  }
}

.divider {
  width: 100%;
  padding: 0;
  margin: 0;
}
</style>
