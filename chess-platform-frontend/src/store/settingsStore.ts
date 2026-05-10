import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import countries from "@/data/countries"

export const useSettingsStore = defineStore("settings", () => {
  const activeSetting = ref(0);

  const selectedCountry = ref("");
  const countryOptions = countries;

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

  return {
    activeSetting,
    selectedCountry,
    countryOptions,
    settingsMenu,
    settings,
    animationOptions,
    materialOptions,
    validMovesOptions,
    lastMoveOptions,
    secondOptions,
    timerIndicator,
    lowTimeSoundOptions,
    moveWayOptions,
    premoveOptions,
    autoQueenOptions,
    callAgreeOptions,
    messageAgreeOptions,
    subscribeAgreeOptions,
  };
});
