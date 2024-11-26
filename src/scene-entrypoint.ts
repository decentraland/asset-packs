import {
  Entity,
  IEngine,
  createInputSystem,
  createPointerEventsSystem,
  createTweenSystem,
} from '@dcl/ecs'
import { createComponents, initComponents } from './definitions'
import { createActionsSystem } from './actions'
import { createTriggersSystem } from './triggers'
import { createTimerSystem } from './timer'
import { getExplorerComponents as getEngineComponents } from './components'
import { createTransformSystem } from './transform'
import { createInputActionSystem } from './input-actions'
import { createCounterBarSystem } from './counter-bar'

export type ISdkCache = {
  // Store the engine to avoid passing the engine to nested functions.
  engine: IEngine
  // SyncEntity helper to create network entities at runtime.
  syncEntity?: SyncEntitySDK
}
export type SyncEntitySDK =  (entityId: Entity, componentIds: number[], entityEnumId?: number | undefined) => void

export let SdkCache: ISdkCache

let initialized: boolean = false
/**
 * the _args param is there to mantain backwards compatibility with all versions.
 * Before it was initAssetPacks(engine, pointerEventsSystem, components)
 */
export function initAssetPacks(_engine: unknown, sdkHelpers: Omit<ISdkCache, 'engine'>) {
  // Avoid creating the same systems if asset-pack is called more than once
  if (initialized) return
  initialized = true

  const engine = _engine as IEngine

  SdkCache = { engine }

  if ('syncEntity' in sdkHelpers) {
    SdkCache = { ...SdkCache, ...sdkHelpers }
  }

  try {
    // get engine components
    const components = getEngineComponents(engine)

    // create asset packs components
    createComponents(engine)

    // create core systems
    const inputSystem = createInputSystem(engine)
    const pointerEventsSystem = createPointerEventsSystem(engine, inputSystem)
    const tweenSystem = createTweenSystem(engine)

    // create systems that some components needs (VideoPlayer, etc)
    initComponents(engine)
    engine.addSystem(createActionsSystem(engine))
    engine.addSystem(
      createTriggersSystem(
        engine,
        components,
        pointerEventsSystem,
        tweenSystem,
      ),
    )
    engine.addSystem(createTimerSystem())
    engine.addSystem(createInputActionSystem(inputSystem))
    engine.addSystem(createCounterBarSystem(engine, components))
    engine.addSystem(createTransformSystem(components))
  } catch (error) {
    console.error(`Error initializing Asset Packs: ${(error as Error).message}`)
  }
}
