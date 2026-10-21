import { useEffect, useState } from 'react'
import { gameStore, useGameSelector } from '../systems/GameState'

export function GameHUD() {
  const phase = useGameSelector((s) => s.phase)
  const toast = useGameSelector((s) => s.toast)
  const respawnId = useGameSelector((s) => s.respawnId)
  const objectiveRevealId = useGameSelector((s) => s.objectiveRevealId)

  const [visibleToast, setVisibleToast] = useState<string | null>(null)
  const [showObjectiveBanner, setShowObjectiveBanner] = useState(false)
  const [showRespawnMsg, setShowRespawnMsg] = useState(false)

  // Show checkpoint toast briefly
  useEffect(() => {
    if (!toast) return
    const frame = requestAnimationFrame(() => setVisibleToast(toast.text))
    const timer = setTimeout(() => setVisibleToast(null), 3500)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [toast])

  // Show objective banner whenever run starts/restarts
  useEffect(() => {
    if (objectiveRevealId > 0) {
      const frame = requestAnimationFrame(() => setShowObjectiveBanner(true))
      const timer = setTimeout(() => setShowObjectiveBanner(false), 6000)
      return () => {
        cancelAnimationFrame(frame)
        clearTimeout(timer)
      }
    }
  }, [objectiveRevealId])

  // Show quick "Restored to Waystone" notice on falling
  useEffect(() => {
    if (respawnId > 0) {
      const frame = requestAnimationFrame(() => setShowRespawnMsg(true))
      const timer = setTimeout(() => setShowRespawnMsg(false), 2200)
      return () => {
        cancelAnimationFrame(frame)
        clearTimeout(timer)
      }
    }
  }, [respawnId])

  if (phase !== 'playing') return null

  return (
    <div className="ui-overlay hud-root" style={{ pointerEvents: 'none' }}>
      {/* Top Objective Bar */}
      <div className={`objective-card ${showObjectiveBanner ? 'highlight' : ''}`}>
        <div className="objective-icon">
          <span className="aether-glyph">✦</span>
        </div>
        <div className="objective-text-group">
          <div className="objective-label">CURRENT OBJECTIVE</div>
          <div className="objective-title">Reach the Ancient Monument</div>
        </div>
      </div>

      {/* Floating Checkpoint / Lore Toast */}
      {visibleToast && (
        <div className="toast-notification">
          <span className="toast-icon">◆</span>
          <span>{visibleToast}</span>
        </div>
      )}

      {/* Fall recovery flash notice */}
      {showRespawnMsg && (
        <div className="respawn-notification">
          <span>Recovered to nearest Waystone</span>
        </div>
      )}

      {/* Top Right Pause Button for easy mouse clicking */}
      <div className="top-right-bar">
        <button
          className="pause-hud-btn"
          onClick={() => gameStore.togglePause()}
          title="Pause Game [Esc]"
        >
          <span>PAUSE</span>
          <span className="key-tag">ESC</span>
        </button>
      </div>

      {/* Bottom Left Control Hints */}
      <div className="control-hints-panel">
        <div className="hint-row">
          <span className="key-chip">W</span>
          <span className="key-chip">A</span>
          <span className="key-chip">S</span>
          <span className="key-chip">D</span>
          <span className="hint-label">Move</span>
        </div>
        <div className="hint-row">
          <span className="key-chip mouse-chip">LMB / RMB Drag</span>
          <span className="hint-label">Orbit Camera</span>
        </div>
        <div className="hint-row">
          <span className="key-chip wide-chip">SPACE</span>
          <span className="hint-label">Jump</span>
        </div>
        <div className="hint-row">
          <span className="key-chip wide-chip">SHIFT</span>
          <span className="hint-label">Sprint</span>
        </div>
      </div>
    </div>
  )
}
