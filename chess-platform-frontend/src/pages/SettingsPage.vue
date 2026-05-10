<template>
  <div class="settings">
    <div class="settings__header">
      <button
        class="settings__btn"
        v-for="setting in settingsMenu"
        :key="setting.id"
        :class="{ active: activeSetting === setting.id }"
        @click="activeSetting = setting.id"
      >
        {{ setting.label }}
      </button>
    </div>

    <div class="settings__container">
      <div class="settings__sidebar">
        <button
          class="settings__btn"
          v-for="setting in settingsMenu"
          :key="setting.id"
          :class="{ active: activeSetting === setting.id }"
          @click="activeSetting = setting.id"
        >
          {{ setting.label }}
        </button>
      </div>

      <div class="settings__main">
        <div v-if="activeSetting === 0" class="settings__section">
          <h1 class="settings__title">Редактировать профиль</h1>
          <p class="settings__subtitle">
            Вся указываемая здесь информация будет доступна публично, добавляйте
            её по своему желанию.
          </p>

          <div class="settings__form-group">
            <div class="settings__form-group-about">
              <label class="settings__form-group__label" for="about-textarea">
                О себе
              </label>
              <textarea
                id="about-textarea"
                class="settings__form-group__textarea"
              >
              </textarea>
            </div>
          </div>

          <div class="settings__form-group">
            <div class="settings__form-group-country">
              <label class="settings__form-group__label"
                >Страна или регион</label
              >
               <Select 
               v-model="selectedCountry"
               :options="countries"
               />
            </div>

            <div class="settings__form-group-location">
              <label class="settings__form-group__label">Местоположение</label>
              <Input type="text" />
            </div>
          </div>

          <div class="settings__form-group">
            <div class="settings__form-group-name">
              <label class="settings__form-group__label"> Настоящее имя </label>
              <Input type="text" />
            </div>
          </div>

          <div class="settings__form-group">
            <div class="settings__form-group-rating">
              <label class="settings__form-group__label">Рейтинг ФШР</label>
              <Input type="text" />
            </div>

            <div class="settings__form-group-rating">
              <label class="settings__form-group__label">Рейтинг FIDE</label>
              <Input type="text" />
            </div>
          </div>
        </div>

        <div v-if="activeSetting === 1" class="settings__section">
          <h1 class="settings__title">Отображение</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">Анимация фигур</h3>
            <div class="settings__options">
              <button
                v-for="option in animationOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.display.animation === option.value }"
                @click="settings.display.animation = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Показывать разницу в материале
            </h3>
            <div class="settings__options">
              <button
                v-for="option in materialOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.display.material === option.value }"
                @click="settings.display.material = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">Показывать допустимые ходы</h3>
            <div class="settings__options">
              <button
                v-for="option in validMovesOptions"
                :key="option.id"
                class="settings__option"
                :class="{
                  active: settings.display.validMoves === option.value,
                }"
                @click="settings.display.validMoves = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">Показывать последний ход</h3>
            <div class="settings__options">
              <button
                v-for="option in lastMoveOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.display.lastMove === option.value }"
                @click="settings.display.lastMove = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>

        <div v-if="activeSetting === 2" class="settings__section">
          <h1 class="settings__title">Шахматные часы</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">Десятые доли секунд</h3>
            <div class="settings__options settings__options-wide">
              <button
                v-for="option in secondOptions"
                :key="option.id"
                class="settings__option settings__option-count3"
                :class="{ active: settings.clock.tenths === option.value }"
                @click="settings.clock.tenths = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">Убывающий зелёный индикатор</h3>
            <div class="settings__options">
              <button
                v-for="option in timerIndicator"
                :key="option.id"
                class="settings__option"
                :class="{
                  active: settings.clock.timerIndicator === option.value,
                }"
                @click="settings.clock.timerIndicator = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Звук, когда время подходит к концу
            </h3>
            <div class="settings__options">
              <button
                v-for="option in lowTimeSoundOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.clock.timeSound === option.value }"
                @click="settings.clock.timeSound = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>

        <div v-if="activeSetting === 3" class="settings__section">
          <h1 class="settings__title">Настройки игры</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">Как вы передвигаете фигуры?</h3>
            <div class="settings__options">
              <button
                v-for="option in moveWayOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.game.moveWay === option.value }"
                @click="settings.game.moveWay = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">Предварительный ход</h3>
            <div class="settings__options">
              <button
                v-for="option in premoveOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.game.premove === option.value }"
                @click="settings.game.premove = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Пешка превращается в ферзя автоматически
            </h3>
            <div class="settings__options">
              <button
                v-for="option in autoQueenOptions"
                :key="option.id"
                class="settings__option"
                :class="{ active: settings.game.autoQueen === option.value }"
                @click="settings.game.autoQueen = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>

        <div v-if="activeSetting === 4" class="settings__section">
          <h1 class="settings__title">Конфиденциальность</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Разрешить другим игрокам вызывать вас на игру?
            </h3>
            <div class="settings__options settings__options-wide">
              <button
                v-for="option in callAgreeOptions"
                :key="option.id"
                class="settings__option settings__option-count5"
                :class="{
                  active: settings.confidentiality.callAgree === option.value,
                }"
                @click="settings.confidentiality.callAgree = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Разрешить присылать вам сообщения
            </h3>
            <div class="settings__options">
              <button
                v-for="option in messageAgreeOptions"
                :key="option.id"
                class="settings__option"
                :class="{
                  active:
                    settings.confidentiality.messageAgree === option.value,
                }"
                @click="settings.confidentiality.messageAgree = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Разрешить другим игрокам подписываться на вас
            </h3>
            <div class="settings__options">
              <button
                v-for="option in subscribeAgreeOptions"
                :key="option.id"
                class="settings__option"
                :class="{
                  active:
                    settings.confidentiality.subscribeAgree === option.value,
                }"
                @click="settings.confidentiality.subscribeAgree = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Input from "@/UI/Input.vue";
import { ref, reactive, onMounted } from "vue";
import countries from "@/data/countries.js";
import Select from "@/UI/Select.vue";

const activeSetting = ref(0);

const selectedCountry = ref('')
const countryOptions = []


const settingsMenu = ref([
  { id: 0, label: "Редактировать профиль" },
  { id: 1, label: "Отображение" },
  { id: 2, label: "Шахматные часы" },
  { id: 3, label: "Настройки игры" },
  { id: 4, label: "Конфиденциальность" },
]);

const settings = reactive({
  display: {
    animation: "normal",
    material: "no",
    validMoves: "yes",
    lastMove: "yes",
  },
  clock: {
    tenths: "never",
    timeSound: "no",
    timerIndicator: "no",
  },
  game: {
    moveWay: "both",
    premove: "no",
    autoQueen: "always",
  },
  confidentiality: {
    callAgree: "registration",
    messageAgree: "always",
    subscribeAgree: "yes",
  },
});

const animationOptions = ref([
  { value: "none", label: "Нет" },
  { value: "fast", label: "Быстрая" },
  { value: "normal", label: "Нормальная" },
  { value: "slow", label: "Медленная" },
]);

const materialOptions = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

const validMovesOptions = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

const lastMoveOptions = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

const secondOptions = ref([
  { value: "never", label: "Никогда" },
  { value: "lowTime", label: "Когда остается меньше 15 секунд" },
  { value: "always", label: "Всегда" },
]);

const timerIndicator = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

const lowTimeSoundOptions = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

const moveWayOptions = ref([
  { value: "click", label: "Нажатием на две клетки" },
  { value: "drag", label: "Перетаскиванием фигуры" },
  { value: "both", label: "Обоими способами" },
]);

const premoveOptions = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

const autoQueenOptions = ref([
  { value: "never", label: "Никогда" },
  { value: "premove", label: "Когда сделан предход" },
  { value: "always", label: "Всегда" },
]);

const callAgreeOptions = ref([
  { value: "never", label: "Никогда" },
  { value: "ratingDifference", label: "Если их рейтинг +- 300" },
  { value: "friends", label: "Только друзьям" },
  { value: "registration", label: "Только зарегестрированным" },
  { value: "always", label: "Всегда" },
]);

const messageAgreeOptions = ref([
  { value: "friends", label: "Только друзьям" },
  { value: "always", label: "Всегда" },
]);

const subscribeAgreeOptions = ref([
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
]);

</script>

<style scoped lang="less">
.settings {
  display: flex;
  flex-direction: column;
  background: @black-900;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  color: #ecf0f1;

  &__header {
    display: none;
    flex-direction: row;
    align-items: center;
    height: auto;
    gap: 10px;
    margin-bottom: 20px;
    overflow-x: auto;
    overflow-y: hidden;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    gap: 20px;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 300px;
  }

  &__btn {
    font-size: 18px;
    background: none;
    border: none;
    color: @text-light;
    font-family: @font-main;
    padding: 10px 15px;
    border-radius: 5px;
    width: 100%;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      background-color: @black-700;
    }

    &.active {
      background-color: @black-700;
    }

    &:first-child {
      margin-bottom: 30px;
    }
  }

  &__title {
    font-family: @font-main;
    margin-bottom: 30px;
    font-size: 36px;
    font-weight: 300;
    color: @red-500;
  }

  &__subtitle {
    font-family: @font-main;
    margin-bottom: 30px;
    font-size: 18px;
    font-weight: 300;
    color: @text-light;
  }

  &__form-group {
    display: flex;
    flex-direction: row;
    gap: 15px;
    margin-bottom: 40px;
    width: 100%;

    &__label {
      font-family: @font-main;
      font-size: 16px;
      color: @text-light;
    }

    &__textarea {
      max-width: 400px;
      min-width: 400px;
      min-height: 100px;
      border: 1px solid @gray-400;
      background: @black-700;
      border-radius: 5px;
      color: @text-light;
      font-family: @font-main;
      padding: 8px;
      resize: vertical;

      &:focus {
        outline: none;
        border-color: @red-500;
      }
    }

    &-country, &-location,
    &-name, &-rating {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-family: @font-main;
      font-size: 15px;
      font-weight: 300;
      color: @text-light;
      width: 100%;
    }

    &-name {
      width: 50%;
    }

    &-about {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }

  &__main {
    width: 100%;
    background: @black-800;
    padding: 20px 30px;
    overflow-y: auto;
    border-radius: 5px;
  }

  &__section {
    width: 100%;
  }

  &__group {
    margin-bottom: 40px;
  }

  &__group__title {
    font-size: 18px;
    font-weight: 200;
    font-family: @font-main;
    color: @gray-300;
    margin-bottom: 15px;
  }

  &__options {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  &__option {
    padding: 10px 10px;
    width: 100%;
    border: 1px solid rgb(94, 94, 94);
    background-color: @black-500;
    font-size: 16px;
    font-family: @font-main;
    color: @text-light;
    transition: all 0.2s ease;
    cursor: pointer;

    &:first-child {
      border-radius: 5px 0 0 5px;
    }

    &:last-child {
      border-radius: 0 5px 5px 0;
    }

    &.active {
      background-color: @gray-500;
    }

    &:hover:not(.active) {
      background-color: @black-400;
    }
  }

  &__hr {
    width: 100%;
    border: 1px solid @black-400;
    margin-top: 30px;
  }
}

@media (max-width: 990px) {
  .settings {
    padding: 10px 20px;

    &__sidebar {
      width: 250px;
    }

    &__btn {
      font-size: 16px;
      padding: 8px 12px;
      width: 100%;

      &:first-child {
        margin-bottom: 20px;
      }
    }

      &__main {
        padding: 10px 20px;
    }

    &__title {
      margin-bottom: 25px;
      font-size: 26px;
    }

    &__subtitle {
      margin-bottom: 25px;
      font-size: 15px;
    }

    &__form-group {
      flex-direction: column;
      width: 100%;

      &__label {
        font-size: 15px;
      }

      &__textarea {
        max-width: 400px;
        min-width: 200px;
        min-height: 100px;
        border: 1px solid @gray-400;
        background: @black-700;
        border-radius: 5px;
        color: @text-light;
        font-family: @font-main;
        padding: 8px;
        resize: vertical;

        &:focus {
          outline: none;
          border-color: @red-500;
        }
      }

      &-country,
      &-location,
      &-name,
      &-rating {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-family: @font-main;
        font-size: 15px;
        font-weight: 300;
        color: @text-light;
        width: 100%;
      }

      &-name {
        width: 100%;
      }

      &-about {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
    }

    &__options-wide {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    &__option {
        padding: 8px;
        font-size: 14px;

        &:last-child {
            grid-column: span 2;
        }

        &-count5 {
            &:nth-child(1) {
                border-radius: 5px 0 0 0;
            }

            &:nth-child(2) {
                border-radius: 0 5px 0 0;
            }

            &:nth-child(5) {
                border-radius: 0 0 5px 5px;
            }
        }

        &-count3 {
            &:nth-child(1) {
                border-radius: 5px 0 0 0;
            }

            &:nth-child(2) {
                border-radius: 0 5px 0 0;
            }

            &:nth-child(3) {
                border-radius: 0 0 5px 5px;
            }
        }

    }

    &__group__title {
      font-size: 15px;
    }
  }
}
  

  @media (max-width: 800px) {
    .settings {
      &__header {
        display: flex;
      }

      &__sidebar {
        display: none;
      }

      &__btn {
        font-size: 14px;
        padding: 6px 12px;
        width: 100%;

        &:hover {
          background: none;
          color: @blue-400;
        }

        &.active {
          background-color: @gray-600;
          color: @blue-400;
        }

        &:first-child {
          margin-bottom: 0;
        }
      }
    }
  }

  @media (max-width: 800px) {
    .settings {
        &__options-call {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
    }
  }

@media (max-width: 480px) {
  .settings {

    &__options-wide {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    &__option {
        padding: 8px;
        font-size: 12px;

            // &:nth-child(1) {
            //     border-radius: 5px 0 0 0;
            // }

            // &:nth-child(2) {
            //     border-radius: 0 5px 0 0;
            // }

            // &:nth-child(5) {
            //     border-radius: 0 0 5px 5px;
            // }

            // &:last-child {
            //     grid-column: span 2;
            // }
        }

    &__group__title {
      font-size: 15px;
    }
  }
}
  
</style>
