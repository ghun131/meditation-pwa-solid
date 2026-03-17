import { Match, Switch } from "solid-js";
import { createMeditationSession } from "../primitives/createMeditationSession";
import CompletedStage from "./CompletedStage";
import DurationSelector from "./DurationSelector";
import EndingStage from "./EndingStage";
import IntroStage from "./IntroStage";
import MeditationStage from "./MeditationStage";
import "./MeditationApp.css";

export default function MeditationApp() {
  const session = createMeditationSession();

  return (
    <div class="meditation-app">
      <Switch>
        <Match when={session.stage() === "idle"}>
          <div class="setup-screen">
            <h2>Lựa chọn thời gian ngồi Thiền</h2>
            <DurationSelector
              onSelectDuration={session.setSelectedDuration}
              selectedDuration={session.selectedDuration}
            />
            <button class="start-button" onClick={() => void session.startMeditation()}>
              Bắt đầu
            </button>
            {session.isWakeLockSupported && (
              <p class="wake-lock-status">Màn hình sẽ không tắt trong khi ngồi thiền</p>
            )}
          </div>
        </Match>

        <Match when={session.stage() === "intro"}>
          <IntroStage onComplete={session.beginMeditation} />
        </Match>

        <Match when={session.stage() === "meditation"}>
          <MeditationStage
            onSkip={() => void session.skipMeditation()}
            timeRemaining={session.timeRemaining}
          />
        </Match>

        <Match when={session.stage() === "ending"}>
          <EndingStage onComplete={session.showCompleted} />
        </Match>

        <Match when={session.stage() === "completed"}>
          <CompletedStage
            onReset={() => void session.reset()}
            selectedDuration={session.selectedDuration}
            startedAt={session.startedAt}
          />
        </Match>
      </Switch>
    </div>
  );
}
