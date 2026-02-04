import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

export const useCoordinatesStore = defineStore("coordinates", () => {
  const activeMode = ref("timer");
  const activeColor = ref("white");
  const flipped = ref(false);
  const showPieces = ref(true);
  const showCoordinates = ref(true)
  const score = ref(0);
  const activeTraining = ref(false);

  const targetSquare = ref("");
  const nextSquare = ref("");
  const timeLeft = ref(30);
  const timeTenths = ref(0);
  const isActive = ref(false);
  const lastSquare = ref("");

  const showError = ref(false);
  const errorTimer = ref(null);
  const showCoordinatesOnBoard = ref(false);

  let intervalID = 0;
  let tenthsIntervalID = 0;

  const pieces = reactive<Record<string, string>>({
    a1: "wR",
    b1: "wN",
    c1: "wB",
    d1: "wQ",
    e1: "wK",
    f1: "wB",
    g1: "wN",
    h1: "wR",
    a2: "wP",
    b2: "wP",
    c2: "wP",
    d2: "wP",
    e2: "wP",
    f2: "wP",
    g2: "wP",
    h2: "wP",

    a7: "bP",
    b7: "bP",
    c7: "bP",
    d7: "bP",
    e7: "bP",
    f7: "bP",
    g7: "bP",
    h7: "bP",
    a8: "bR",
    b8: "bN",
    c8: "bB",
    d8: "bQ",
    e8: "bK",
    f8: "bB",
    g8: "bN",
    h8: "bR",
  });

  const allCoordinates = computed(() => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const coords = [];
    for (const file of files) {
      for (const rank of ranks) {
        coords.push(`${file}${rank}`);
      }
    }
    return coords;
  });

  function generateRandomSquare() {
    let newSquare;
    do {
      const randomIndex = Math.floor(
        Math.random() * allCoordinates.value.length,
      );
      newSquare = allCoordinates.value[randomIndex];
    } while (newSquare === lastSquare.value); // Не повторять предыдущую

    lastSquare.value = newSquare;
    targetSquare.value = newSquare;
    generateNextSquare();

    return newSquare;
  }

  function generateNextSquare() {
    let newNextSquare;
    do {
      const randomIndex = Math.floor(
        Math.random() * allCoordinates.value.length,
      );
      newNextSquare = allCoordinates.value[randomIndex];
    } while (newNextSquare === targetSquare.value); // Не повторять текущую

    nextSquare.value = newNextSquare;
    return newNextSquare;
  }

  function checkClick(squareId: string): boolean {
    if (!isActive.value) return false;

    if (squareId === targetSquare.value) {
      score.value++;
      targetSquare.value = nextSquare.value;
      generateNextSquare();

      return true;
    } else {
      showError.value = true;

      if (errorTimer.value) {
        clearTimeout(errorTimer.value);
      }

      errorTimer.value = setTimeout(() => {
        showError.value = false;
        errorTimer.value = null;
      }, 300);
    }
    return false;
  }

  function startTraining() {
    if (activeColor.value === "random") {
      activeColor.value = Math.random() > 0.5 ? "white" : "black";
      flipped.value = activeColor.value === "black" ? true : false;
    }

    activeTraining.value = true;
    isActive.value = true;
    score.value = 0;
    timeLeft.value = 30;
    timeTenths.value = 0;
    lastSquare.value = "";
    intervalID = 0;
    tenthsIntervalID = 0;
    generateRandomSquare();
    showCoordinatesOnBoard.value = false;

    setTimeout(() => {
      isActive.value = true;
      showCoordinatesOnBoard.value = true;

      if (activeMode.value === "timer") {
        intervalID = setInterval(() => {
          if (timeLeft.value > 0) {
            timeLeft.value--;
          } else {
            isActive.value = false;
            showCoordinatesOnBoard.value = false;
            clearInterval(intervalID);
            clearInterval(tenthsIntervalID);
          }
        }, 1000);

        tenthsIntervalID = setInterval(() => {
          if (isActive.value && timeLeft.value > 0) {
            if (timeTenths.value > 0) {
              timeTenths.value--;
            } else {
              timeTenths.value = 9;
            }
          }
        }, 100);
      }
    }, 1000);
  }

  function stopTraining() {
    if (errorTimer.value) {
      clearTimeout(errorTimer.value);
      errorTimer.value = null;
    }
    showError.value = false;

    clearInterval(intervalID);
    clearInterval(tenthsIntervalID);
    isActive.value = false;
    activeTraining.value = false;
    targetSquare.value = "";
    showCoordinatesOnBoard.value = false;
  }

  const formattedTime = computed(() => {
    if (activeMode.value !== "timer") return "∞";

    const secondsStr =
      timeLeft.value < 10
        ? timeLeft.value.toString()
        : timeLeft.value.toString().padStart(2, "0");

    return `${secondsStr}.${timeTenths.value}`;
  });

  return {
    activeMode,
    activeColor,
    flipped,
    showPieces,
    showCoordinates,
    showCoordinatesOnBoard,
    pieces,
    score,
    activeTraining,
    targetSquare,
    nextSquare,
    timeLeft,
    timeTenths,
    formattedTime,
    isActive,
    lastSquare,
    startTraining,
    stopTraining,
    checkClick,
    generateRandomSquare,
    allCoordinates,
    showError,
  };
});
