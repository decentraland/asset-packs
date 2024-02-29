import {
  IEngine,
  Entity,
  PointerEventsSystem,
  InputAction,
  LastWriteWinElementSetComponentDefinition,
  DeepReadonlyObject,
} from '@dcl/sdk/ecs'
import { createPointerEventsSystem } from '@dcl/ecs/dist/systems/events'
import { createInputSystem } from '@dcl/ecs/dist/engine/input'
import { triggers, LAYER_1, NO_LAYERS } from '@dcl-sdk/utils'
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
import { getCurrentValue } from './states'
import { getActionEvents, getTriggerEvents } from './events'
import { getPayload } from './action-types'

const initedEntities = new Set<Entity>()
const actionQueue: { entity: Entity; action: Action }[] = []

let internalInitTriggers: ((entity: Entity) => void) | null = null

export function initTriggers(entity: Entity) {
  if (internalInitTriggers) {
    return internalInitTriggers(entity)
  }
  throw new Error(
    `Cannot call initTriggers while triggersSystem has not been created`,
  )
}

export function createTriggersSystem(engine: IEngine, components: EngineComponents) {
  const inputSystem = createInputSystem(engine)
  const pointerEventsSystem = createPointerEventsSystem(engine, inputSystem)
  const { Transform } = components
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
        case TriggerType.ON_CLICK: {
          initOnClickTrigger(entity)
          break
        }
        case TriggerType.ON_PLAYER_ENTERS_AREA:
        case TriggerType.ON_PLAYER_LEAVES_AREA: {
          initOnPlayerTriggerArea(entity)
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
}
