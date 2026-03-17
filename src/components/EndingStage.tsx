import { createSignal, onMount } from "solid-js";
import { isSafari } from "../utils";
import AudioPlayButton from "./AudioPlayButton";

type EndingStageProps = {
  onComplete: () => void;
};

export default function EndingStage(props: EndingStageProps) {
  const [isPlaying, setIsPlaying] = createSignal(!isSafari());
  let audioEl!: HTMLAudioElement;

  onMount(() => {
    if (isSafari()) {
      return;
    }

    void audioEl.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
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
    <div class="ending-screen">
      <h2>Xả Thiền</h2>
      <p>Xả thiền theo lời hướng dẫn</p>
      <AudioPlayButton
        isPlaying={isPlaying()}
        togglePlayPause={togglePlayPause}
      />
      <div class="hidden-audio-player">
        <audio
          ref={audioEl!}
          src="/ending.mp3"
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
