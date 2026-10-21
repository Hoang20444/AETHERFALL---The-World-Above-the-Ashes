/**
 * Keyboard input. Tracks held keys and edge-triggered actions (jump).
 * Keys are cleared when the window loses focus so nothing stays "stuck".
 */

export interface MoveInput {
  /** -1 (left) .. 1 (right) */
  strafe: number
  /** -1 (back) .. 1 (forward) */
  forward: number
  sprint: boolean
  /** True only on the frame the jump key went down. */
  jumpPressed: boolean
  jumpHeld: boolean
}

export interface InputHandlers {
  onEscape: () => void
  onFocusLost: () => void
}

const CAPTURED_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space', 'ShiftLeft', 'ShiftRight',
])

class KeyboardInput {
  private held = new Set<string>()
  private jumpQueued = false

  attach(handlers: InputHandlers): () => void {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        handlers.onEscape()
        return
      }
      if (!CAPTURED_KEYS.has(event.code)) return
      // Keep Space/arrows from scrolling the page or re-activating focused buttons.
      event.preventDefault()
      if (event.code === 'Space' && !event.repeat) this.jumpQueued = true
      this.held.add(event.code)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      this.held.delete(event.code)
    }
    const onBlur = () => {
      this.clear()
      handlers.onFocusLost()
    }
    const onVisibility = () => {
      if (document.hidden) onBlur()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      this.clear()
    }
  }

  clear() {
    this.held.clear()
    this.jumpQueued = false
  }

  /** Fills `out` with the current movement intent and consumes the queued jump. */
  read(out: MoveInput): MoveInput {
    const h = this.held
    out.forward = (h.has('KeyW') || h.has('ArrowUp') ? 1 : 0) - (h.has('KeyS') || h.has('ArrowDown') ? 1 : 0)
    out.strafe = (h.has('KeyD') || h.has('ArrowRight') ? 1 : 0) - (h.has('KeyA') || h.has('ArrowLeft') ? 1 : 0)
    out.sprint = h.has('ShiftLeft') || h.has('ShiftRight')
    out.jumpHeld = h.has('Space')
    out.jumpPressed = this.jumpQueued
    this.jumpQueued = false
    return out
  }

  /** Discards a queued jump (used while paused so it does not fire on resume). */
  discardQueued() {
    this.jumpQueued = false
  }
}

export const keyboard = new KeyboardInput()

export function createMoveInput(): MoveInput {
  return { strafe: 0, forward: 0, sprint: false, jumpPressed: false, jumpHeld: false }
}

export function resetMoveInput(input: MoveInput): MoveInput {
  input.strafe = 0
  input.forward = 0
  input.sprint = false
  input.jumpPressed = false
  input.jumpHeld = false
  return input
}
