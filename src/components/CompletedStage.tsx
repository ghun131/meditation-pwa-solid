import dayjs from "dayjs";
import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

const STORAGE_KEY = "meditation_user_name";
const DATA_SHEET_ENDPOINT = import.meta.env.VITE_DATA_SHEET_ENDPOINT;

type CompletedStageProps = {
  onReset: () => void | Promise<void>;
  selectedDuration: Accessor<number>;
  startedAt: Accessor<number | null>;
};

export default function CompletedStage(props: CompletedStageProps) {
  const [name, setName] = createSignal("");
  const [isEditing, setIsEditing] = createSignal(false);
  const [isCopied, setIsCopied] = createSignal(false);
  let copyFeedbackTimerId: number | undefined;

  onMount(() => {
    const storedName = localStorage.getItem(STORAGE_KEY);

    if (storedName) {
      setName(storedName);
    }
  });

  onCleanup(() => {
    if (copyFeedbackTimerId !== undefined) {
      window.clearTimeout(copyFeedbackTimerId);
    }
  });

  const handleNameChange = (newName: string) => {
    setName(newName);

    try {
      localStorage.setItem(STORAGE_KEY, newName);
    } catch (error) {
      console.error("Error saving name:", error);
    }
  };

  const autoUpdateSittingTime = async (personTime: string) => {
    if (!DATA_SHEET_ENDPOINT) {
      return;
    }

    try {
      await fetch(DATA_SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          personTime,
        }),
      });
    } catch (error) {
      console.error("Error updating sitting time:", error);
    }
  };

  const handleCopyToClipboard = async () => {
    const trimmedName = name().trim();
    const sessionStartedAt = props.startedAt();

    if (!trimmedName || sessionStartedAt === null || !navigator.clipboard) {
      return;
    }

    const startedTime = dayjs(sessionStartedAt);
    const endedTime = startedTime.add(props.selectedDuration(), "minutes");
    const timePeriod = `${startedTime.format("HH:mm")}-${endedTime.format("HH:mm")}`;
    const timedString = timePeriod.replace(/:/g, "h");
    const textToCopy = `${trimmedName} ${timedString} _()_`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      await autoUpdateSittingTime(textToCopy);
      setIsCopied(true);

      if (copyFeedbackTimerId !== undefined) {
        window.clearTimeout(copyFeedbackTimerId);
      }

      copyFeedbackTimerId = window.setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div class="completed-screen">
      <h2>Cảm ơn bạn đã dành thời gian cho bản thân hôm nay.</h2>
      {isEditing() ? (
        <div class="name-container">
          <input
            class="input"
            placeholder="Nhập tên"
            value={name()}
            onBlur={() => setIsEditing(false)}
            onInput={(event) => handleNameChange(event.currentTarget.value)}
          />
          <button
            class="copy-button"
            disabled={!name().trim()}
            onClick={() => setIsEditing(false)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3a6351"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div class="name-container">
          <button class="name-button" onClick={() => setIsEditing(true)}>
            {name() ? <span>{name()}</span> : "Tên bạn"}
          </button>
          <button
            class="copy-button"
            disabled={!name().trim()}
            onClick={() => void handleCopyToClipboard()}
          >
            {isCopied() ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3a6351"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3a6351"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      )}
      <button class="reset-button" onClick={() => void props.onReset()}>
        Ngồi lại
      </button>
    </div>
  );
}
