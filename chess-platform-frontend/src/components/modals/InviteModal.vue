<template>
  <div class="invite-overlay" @click.self="close">
    <div class="invite-card" role="dialog" aria-modal="true">
      <h3 class="title">Пригласить друга</h3>

      <div class="color-select">
        <p>Выбери, за кого хочешь играть:</p>
        <div class="color-buttons">
          <button
            v-for="option in colorOptions"
            :key="option.value"
            class="btn color-btn"
            :class="{
              active: colorWasSelected && selectedColor === option.value,
            }"
            @click="selectColor(option.value)"
          >
            <img :src="option.src" :alt="option.label" class="color-icon" />
          </button>
        </div>
      </div>

      <p class="desc">
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
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";

import whiteIcon from "@/assets/game/inviteModel/choice-white.svg";
import blackIcon from "@/assets/game/inviteModel/choice-black.svg";
import randomIcon from "@/assets/game/inviteModel/choice-random.svg";

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
 * Опции выбора цвета фигур
 */
const colorOptions = [
  { value: "random", label: "Случайно", src: randomIcon },
  { value: "b", label: "Черные", src: blackIcon },
  { value: "w", label: "Белые", src: whiteIcon },
];

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
function selectColor(color) {
  selectedColor.value = color;
  colorWasSelected.value = true;
  
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

<style scoped>
.invite-card {
  width: 450px;
  max-width: 700px;
  min-width: 300px;
  background: #222;
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
}

.title {
  margin: 0;
  margin-bottom: 10px;
  padding: 0;
  font-family: "Manrope", sans-serif;
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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.color-select {
  margin-bottom: 12px;
  font-family: "Manrope", sans-serif;
  text-align: center;
}

.color-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

.color-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.color-btn {
  background: #444;
  border: 1px solid #555;
}

.color-btn.active {
  background: #1856b9;
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
  padding: 8px 25px;
  border-radius: 6px;
  background: #3b82f6;
  font-family: "Manrope", sans-serif;
  border: none;
  color: white;
  cursor: pointer;
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
    padding: 6px 15px;
  }
}
</style>
