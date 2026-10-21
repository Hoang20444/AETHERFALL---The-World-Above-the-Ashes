import { GameScene } from './game/GameScene'
import { CompletionScreen } from './game/ui/CompletionScreen'
import { GameHUD } from './game/ui/GameHUD'
import { IntroScreen } from './game/ui/IntroScreen'
import { PauseMenu } from './game/ui/PauseMenu'
import './App.css'

export default function App() {
  return (
    <div className="game-container">
      {/* 3D WebGL Canvas Layer */}
      <GameScene />

      {/* Cinematic UI Overlays & HUD Layer */}
      <GameHUD />
      <IntroScreen />
      <PauseMenu />
      <CompletionScreen />
    </div>
  )
}
