<template>
  <div class="settings">
    <div class="settings__header">
      <button
        class="settings__btn"
        v-for="setting in settingsStore.settingsMenu"
        :key="setting.id"
        :class="{ active: settingsStore.activeSetting === setting.id }"
        @click="settingsStore.activeSetting = setting.id"
      >
        {{ setting.label }}
      </button>
    </div>

    <div class="settings__container">
      <div class="settings__sidebar">
        <button
          class="settings__btn"          v-for="setting in settingsStore.settingsMenu"
          :key="setting.id"
          :class="{ active: settingsStore.activeSetting === setting.id }"
          @click="settingsStore.activeSetting = setting.id"
        >
          {{ setting.label }}
        </button>
      </div>

      <div class="settings__main">
        <div v-if="settingsStore.activeSetting === 0" class="settings__section">
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
                v-model="settingsStore.selectedCountry"
                :options="settingsStore.countryOptions"
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

        <div v-if="settingsStore.activeSetting === 1" class="settings__section">
          <h1 class="settings__title">Отображение</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">Анимация фигур</h3>
            <div class="settings__options">
              <button
                v-for="option in settingsStore.animationOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.display.animation === option.value }"
                @click="settingsStore.settings.display.animation = option.value"
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
                v-for="option in settingsStore.materialOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.display.material === option.value }"
                @click="settingsStore.settings.display.material = option.value"
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
                v-for="option in settingsStore.validMovesOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.display.validMoves === option.value }"
                @click="settingsStore.settings.display.validMoves = option.value"
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
                v-for="option in settingsStore.lastMoveOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.display.lastMove === option.value }"
                @click="settingsStore.settings.display.lastMove = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>

        <div v-if="settingsStore.activeSetting === 2" class="settings__section">
          <h1 class="settings__title">Шахматные часы</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">Десятые доли секунд</h3>
            <div class="settings__options settings__options-wide">
              <button
                v-for="option in settingsStore.secondOptions"
                :key="option.value"
                class="settings__option settings__option-count3"
                :class="{ active: settingsStore.settings.clock.tenths === option.value }"
                @click="settingsStore.settings.clock.tenths = option.value"
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
                v-for="option in settingsStore.timerIndicator"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.clock.timerIndicator === option.value }"
                @click="settingsStore.settings.clock.timerIndicator = option.value"
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
                v-for="option in settingsStore.lowTimeSoundOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.clock.timeSound === option.value }"
                @click="settingsStore.settings.clock.timeSound = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>

        <div v-if="settingsStore.activeSetting === 3" class="settings__section">
          <h1 class="settings__title">Настройки игры</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">Как вы передвигаете фигуры?</h3>
            <div class="settings__options">
              <button
                v-for="option in settingsStore.moveWayOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.game.moveWay === option.value }"
                @click="settingsStore.settings.game.moveWay = option.value"
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
                v-for="option in settingsStore.premoveOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.game.premove === option.value }"
                @click="settingsStore.settings.game.premove = option.value"
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
                v-for="option in settingsStore.autoQueenOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.game.autoQueen === option.value }"
                @click="settingsStore.settings.game.autoQueen = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <hr class="settings__hr" />
          </div>
        </div>

        <div v-if="settingsStore.activeSetting === 4" class="settings__section">
          <h1 class="settings__title">Конфиденциальность</h1>

          <div class="settings__group">
            <h3 class="settings__group__title">
              Разрешить другим игрокам вызывать вас на игру?
            </h3>
            <div class="settings__options settings__options-wide">
              <button
                v-for="option in settingsStore.callAgreeOptions"
                :key="option.value"
                class="settings__option settings__option-count5"
                :class="{ active: settingsStore.settings.confidentiality.callAgree === option.value }"
                @click="settingsStore.settings.confidentiality.callAgree = option.value"
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
                v-for="option in settingsStore.messageAgreeOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.confidentiality.messageAgree === option.value }"
                @click="settingsStore.settings.confidentiality.messageAgree = option.value"
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
                v-for="option in settingsStore.subscribeAgreeOptions"
                :key="option.value"
                class="settings__option"
                :class="{ active: settingsStore.settings.confidentiality.subscribeAgree === option.value }"
                @click="settingsStore.settings.confidentiality.subscribeAgree = option.value"
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
import { useSettingsStore } from "@/store/settingsStore";
import Input from "@/UI/Input.vue";
import Select from "@/UI/Select.vue";

const settingsStore = useSettingsStore();
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
