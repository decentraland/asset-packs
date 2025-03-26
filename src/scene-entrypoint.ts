import {
  IEngine,
  createInputSystem,
  createPointerEventsSystem,
  createTweenSystem,
} from '@dcl/ecs'
import { createReactBasedUiSystem } from '@dcl/react-ecs'
import {
  createComponents,
  initComponents,
  IPlayersHelper,
  ISDKHelpers,
} from './definitions'
import { createActionsSystem } from './actions'
import { createTriggersSystem } from './triggers'
import { createTimerSystem } from './timer'
import { getExplorerComponents as getEngineComponents } from './components'
import { createTransformSystem } from './transform'
import { createInputActionSystem } from './input-actions'
import { createCounterBarSystem } from './counter-bar'
import { createAdminToolkitSystem } from './admin-toolkit'

let initialized: boolean = false
/**
 * the _args param is there to mantain backwards compatibility with all versions.
 * Before it was initAssetPacks(engine, pointerEventsSystem, components)
 */
export function initAssetPacks(
  _engine: unknown,
  sdkHelpers?: ISDKHelpers,
  playersHelper?: IPlayersHelper,
) {
  // Avoid creating the same systems if asset-pack is called more than once
  if (initialized) return
  initialized = true

  const engine = _engine as IEngine

  try {
    // get engine components
    const components = getEngineComponents(engine)

    // create asset packs components
    createComponents(engine)

    // create core systems
    const inputSystem = createInputSystem(engine)
    const pointerEventsSystem = createPointerEventsSystem(engine, inputSystem)
    const tweenSystem = createTweenSystem(engine)
    const reactBasedUiSystem = createReactBasedUiSystem(
      engine,
      pointerEventsSystem,
    )

    // create systems that some components needs (VideoPlayer, etc)
    initComponents(engine)
    engine.addSystem(
      createActionsSystem(
        engine,
        pointerEventsSystem,
        sdkHelpers,
        playersHelper,
      ),
    )
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
    engine.addSystem(
      createAdminToolkitSystem(
        engine,
        pointerEventsSystem,
        reactBasedUiSystem,
        sdkHelpers,
        playersHelper,
      ),
    )
  } catch (error) {
    console.error(`Error initializing Asset Packs: ${(error as Error).message}`)
  }
}
