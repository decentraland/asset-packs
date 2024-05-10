import {
  IEngine,
  Entity,
  InputAction,
  LastWriteWinElementSetComponentDefinition,
  DeepReadonlyObject,
  PointerEventsSystem,
  TweenSystem,
  TweenState,
  TweenStateStatus,
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import {
  triggers,
  LAYER_1,
  NO_LAYERS,
  getPlayerPosition,
  getWorldPosition,
} from '@dcl-sdk/utils'
import {
  Action,
  ComponentName,
  Trigger,
  TriggerAction,
  TriggerCondition,
  TriggerConditionOperation,
  TriggerConditionType,
  TriggerType,
  getConditionTypesByComponentName,
  getComponents,
  EngineComponents,
} from './definitions'
import { getCurrentValue, getPreviousValue } from './states'
import { getActionEvents, getTriggerEvents } from './events'
import { getPayload } from './action-types'
import { globalInputActions } from './input-actions'
import { tickSet } from './timer'

const initedEntities = new Set<Entity>()
const actionQueue: { entity: Entity; action: Action }[] = []

export const damageTargets = new Set<Entity>()
export const healTargets = new Set<Entity>()

let internalInitTriggers: ((entity: Entity) => void) | null = null

export function initTriggers(entity: Entity) {
  if (internalInitTriggers) {
    return internalInitTriggers(entity)
  }
  throw new Error(
    `Cannot call initTriggers while triggersSystem has not been created`,
  )
}

export function createTriggersSystem(
  engine: IEngine,
  components: EngineComponents,
  pointerEventsSystem: PointerEventsSystem,
  tweenSystem: TweenSystem,
) {
  const { Transform, Tween: TweenComponent, PointerEvents } = components
  const { Actions, States, Counter, Triggers } = getComponents(engine)

  // save reference to the init function
  internalInitTriggers = initEntityTriggers

  return function triggersSystem(_dt: number) {
    // process action queue
    while (actionQueue.length > 0) {
      const { entity, action } = actionQueue.shift()!
      const actionEvents = getActionEvents(entity)
      actionEvents.emit(action.name, getPayload(action))
    }

    const entitiesWithTriggers = engine.getEntitiesWith(Triggers)
    for (const [entity] of entitiesWithTriggers) {
      initEntityTriggers(entity)
      handleOnTweenEnd(entity)
    }
  }

  function initEntityTriggers(entity: Entity) {
    if (!Triggers.has(entity) || initedEntities.has(entity)) {
      return
    }

    // get triggers data
    const triggers = Triggers.get(entity)

    // initialize triggers for given entity
    const types = triggers.value.reduce(
      (types, trigger) => types.add(trigger.type),
      new Set<TriggerType>(),
    )
    for (const type of types) {
      switch (type) {
        /** @deprecated use ON_INPUT_ACTION instead */
        case TriggerType.ON_CLICK: {
          initOnClickTrigger(entity)
          break
        }
        case TriggerType.ON_INPUT_ACTION: {
          initOnInputActionTrigger(entity)
          break
        }
        case TriggerType.ON_PLAYER_ENTERS_AREA:
        case TriggerType.ON_PLAYER_LEAVES_AREA: {
          initOnPlayerTriggerArea(entity)
          break
        }
        case TriggerType.ON_DAMAGE: {
          initOnDamage(entity)
          break
        }
        case TriggerType.ON_HEAL_PLAYER: {
          initOnHealPlayer(entity)
        }
        case TriggerType.ON_GLOBAL_CLICK: {
          initOnGlobalCick(entity)
          break
        }
        case TriggerType.ON_GLOBAL_PRIMARY: {
          initOnGlobalPrimary(entity)
          break
        }
        case TriggerType.ON_GLOBAL_SECONDARY: {
          initOnGlobalSecondary(entity)
          break
        }
        case TriggerType.ON_TICK: {
          initOnTick(entity)
          break
        }
      }
    }

    // bind triggers
    const triggerEvents = getTriggerEvents(entity)
    for (const trigger of triggers.value) {
      triggerEvents.on(trigger.type, () => {
        if (checkConditions(trigger)) {
          for (const triggerAction of trigger.actions) {
            if (isValidAction(triggerAction)) {
              const entity = getEntityByAction(triggerAction)
              if (entity) {
                const actions = Actions.getOrNull(entity)
                if (actions) {
                  const action = actions.value.find(
                    ($) => $.name === triggerAction.name,
                  )
                  if (action) {
                    // actions are enqueued to be executed on the next tick after all the triggers have been processed,
                    // this is to avoid one trigger messing with other trigger's conditions
                    actionQueue.push({ entity, action })
                  }
                }
              }
            }
          }
        }
      })
    }
    triggerEvents.emit(TriggerType.ON_SPAWN)

    initedEntities.add(entity)
  }

  function isValidAction(action: TriggerAction) {
    const { id, name } = action
    return !!id && !!name
  }

  function checkConditions(trigger: DeepReadonlyObject<Trigger>) {
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
    const entity = getEntityByCondition(condition)
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
          case TriggerConditionType.WHEN_PREVIOUS_STATE_IS: {
            const states = States.getOrNull(entity)
            if (states !== null) {
              const previousValue = getPreviousValue(states)
              return previousValue === condition.value
            }
            break
          }
          case TriggerConditionType.WHEN_PREVIOUS_STATE_IS_NOT: {
            const states = States.getOrNull(entity)
            if (states !== null) {
              const previousValue = getPreviousValue(states)
              return previousValue !== condition.value
            }
            break
          }
          case TriggerConditionType.WHEN_COUNTER_EQUALS: {
            const counter = Counter.getOrNull(entity)
            if (counter !== null) {
              const numeric = Number(condition.value)
              if (!isNaN(numeric)) {
                return counter.value === numeric
              }
            }
            break
          }
          case TriggerConditionType.WHEN_COUNTER_IS_GREATER_THAN: {
            const counter = Counter.getOrNull(entity)
            if (counter !== null) {
              const numeric = Number(condition.value)
              if (!isNaN(numeric)) {
                return counter.value > numeric
              }
            }
            break
          }
          case TriggerConditionType.WHEN_COUNTER_IS_LESS_THAN: {
            const counter = Counter.getOrNull(entity)
            if (counter !== null) {
              const numeric = Number(condition.value)
              if (!isNaN(numeric)) {
                return counter.value < numeric
              }
            }
            break
          }
          case TriggerConditionType.WHEN_DISTANCE_TO_PLAYER_LESS_THAN: {
            const position = getWorldPosition(entity)

            const numeric = Number(condition.value)
            if (!isNaN(numeric)) {
              return Vector3.distance(position, getPlayerPosition()) < numeric
            }

            break
          }
          case TriggerConditionType.WHEN_DISTANCE_TO_PLAYER_GREATER_THAN: {
            const position = getWorldPosition(entity)
            const numeric = Number(condition.value)
            if (!isNaN(numeric)) {
              return Vector3.distance(position, getPlayerPosition()) > numeric
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

  function getEntityById<T extends { id: number }>(
    componentName: string,
    id: number,
  ) {
    const Component = engine.getComponent(
      componentName,
    ) as LastWriteWinElementSetComponentDefinition<T>
    const entities = Array.from(engine.getEntitiesWith(Component))
    const result = entities.find(([_entity, value]) => value.id === id)
    return Array.isArray(result) && result.length > 0 ? result[0] : null
  }

  function getEntityByAction(action: TriggerAction) {
    if (action.id) {
      const entity = getEntityById(ComponentName.ACTIONS, action.id)
      if (entity) {
        return entity
      }
    }
    return null
  }

  function getEntityByCondition(condition: TriggerCondition) {
    const componentName = Object.values(ComponentName)
      .map((componentName) => ({
        componentName,
        conditionTypes: getConditionTypesByComponentName(componentName),
      }))
      .reduce<ComponentName | null>(
        (result, { componentName, conditionTypes }) =>
          conditionTypes.includes(condition.type) ? componentName : result,
        null,
      )
    if (componentName && condition.id) {
      const entity = getEntityById(componentName, condition.id)
      if (entity) {
        return entity
      }
    }
    return null
  }

  /** @deprecated use ON_INPUT_ACTION instead */
  // ON_CLICK
  function initOnClickTrigger(entity: Entity) {
    pointerEventsSystem.onPointerDown(
      {
        entity,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Click',
        },
      },
      () => {
        const triggerEvents = getTriggerEvents(entity)
        triggerEvents.emit(TriggerType.ON_CLICK)
      },
    )
  }

  // ON_INPUT_ACTION
  function initOnInputActionTrigger(entity: Entity) {
    const pointerEvent = PointerEvents.getOrNull(entity)

    const opts = {
      button:
        pointerEvent?.pointerEvents[0].eventInfo?.button ||
        InputAction.IA_PRIMARY,
      ...(pointerEvent === null ? { hoverText: 'Press' } : {}),
    }

    pointerEventsSystem.onPointerDown(
      {
        entity,
        opts,
      },
      () => {
        const triggerEvents = getTriggerEvents(entity)
        triggerEvents.emit(TriggerType.ON_INPUT_ACTION)
      },
    )
  }

  // ON_PLAYER_ENTERS_AREA / ON_PLAYER_LEAVES_AREA
  function initOnPlayerTriggerArea(entity: Entity) {
    const transform = Transform.getOrNull(entity)
    triggers.addTrigger(
      entity,
      NO_LAYERS,
      LAYER_1,
      [
        {
          type: 'box',
          scale: transform ? transform.scale : { x: 1, y: 1, z: 1 },
        },
      ],
      () => {
        const triggerEvents = getTriggerEvents(entity)
        triggerEvents.emit(TriggerType.ON_PLAYER_ENTERS_AREA)
      },
      () => {
        const triggerEvents = getTriggerEvents(entity)
        triggerEvents.emit(TriggerType.ON_PLAYER_LEAVES_AREA)
      },
    )
  }

  function initOnDamage(entity: Entity) {
    damageTargets.add(entity)
  }

  function initOnHealPlayer(entity: Entity) {
    healTargets.add(entity)
  }

  function initOnGlobalCick(entity: Entity) {
    globalInputActions.on(InputAction.IA_POINTER, () => {
      const triggerEvents = getTriggerEvents(entity)
      triggerEvents.emit(TriggerType.ON_GLOBAL_CLICK)
    })
  }

  function initOnGlobalPrimary(entity: Entity) {
    globalInputActions.on(InputAction.IA_PRIMARY, () => {
      const triggerEvents = getTriggerEvents(entity)
      triggerEvents.emit(TriggerType.ON_GLOBAL_PRIMARY)
    })
  }

  function initOnGlobalSecondary(entity: Entity) {
    globalInputActions.on(InputAction.IA_SECONDARY, () => {
      const triggerEvents = getTriggerEvents(entity)
      triggerEvents.emit(TriggerType.ON_GLOBAL_SECONDARY)
    })
  }

  function initOnTick(entity: Entity) {
    tickSet.add(entity)
  }

  // ON_TWEEN_END
  function handleOnTweenEnd(entity: Entity) {
    if (
      TweenComponent.getOrNull(entity) &&
      TweenState.getOrNull(entity)?.state === TweenStateStatus.TS_COMPLETED &&
      tweenSystem.tweenCompleted(entity)
    ) {
      const triggerEvents = getTriggerEvents(entity)
      triggerEvents.emit(TriggerType.ON_TWEEN_END)
    }
  }
}
