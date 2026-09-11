/**
 * Minimal typed event bus. The simulation emits facts ("a missile landed here",
 * "someone was radicalised"); rendering, audio and UI subscribe. Keeps sim/
 * free of any dependency on three.js or the DOM.
 */

export type GameEvents = {
  missileLaunched: { x: number; z: number }
  missileImpact: { x: number; z: number; killed: number; buildingsHit: number }
  personKilled: { x: number; z: number }
  buildingDestroyed: { x: number; z: number; width: number; depth: number; height: number }
  buildingRebuilt: { x: number; z: number }
  mourningBegan: { x: number; z: number }
  radicalised: { x: number; z: number }
  launcherReady: Record<string, never>
  worldReset: Record<string, never>
}

type Handler<T> = (payload: T) => void

export class EventBus<E extends Record<string, unknown>> {
  private handlers = new Map<keyof E, Set<Handler<never>>>()

  on<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void {
    let set = this.handlers.get(type)
    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }
    set.add(handler as Handler<never>)
    return () => {
      set!.delete(handler as Handler<never>)
    }
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    const set = this.handlers.get(type)
    if (!set) return
    for (const handler of set) (handler as Handler<E[K]>)(payload)
  }

  clear(): void {
    this.handlers.clear()
  }
}

export type GameBus = EventBus<GameEvents>
