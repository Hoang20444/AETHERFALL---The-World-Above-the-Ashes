import { useEffect } from 'react'
import { gameStore, useGameSelector } from '../systems/GameState'

export function IntroScreen() {
  const phase = useGameSelector((s) => s.phase)

  useEffect(() => {
    if (phase !== 'intro') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        gameStore.beginJourney()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase])

  if (phase !== 'intro') return null

  return (
    <div className="ui-overlay intro-screen">
      <div className="intro-backdrop" />
      <div className="intro-content">
        <div className="intro-badge">PHASE 1 : PLAYABLE FOUNDATION</div>
        <h1 className="intro-title">AETHERFALL</h1>
        <div className="intro-subtitle">THE WORLD ABOVE THE ASHES</div>

        <p className="intro-lore">
          The Falling has shattered the skyway. As Kael, traverse the ruined floating islands,
          leap across the severed bridges, and reach the Ancient Monument.
        </p>

        <button
          className="fantasy-btn primary-btn"
          onClick={() => gameStore.beginJourney()}
          autoFocus
        >
          <span>BEGIN JOURNEY</span>
          <span className="btn-keyhint">[ SPACE ]</span>
        </button>

        <div className="intro-controls-preview">
          <span>WASD Move</span>
          <span className="dot">•</span>
          <span>Hold Mouse to Orbit</span>
          <span className="dot">•</span>
          <span>Space Jump</span>
          <span className="dot">•</span>
          <span>Shift Sprint</span>
        </div>
      </div>
    </div>
  )
}
