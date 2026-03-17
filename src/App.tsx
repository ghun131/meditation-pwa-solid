import MeditationApp from "./components/MeditationApp";
import "./App.css";

export default function App() {
  return (
    <div class="App">
      <header class="App-header">
        <h1>Thiền Trúc Lâm</h1>
      </header>
      <main>
        <MeditationApp />
      </main>
      <footer>
        <p>© 2025 Đoàn thanh niên Phật tử Thiền phái Trúc Lâm</p>
      </footer>
    </div>
  );
}
