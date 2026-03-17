import type { Accessor } from "solid-js";
import Timer from "./Timer";

type MeditationStageProps = {
  onSkip: () => void;
  timeRemaining: Accessor<number>;
};

export default function MeditationStage(props: MeditationStageProps) {
  return (
    <div class="meditation-screen">
      <h2>Trụ Thiền</h2>
      <Timer seconds={props.timeRemaining} />
      <p>Tĩnh lặng trong sự bình an</p>
      <button class="skip-button" onClick={() => props.onSkip()}>
        Bỏ qua
      </button>
    </div>
  );
}
