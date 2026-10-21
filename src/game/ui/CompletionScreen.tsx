import { gameStore, useGameSelector } from '../systems/GameState'

export function CompletionScreen() {
  const phase = useGameSelector((s) => s.phase)
  const completionTime = useGameSelector((s) => s.completionTime)

  if (phase !== 'complete') return null

  const minutes = completionTime ? Math.floor(completionTime / 60) : 0
  const seconds = completionTime ? Math.floor(completionTime % 60) : 0
  const formattedTime = `${minutes}m ${seconds.toString().padStart(2, '0')}s`

  return (
    <div className="ui-overlay completion-screen">
      <div className="modal-dialog completion-card">
        <div className="completion-badge">
          <span className="aether-pulse">✦</span>
          <span>EXPEDITION COMPLETE</span>
        </div>

        <h2 className="completion-title">THE AETHER AWAKENS</h2>

        <p className="completion-story">
          Kael steps upon the sacred dais. The hovering Aether Core pulses with blinding cyan light,
          knitting the severed air currents back into harmony. In your mind, foreign memories stir—visions
          of the Seven Pillars before the fall.
        </p>

        <div className="completion-metrics">
          <div className="metric-box">
            <div className="metric-label">ASCENT TIME</div>
            <div className="metric-value">{formattedTime}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">STATUS</div>
            <div className="metric-value text-aether">HARMONIZED</div>
          </div>
        </div>

        <div className="next-phase-box">
          <div className="next-tag">NEXT MILESTONE</div>
          <div className="next-text">
            <strong>Phase 2:</strong> Custom Blender rigged character model, keyframe animation blending,
            and the Aether Dash traversal ability.
          </div>
        </div>

        <button
          className="fantasy-btn primary-btn"
          onClick={() => gameStore.restart()}
          autoFocus
        >
          <span>TRAVERSE THE SKYWAY AGAIN</span>
        </button>
      </div>
    </div>
  )
}
