import { engine, Entity, pointerEventsSystem, InputAction } from '@dcl/sdk/ecs'
import { Triggers } from './components'
import { Trigger, TriggerType } from './definitions'
import { playAction } from './actions'

const inited = new Set<Entity>()

export function triggersSystem(_dt: number) {
  const entitiesWithTriggers = engine.getEntitiesWith(Triggers)
  for (const [entity, triggers] of entitiesWithTriggers) {
    if (inited.has(entity)) {
      continue
    }

    for (const trigger of triggers.value) {
      console.log('trigger', trigger, trigger)
      switch (trigger.type) {
        case TriggerType.ON_CLICK: {
          initOnClickTrigger(entity, trigger)
          break
        }
      }
    }

    inited.add(entity)
  }
}

// ON_CLICK
function initOnClickTrigger(entity: Entity, trigger: Trigger) {
  pointerEventsSystem.onPointerDown(
    {
      entity,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
    },
    function () {
      for (const action of trigger.actions) {
        playAction(action.entity, action.name)
      }
    },
  )
}
