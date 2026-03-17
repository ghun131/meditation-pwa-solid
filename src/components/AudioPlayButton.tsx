import pauseIcon from "../assets/pause.svg";
import playIcon from "../assets/play.svg";
import styles from "./AudioPlayButton.module.css";

type AudioPlayButtonProps = {
  isPlaying: boolean;
  togglePlayPause: () => void;
};

export default function AudioPlayButton(props: AudioPlayButtonProps) {
  return (
    <div
      class={styles.zenCircleContainer}
      classList={{
        [styles.spinning]: props.isPlaying,
      }}
    >
      <img
        src="/zen.svg"
        alt="Zen circle"
        class={styles.zenCircle}
        classList={{
          [styles.spinning]: props.isPlaying,
          [styles.paused]: !props.isPlaying,
        }}
      />
      <button
        class={styles.centerControlButton}
        onClick={() => props.togglePlayPause()}
        aria-label={props.isPlaying ? "Pause meditation" : "Play meditation"}
      >
        <span class={styles.controlIcon}>
          {props.isPlaying ? (
            <img src={pauseIcon} alt="Pause" />
          ) : (
            <img src={playIcon} alt="Play" />
          )}
        </span>
      </button>
    </div>
  );
}
