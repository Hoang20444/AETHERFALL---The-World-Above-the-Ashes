import { useEffect } from 'react'
import { gameStore, useGameSelector } from '../systems/GameState'

export function PauseMenu() {
  const phase = useGameSelector((s) => s.phase)

  useEffect(() => {
    if (phase !== 'paused') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        gameStore.resume()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase])

  if (phase !== 'paused') return null

  return (
    <div className="ui-overlay pause-screen">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-subtitle">CHRONICLE PAUSED</div>
          <h2 className="modal-title">AETHERFALL</h2>
        </div>

        <p className="pause-lore">
          The Seven Pillars groan under unseen strain. Follow the ancient flagstones across the chasm
          and ascend the tiered dais to awaken the Aether Core.
        </p>

        <div className="pause-actions">
          <button
            className="fantasy-btn primary-btn"
            onClick={() => gameStore.resume()}
            autoFocus
          >
            <span>RESUME EXPLORATION</span>
            <span className="btn-keyhint">[ ESC ]</span>
          </button>

          <button
            className="fantasy-btn secondary-btn"
            onClick={() => gameStore.restart()}
          >
            <span>RESTART EXPEDITION</span>
          </button>
        </div>

        <div className="pause-controls-guide">
          <div className="guide-title">CONTROLS REFERENCE</div>
          <div className="guide-grid">
            <div className="guide-item">
              <span className="guide-key">W A S D</span>
              <span className="guide-desc">Camera-relative movement</span>
            </div>
            <div className="guide-item">
              <span className="guide-key">Mouse Drag</span>
              <span className="guide-desc">Orbit third-person view</span>
            </div>
            <div className="guide-item">
              <span className="guide-key">Mouse Wheel</span>
              <span className="guide-desc">Camera zoom in / out</span>
            </div>
            <div className="guide-item">
              <span className="guide-key">Space</span>
              <span className="guide-desc">Jump (buffered, coyote time)</span>
            </div>
            <div className="guide-item">
              <span className="guide-key">Shift</span>
              <span className="guide-desc">Sprint (momentum leap)</span>
            </div>
            <div className="guide-item">
              <span className="guide-key">Escape</span>
              <span className="guide-desc">Toggle pause</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
