import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

type WakeLockApi = {
  isSupported: boolean;
  isEnabled: Accessor<boolean>;
  request: () => Promise<void>;
  release: () => Promise<void>;
};

export function useWakeLock(): WakeLockApi {
  const isSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const [wakeLock, setWakeLock] = createSignal<WakeLockSentinel | null>(null);
  const [isEnabled, setIsEnabled] = createSignal(false);

  const clearWakeLockState = () => {
    setWakeLock(null);
    setIsEnabled(false);
  };

  const handleWakeLockRelease = () => {
    clearWakeLockState();
  };

  const request = async () => {
    try {
      if (!isSupported) {
        return;
      }

      const currentWakeLock = wakeLock();
      if (currentWakeLock && !currentWakeLock.released) {
        return;
      }

      const wakeLockSentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinel.addEventListener("release", handleWakeLockRelease);
      setWakeLock(wakeLockSentinel);
      setIsEnabled(true);
    } catch (error) {
      console.error("Failed to request wake lock:", error);
      clearWakeLockState();
    }
  };

  const release = async () => {
    const currentWakeLock = wakeLock();

    try {
      if (!currentWakeLock) {
        return;
      }

      currentWakeLock.removeEventListener("release", handleWakeLockRelease);
      await currentWakeLock.release();
    } catch (error) {
      console.error("Failed to release wake lock:", error);
    } finally {
      clearWakeLockState();
    }
  };

  onMount(() => {
    if (!isSupported) {
      alert("Màn của bạn không thể thức trong suốt quá trình ngồi thiền!");
    }
  });

  onMount(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (wakeLock()) {
        await request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    onCleanup(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  });

  return {
    isSupported,
    isEnabled,
    request,
    release,
  };
}
