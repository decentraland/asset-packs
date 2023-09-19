import { engine, Entity, pointerEventsSystem, InputAction } from '@dcl/sdk/ecs'
import { States, Triggers } from './components'
import {
  Trigger,
  TriggerCondition,
  TriggerConditionOperation,
  TriggerConditionType,
  TriggerType,
} from './definitions'
import { executeAction } from './actions'
import { getCurrentValue } from './states'

const inited = new Set<Entity>()

export function triggersSystem(_dt: number) {
  const entitiesWithTriggers = engine.getEntitiesWith(Triggers)
  for (const [entity, triggers] of entitiesWithTriggers) {
    if (inited.has(entity)) {
      continue
    }

    // ON_CLICK Triggers
    const onClickTriggers = triggers.value.filter(
      (trigger) => trigger.type === TriggerType.ON_CLICK,
    )

    if (onClickTriggers.length > 0) {
      initOnClickTriggers(entity, onClickTriggers)
    }

    inited.add(entity)
  }
}

function checkConditions(trigger: Trigger) {
  if (trigger.conditions && trigger.conditions.length > 0) {
    const conditions = trigger.conditions.map(checkCondition)
    const isTrue = (result?: boolean) => !!result
    const operation = trigger.operation || TriggerConditionOperation.AND
    switch (operation) {
      case TriggerConditionOperation.AND: {
        return conditions.every(isTrue)
      }
      case TriggerConditionOperation.OR: {
        return conditions.some(isTrue)
      }
    }
  }
  // if there are no conditions, the trigger can continue
  return true
}

function checkCondition(condition: TriggerCondition) {
  const entity = condition.entity
  if (entity) {
    try {
      switch (condition.type) {
        case TriggerConditionType.WHEN_STATE_IS: {
          const states = States.getOrNull(entity)
          if (states !== null) {
            const currentValue = getCurrentValue(states)
            return currentValue === condition.value
          }
          break
        }
        case TriggerConditionType.WHEN_STATE_IS_NOT: {
          const states = States.getOrNull(entity)
          if (states !== null) {
            const currentValue = getCurrentValue(states)
            return currentValue !== condition.value
          }
          break
        }
      }
    } catch (error) {
      console.error('Error in condition', condition)
    }
  }
  return false
}

function initOnClickTriggers(entity: Entity, triggers: Trigger[]) {
  pointerEventsSystem.onPointerDown(
    {
      entity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Click',
      },
    },
    function () {
      for (const trigger of triggers) {
        if (checkConditions(trigger)) {
          for (const action of trigger.actions) {
            executeAction(action.entity, action.name)
          }

          return
        }
      }
    },
  )
}
