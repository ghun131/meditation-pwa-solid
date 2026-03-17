import NoSleep from "nosleep.js";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";
import { useWakeLock } from "./useWakeLock";

const GMAIL_APPSCRIPT_ENDPOINT = import.meta.env.VITE_GMAIL_APPSCRIPT_ENDPOINT;

export type MeditationStage =
  | "idle"
  | "intro"
  | "meditation"
  | "ending"
  | "completed";

type MeditationSession = {
  stage: Accessor<MeditationStage>;
  selectedDuration: Accessor<number>;
  setSelectedDuration: (duration: number) => void;
  timeRemaining: Accessor<number>;
  startedAt: Accessor<number | null>;
  isWakeLockSupported: boolean;
  startMeditation: () => Promise<void>;
  beginMeditation: () => void;
  skipMeditation: () => Promise<void>;
  showCompleted: () => void;
  reset: () => Promise<void>;
};

export function createMeditationSession(): MeditationSession {
  const [stage, setStage] = createSignal<MeditationStage>("idle");
  const [selectedDuration, setSelectedDuration] = createSignal(15);
  const [timeRemaining, setTimeRemaining] = createSignal(0);
  const [startedAt, setStartedAt] = createSignal<number | null>(null);
  const totalSeconds = createMemo(() => selectedDuration() * 60);
  const wakeLock = useWakeLock();
  const noSleep = new NoSleep();
  let meditationTimerId: number | undefined;

  const clearMeditationTimer = () => {
    if (meditationTimerId !== undefined) {
      window.clearInterval(meditationTimerId);
      meditationTimerId = undefined;
    }
  };

  const enableNoSleep = async () => {
    try {
      await noSleep.enable();
    } catch (error) {
      console.error("Failed to enable NoSleep:", error);
    }
  };

  const disableNoSleep = () => {
    try {
      noSleep.disable();
    } catch (error) {
      console.error("Failed to disable NoSleep:", error);
    }
  };

  const sendNotification = async (
    email: string,
    subject: string,
    body: string
  ) => {
    if (!email || !GMAIL_APPSCRIPT_ENDPOINT) {
      return;
    }

    try {
      await fetch(GMAIL_APPSCRIPT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          email,
          subject,
          body,
        }),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const showNotification = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Meditation Complete", {
        body: "Giờ ngồi thiền của bạn đã kết thúc, hãy bắt đầu phát hướng dẫn xả thiền nào!",
        icon: "/truc-lam-meditation.svg",
        silent: false,
      });
      return;
    }

    const storedEmail = window.localStorage.getItem("email") || "";
    await sendNotification(
      storedEmail,
      "Meditation Complete",
      `Giờ ngồi thiền của bạn đã kết thúc lúc ${new Date().toLocaleString("vi-VN")}, hãy bắt đầu xả thiền nào!`
    );
  };

  const finishMeditation = async () => {
    if (stage() !== "meditation") {
      return;
    }

    clearMeditationTimer();
    batch(() => {
      setTimeRemaining(0);
      setStage("ending");
    });
    await wakeLock.release();
    await showNotification();
  };

  const tick = () => {
    const sessionStartedAt = startedAt();

    if (sessionStartedAt === null) {
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - sessionStartedAt) / 1000);
    const remainingSeconds = Math.max(totalSeconds() - elapsedSeconds, 0);

    if (remainingSeconds <= 0) {
      setTimeRemaining(0);
      void finishMeditation();
      return;
    }

    setTimeRemaining(remainingSeconds);
  };

  createEffect(() => {
    if (stage() !== "meditation") {
      return;
    }

    if (startedAt() === null) {
      return;
    }

    tick();
    void wakeLock.request();
    meditationTimerId = window.setInterval(tick, 1000);

    onCleanup(() => {
      clearMeditationTimer();
    });
  });

  onCleanup(() => {
    clearMeditationTimer();
    disableNoSleep();
    void wakeLock.release();
  });

  const startMeditation = async () => {
    await enableNoSleep();
    setStage("intro");
  };

  const beginMeditation = () => {
    clearMeditationTimer();
    batch(() => {
      setStartedAt(Date.now());
      setTimeRemaining(totalSeconds());
      setStage("meditation");
    });
  };

  const skipMeditation = async () => {
    await finishMeditation();
  };

  const showCompleted = () => {
    disableNoSleep();
    setStage("completed");
  };

  const reset = async () => {
    clearMeditationTimer();
    disableNoSleep();
    await wakeLock.release();

    batch(() => {
      setStage("idle");
      setTimeRemaining(0);
      setStartedAt(null);
    });
  };

  return {
    stage,
    selectedDuration,
    setSelectedDuration,
    timeRemaining,
    startedAt,
    isWakeLockSupported: wakeLock.isSupported,
    startMeditation,
    beginMeditation,
    skipMeditation,
    showCompleted,
    reset,
  };
}
