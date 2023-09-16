import logo from './assets/logo.svg'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'

function App() {
  async function greet(value: string) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke('greet', { name: value })
  }

  async function greet2(value: string) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke('greet2', { name: value })
  }

  return (
    <div class="container">
      <h1>Welcome to Tauri!</h1>

      <div class="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

      <input
        type="range"
        min="40"
        max="20000"
        value="440"
        onInput={e => greet(e.currentTarget.value)}
      />

      <input
        type="range"
        min="0"
        max="1000"
        value="0"
        onInput={e => greet2(e.currentTarget.value)}
      />
    </div>
  )
}

export default App
