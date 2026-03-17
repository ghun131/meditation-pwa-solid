import { For, type Accessor } from "solid-js";
import "./DurationSelector.css";

const durations = [1, 5, 15, 30, 45, 60];

type DurationSelectorProps = {
  onSelectDuration: (duration: number) => void;
  selectedDuration: Accessor<number>;
};

export default function DurationSelector(props: DurationSelectorProps) {
  return (
    <div class="duration-selector">
      <For each={durations}>
        {(duration) => (
          <button
            class="duration-button"
            classList={{ selected: props.selectedDuration() === duration }}
            onClick={() => props.onSelectDuration(duration)}
          >
            {duration} phút
          </button>
        )}
      </For>
    </div>
  );
}
