import logo from './assets/logo.svg'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'
import { Dial } from './components/Dial'
import { createSignal } from 'solid-js'

function App() {
  async function greet(value: number) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke('greet', { name: value })
  }

  async function greet2(value: number) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke('greet2', { name: value })
  }

  async function greet3(value: number) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke('greet3', { name: value })
  }

  const [freq, setFreq] = createSignal(22000)
  const [amp, setAmp] = createSignal(0)
  const [pan, setPan] = createSignal(0)

  return (
    <div class="container">
      <div style={{ display: 'flex' }}>
        <Dial
          value={freq()}
          minValue={10}
          maxValue={22000}
          unit="Hz"
          onInput={value => {
            setFreq(value)
            greet(value)
          }}
        />
        <Dial
          value={amp()}
          minValue={-60}
          maxValue={24}
          unit="dB"
          onInput={value => {
            setAmp(value)
            greet2(value)
          }}
        />
        <Dial
          value={pan()}
          minValue={-50}
          maxValue={50}
          unit="pan"
          onInput={value => {
            setPan(value)
            greet3(value)
          }}
        />
      </div>
    </div>
  )
}

export default App
