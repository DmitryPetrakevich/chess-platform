<template>
    <div class="invite-overlay" @click.self="close">
        <div class="invite-card" role="dialog" aria-modal="true">
            <h3>Пригласить друга</h3>
            <p class="desc">Отправь эту ссылку другу — по ней он попадёт в твою игру:</p>

            <div class="link-row">
                <input class="link-input" :value="link" readonly />
                <button class="btn" @click="copy">{{ copied ? "Скопировано!" : "Копировать" }}</button>
            </div>

            <div class="actions">
                <button class="btn outline" @click="openInNewTab">Открыть в новой вкладке</button>
                <button class="btn primary" @click="goToGame">Перейти в игру</button>
                <button class="btn cancel" @click="close">Закрыть</button>
            </div>
        </div>
    </div>
</template>

<script setup>
// ADDED: modal logic
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
    initialRoomId: { type: String, default: null } // optional
});
const emit = defineEmits(["close", "created"]);

const router = useRouter();
const roomId = ref(props.initialRoomId);
const link = ref("");
const copied = ref(false);

function genId() {
    try {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID().slice(0, 8);
        }
    } catch (e) { /* ignore */ }
    return Math.random().toString(36).slice(2, 10);
}

onMounted(() => {
    if (!roomId.value) roomId.value = genId();
    link.value = `${window.location.origin}/play/${roomId.value}`;
    emit("created", roomId.value);
});

function copy() {
    if (!link.value) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link.value).then(() => {
            copied.value = true;
            setTimeout(() => (copied.value = false), 1500);
        }).catch(() => fallbackCopy());
    } else fallbackCopy();
}

function fallbackCopy() {
    const el = document.createElement("textarea");
    el.value = link.value;
    document.body.appendChild(el);
    el.select();
    try { document.execCommand("copy"); copied.value = true; } catch (e) { console.warn(e); }
    el.remove();
    setTimeout(() => (copied.value = false), 1500);
}

function openInNewTab() {
    window.open(link.value, "_blank");
}

function goToGame() {
    router.push(`/play/${roomId.value}`);
    emit("close");
}

function close() {
    emit("close");
}
</script>

<style scoped>
.invite-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 80;
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
    background: #121212;
    color: #eee;
    border: 1px solid #333;
}

.btn {
    padding: 8px 12px;
    border-radius: 6px;
    background: #3b82f6;
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
