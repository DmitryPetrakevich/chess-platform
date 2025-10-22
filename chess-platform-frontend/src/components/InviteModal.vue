<template>
    <div class="invite-overlay" @click.self="close">
        <div class="invite-card" role="dialog" aria-modal="true">
            <h3 class="title">Пригласить друга</h3>
            <p class="desc">Отправь эту ссылку другу — по ней он попадёт в твою игру:</p>

            <div class="color-select">
                <p>Выбери, за кого хочешь играть:</p>
                <div class="color-buttons">
                    <button 
                    v-for="option in colorOptions" 
                    :key="option.value" 
                    class="btn color-btn"
                    :class="{ active: selectedColor === option.value }" @click="selectColor(option.value)">
                    <img :src="option.src" :alt="option.label" class="color-icon"> 
                    <!-- {{ option.label }} -->
                    </button>
                </div>
            </div>

            <div class="link-row">
                <input class="link-input" :value="link" readonly />
                <button class="btn" @click="copy">{{ copied ? "Скопировано!" : "Копировать" }}</button>
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
import { useUserStore } from "@/store/user";

import whiteIcon from '@/assets/inviteModel/choice-white.svg'
import blackIcon from '@/assets/inviteModel/choice-black.svg'
import randomIcon from '@/assets/inviteModel/choice-random.svg'

const game = useGameStore()
const user = useUserStore();
const router = useRouter();

/**
 * Props компонента InviteModal
 * @property {string} [initialRoomId] - Идентификатор комнаты, переданный извне
 */
const props = defineProps({
    initialRoomId: { type: String, default: null }
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

/**
 * Опции выбора цвета фигур
 */
const colorOptions = [
    { value: "random", label: "Случайно", src: randomIcon },
    { value: "b", label: "Черные", src: blackIcon },
    { value: "w", label: "Белые", src: whiteIcon }
];

/**
 * Вычисляемое свойство - ссылка для приглашения друга
 * 
 * Формат: http://localhost:5173/play/{roomId}?color={selectedColor}
 */
const link = computed(() => {
    return `${window.location.origin}/play/${roomId.value}`;
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
    } catch (e) { }
    return Math.random().toString(36).slice(2, 10);
}

/**
 * Обрабатывает выбор цвета фигур игроком
 * Обновляет selectedColor и пересчитывает ссылку через computed свойство
 */
function selectColor(color) {
    selectedColor.value = color;

    if (!roomId.value) roomId.value = genId();
    waiting.value = true;

    emit("created", { roomId: roomId.value, color: selectedColor.value });

    game.connectToServer(roomId.value, selectedColor.value, user.username);
}

/**
 * Копирует ссылку приглашения в буфер обмена
 * Использует modern Clipboard API с fallback для старых браузеров
 */
function copy() {
    if (!link.value) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link.value).then(() => {
            copied.value = true;
            setTimeout(() => (copied.value = false), 1500);
        }).catch(() => fallbackCopy());
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

watch([
    () => game.shouldRedirect,
    () => game.playersCount
], ([newShouldRedirect, newPlayersCount]) => {
    console.log("🎯 Reactivity: Проверяем переход...", {
        shouldRedirect: newShouldRedirect,
        playersCount: newPlayersCount,
        roomId: roomId.value
    });
    
    // Условие 1: Флаг перехода от сервера
    if (newShouldRedirect && newShouldRedirect.roomId === roomId.value) {
        console.log("🚀 Переходим по команде сервера!");
        performRedirect();
        return;
    }
    
    // Условие 2: В комнате 2 игрока (резервный механизм)
    if (newPlayersCount >= 2) {
        console.log("👥 В комнате 2 игрока - переходим!");
        performRedirect();
        return;
    }
});

// onMounted(() => {
//     if (!roomId.value) roomId.value = genId();
//     waiting.value = true;

//     emit("created", { roomId: roomId.value, color: selectedColor.value });

//     game.connectToServer(roomId.value, selectedColor.value, user.username);
// });
</script>

<style scoped>
.title {
    font-family: 'Manrope', sans-serif;
}

.desc {
    font-family: 'Manrope', sans-serif;
}

.invite-waiting {
    text-align: center;
    margin-top: 10px;
    font-family: 'Manrope', sans-serif;
    color: #aaa;
}

.invite-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 80;
}

.color-select {
    margin-bottom: 12px;
    font-family: 'Manrope', sans-serif;
    text-align: center;
}

.color-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 6px;
}

.color-icon {
    width: 34px;
    height: 34px;
    object-fit: contain;
}

.color-btn {
    background: #444;
    border: 1px solid #555;
}

.color-btn.active {
    background: #1856b9;
}

.invite-card {
    width: min(560px, 92%);
    background: #222;
    color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
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
    font-family: 'Manrope', sans-serif;
    background: #121212;
    color: #eee;
    border: 1px solid #333;
}

.btn {
    padding: 8px 32px;
    border-radius: 6px;
    background: #3b82f6;
    font-family: 'Manrope', sans-serif;
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
</style>
