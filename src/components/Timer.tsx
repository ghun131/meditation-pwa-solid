import { createMemo, type Accessor } from "solid-js";
import "./Timer.css";

type TimerProps = {
  seconds: Accessor<number>;
};

export default function Timer(props: TimerProps) {
  const formattedTime = createMemo(() => {
    const totalSeconds = props.seconds();
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  });

  return (
    <div class="timer">
      <div class="timer-display">{formattedTime()}</div>
    </div>
  );
}
