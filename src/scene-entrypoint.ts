import { IEngine, PointerEventsSystem } from '@dcl/sdk/ecs'
import {
  createComponents,
  initComponents,
} from './definitions'
import { createActionsSystem } from './actions'
import { createTriggersSystem } from './triggers'
import { createTimerSystem } from './timer'
import { getExplorerComponents } from './components'

export function initAssetPacks(engine: IEngine) {
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
