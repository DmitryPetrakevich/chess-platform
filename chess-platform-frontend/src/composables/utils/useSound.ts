const moveAudio = new Audio(
  new URL("@/assets/sounds/move.mp3", import.meta.url).href,
);

const sixSevenAudio = new Audio(
  new URL("@/assets/sounds/67.mp3", import.meta.url).href,
);

const captureAudio = new Audio(
  new URL("@/assets/sounds/capture.mp3", import.meta.url).href,
);

const startAudio = new Audio(
  new URL("@/assets/sounds/start.mp3", import.meta.url).href,
)

const errorAudio = new Audio(
  new URL("@/assets/sounds/error.mp3", import.meta.url).href,
)

const berserkAudio = new Audio(
  new URL("@/assets/sounds/berserk.mp3", import.meta.url).href,
)

const lowTimeAudio = new Audio(
  new URL("@/assets/sounds/low-time.mp3", import.meta.url).href,
)

const checkAudio = new Audio(
   new URL("@/assets/sounds/check.mp3", import.meta.url).href,
)

checkAudio.volume = 0.6;

export function useSound() {
  const playMove = () => {
    moveAudio.currentTime = 0;
    moveAudio.play().catch(() => {});
  };

  const sixSeven = () => {
    sixSevenAudio.currentTime = 0;
    sixSevenAudio.play().catch(() => {});
  }

  const captureMove = () => {
    captureAudio.currentTime = 0;
    captureAudio.play().catch(() => {});
  }

  const checkMove = () => {
    checkAudio.currentTime = 0;
    checkAudio.play().catch(() => {});
  }

  const startSound = () => {
    startAudio.currentTime = 0;
    startAudio.play().catch(() => {});
  }

  const errorSound = () => {
    errorAudio.currentTime = 0;
    errorAudio.play().catch(() => {});
  }

  const berserkSound = () => {
    berserkAudio.currentTime = 0;
    berserkAudio.play().catch(() => {});
  }

  const lowTimeSound = () => {
    lowTimeAudio.currentTime = 0;
    lowTimeAudio.play().catch(() => {});
  }

  return {
    playMove,
    sixSeven,
    captureMove,
    checkMove,
    startSound,
    errorSound,
    berserkSound,
    lowTimeSound
  };
}
