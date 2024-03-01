import { IEngine } from '@dcl/sdk/ecs'
import {
  createComponents,
  initComponents,
} from './definitions'
import { createActionsSystem } from './actions'
import { createTriggersSystem } from './triggers'
import { createTimerSystem } from './timer'
import { getExplorerComponents } from './components'

let initialized: boolean = false
/**
 * the _args param is there to mantain backwards compatibility with all versions.
 * Before it was initAssetPacks(engine, pointerEventsSystem, components)
 */
export function initAssetPacks(_engine: unknown, ..._args: any[]) {
  // Avoid creating the same systems if asset-pack is called more than once
  if (initialized) return
  initialized = true
  // .

  const engine = _engine as IEngine
  try {
    const components = getExplorerComponents(engine)
    // create editor components
    createComponents(engine)

    // create systems that some components needs (VideoPlayer, etc)
    initComponents(engine)
    engine.addSystem(createActionsSystem(engine))
    engine.addSystem(
      createTriggersSystem(engine, components),
    )
    engine.addSystem(createTimerSystem())
  } catch (error) {
    console.error(`Error initializing Asset Packs: ${(error as Error).message}`)
  }
}
