import { IEngine, PointerEventsSystem } from '@dcl/sdk/ecs'
import { createComponents, initComponents } from './definitions'
import { createActionsSystem } from './actions'
import { createTriggersSystem } from './triggers'
import { createTimerSystem } from './timer'

export function initAssetPacks(
  _engine: any,
  _pointerEventsSystem: any,
  components: {
    Animator: any
    Transform: any
    AudioSource: any
    AvatarAttach: any
    VisibilityComponent: any
    GltfContainer: any
  },
) {
  const engine = _engine as IEngine
  const pointerEventsSystem = _pointerEventsSystem as PointerEventsSystem
  try {
    createComponents(engine)
    engine.addSystem(createActionsSystem(engine, components))
    engine.addSystem(createTriggersSystem(engine, pointerEventsSystem))
    engine.addSystem(createTimerSystem())
    initComponents(engine)
  } catch (error) {
    console.error(`Error initializing Asset Packs: ${(error as Error).message}`)
  }
}
