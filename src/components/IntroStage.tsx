import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { isEarlyMorning, isSafari } from "../utils";
import AudioPlayButton from "./AudioPlayButton";
import styles from "./IntroStage.module.css";

type IntroStageProps = {
  onComplete: () => void;
};

export default function IntroStage(props: IntroStageProps) {
  const [monkType, setMonkType] = createSignal<"bhikkhu" | "bhikkhuni">(
    "bhikkhu"
  );
  const [isPlaying, setIsPlaying] = createSignal(!isSafari());
  const selectedMedia = createMemo(() => {
    const timePrefix = isEarlyMorning() ? "morning" : "general";
    return `intro-${timePrefix}-${monkType()}.mp3`;
  });
  let audioEl!: HTMLAudioElement;

  onMount(() => {
    const requestNotificationPermission = async () => {
      if (!("Notification" in window)) {
        return;
      }

      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    void requestNotificationPermission();

    const email =
      localStorage.getItem("email") ||
      prompt(
        "Để chắc chắn có thể nhận thông báo kết thúc ngồi thiền (đặc biệt trên Safari iOS) bạn có thể nhập thêm EMAIL"
      );

    if (email) {
      localStorage.setItem("email", email);
    }
  });

  createEffect(() => {
    const nextSource = `/${selectedMedia()}`;

    if (!audioEl) {
      return;
    }

    const shouldResume = !audioEl.paused || !isSafari();
    audioEl.src = nextSource;
    audioEl.load();

    if (shouldResume) {
      void audioEl.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    } else {
      setIsPlaying(false);
    }
  });

  const togglePlayPause = () => {
    if (!audioEl) {
      return;
    }

    if (audioEl.paused) {
      void audioEl.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
      return;
    }

    audioEl.pause();
    setIsPlaying(false);
  };

  return (
    <div class="intro-screen">
      <h2>Hô Thiền</h2>
      <div class={styles.buttonContainer}>
        <button
          class={`${styles.selectionButton} ${
            monkType() === "bhikkhu" ? styles.selected : styles.unselected
          }`}
          onClick={() => setMonkType("bhikkhu")}
        >
          Sư thầy
        </button>
        <button
          class={`${styles.selectionButton} ${
            monkType() === "bhikkhuni" ? styles.selected : styles.unselected
          }`}
          onClick={() => setMonkType("bhikkhuni")}
        >
          Sư cô
        </button>
      </div>
      <p>Hít thở sâu và ngồi theo tư thế phù hợp...</p>
      <div class="breathing-animation">
        <AudioPlayButton
          isPlaying={isPlaying()}
          togglePlayPause={togglePlayPause}
        />
      </div>
      <div class="hidden-audio-player">
        <audio
          ref={audioEl!}
          onEnded={() => props.onComplete()}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          preload="auto"
        />
      </div>
      <button class="skip-button" onClick={() => props.onComplete()}>
        Bỏ qua
      </button>
    </div>
  );
}
