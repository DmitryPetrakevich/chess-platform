<template>
    <div class="share">
        <div class="share__container">
            <h1 class="title">Вызвать на игру</h1>

            <div class="description">
                <div class="description-left">
                    <img :src="blitzIcon" class="description-left-icon">

                    <div class="description-left-text" >
                        <span>Блиц</span>
                        <span>3+0</span>
                    </div>
                </div>

                <div class="description-right">
                    <span>Случайный цвет</span>
                    <span>Товарищесая</span>
                </div>
            </div>

            <div class="main">
                <div class="invite-link"> 
                    <p>Чтобы пригласить друга, отправьте ему эту ссылку</p>

                    <div class="link-row">
                        <input
                        class="link-input"
                        :value="link"
                        readonly
                        :disabled="!colorWasSelected"
                        />
                        <button
                        class="btn"
                        @click="copy"
                        >
                        {{ copied ? "Скопировано!" : "Копировать" }}
                        </button>
                    </div>

                    <p>С вами сыграет первый, кто перейдёт по этой ссылке.</p>

                </div>

                <div class="qr">
                    QR
                </div>

            </div>


        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

import blitzIcon from "@/assets/game/profile/blitz.svg"

/**
 * Флаг, указывающий что ссылка скопирована в буфер обмена
 */
const copied = ref(false);

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

</script>

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
    height: 80vh;
    width: 70vw;
    background-color: #2a2a2a;
    padding: 40px;
    border-radius: 10px;
}

.title {
    font-size: 36px;
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
    border-radius: 5px;
    background-color: #545454;
    border: 1px solid black;

    &-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;

        &-icon {
            height: 100%;
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
    min-height: 200px;
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
    justify-content: center;
    align-items: center;
    font-size: 50px;
    background-color: #545454;
    border-radius: 5px;
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
  color: #eee;
  border: 1px solid #333;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 3px 5px;
  /* border-radius: 6px; */
  background: #7c838d;
  font-family: "Manrope", sans-serif;
  border: none;
  color: white;
  cursor: pointer;
}

</style>