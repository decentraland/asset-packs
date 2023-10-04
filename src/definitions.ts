import {
  IEngine,
  ISchema,
  LastWriteWinElementSetComponentDefinition,
  Schemas,
} from '@dcl/sdk/ecs'
import { addActionType } from './action-types'

export * from './action-types'
export * from './events'
export * from './id'
export * from './states'

export enum ComponentName {
  ACTION_TYPES = 'asset-packs::ActionTypes',
  ACTIONS = 'asset-packs::Actions',
  COUNTER = 'asset-packs::Counter',
  TRIGGERS = 'asset-packs::Triggers',
  STATES = 'asset-packs::States',
}

export enum TweenType {
  MOVE_ITEM = 'move_item',
  ROTATE_ITEM = 'rotate_item',
  SCALE_ITEM = 'scale_item',
}

export enum InterpolationType {
  LINEAR = 'linear',
  EASEINQUAD = 'easeinquad',
  EASEOUTQUAD = 'easeoutquad',
  EASEQUAD = 'easequad',
  EASEINSINE = 'easeinsine',
  EASEOUTSINE = 'easeoutsine',
  EASESINE = 'easeinoutsine',
  EASEINEXPO = 'easeinexpo',
  EASEOUTEXPO = 'easeoutexpo',
  EASEEXPO = 'easeinoutexpo',
  EASEINELASTIC = 'easeinelastic',
  EASEOUTELASTIC = 'easeoutelastic',
  EASEELASTIC = 'easeinoutelastic',
  EASEINBOUNCE = 'easeinbounce',
  EASEOUTEBOUNCE = 'easeoutbounce',
  EASEBOUNCE = 'easeinoutbounce',
}

export enum ActionType {
  PLAY_ANIMATION = 'play_animation',
  SET_STATE = 'set_state',
  START_TWEEN = 'start_tween',
  SET_COUNTER = 'set_counter',
  INCREMENT_COUNTER = 'increment_counter',
  DECREASE_COUNTER = 'decrease_counter',
  PLAY_SOUND = 'play_sound',
  SET_VISIBILITY = 'set_visibility',
}

export const ActionSchemas = {
  [ActionType.PLAY_ANIMATION]: Schemas.Map({ animation: Schemas.String }),
  [ActionType.SET_STATE]: Schemas.Map({ state: Schemas.String }),
  [ActionType.START_TWEEN]: Schemas.Map({
    type: Schemas.EnumString<TweenType>(TweenType, TweenType.MOVE_ITEM),
    end: Schemas.Vector3,
    interpolationType: Schemas.EnumString(
      InterpolationType,
      InterpolationType.LINEAR,
    ),
    duration: Schemas.Float,
    relative: Schemas.Boolean,
  }),
  [ActionType.SET_COUNTER]: Schemas.Map({ counter: Schemas.Int }),
  [ActionType.INCREMENT_COUNTER]: Schemas.Map({}),
  [ActionType.DECREASE_COUNTER]: Schemas.Map({}),
  [ActionType.PLAY_SOUND]: Schemas.Map({
    src: Schemas.String,
    loop: Schemas.Optional(Schemas.Boolean),
  }),
  [ActionType.SET_VISIBILITY]: Schemas.Map({ visible: Schemas.Boolean }),
}

export type ActionPayload<T extends ActionType = any> =
  T extends keyof typeof ActionSchemas
    ? (typeof ActionSchemas)[T] extends ISchema
      ? ReturnType<(typeof ActionSchemas)[T]['deserialize']>
      : {}
    : {}

export enum TriggerType {
  ON_CLICK = 'on_click',
  ON_STATE_CHANGE = 'on_state_change',
  ON_SPAWN = 'on_spawn',
  ON_TWEEN_END = 'on_tween_end',
  ON_COUNTER_CHANGE = 'on_counter_change',
  ON_PLAYER_ENTERS_AREA = 'on_player_enters_area',
  ON_PLAYER_LEAVES_AREA = 'on_player_leaves_area',
}

export enum TriggerConditionType {
  WHEN_STATE_IS = 'when_state_is',
  WHEN_STATE_IS_NOT = 'when_state_is_not',
  WHEN_COUNTER_EQUALS = 'when_counter_equals',
  WHEN_COUNTER_IS_GREATER_THAN = 'when_counter_is_greater_than',
  WHEN_COUNTER_IS_LESS_THAN = 'when_counter_is_less_than',
}

export enum TriggerConditionOperation {
  AND = 'and',
  OR = 'or',
}

export function createComponents(engine: IEngine) {
  const ActionTypes = engine.defineComponent(ComponentName.ACTION_TYPES, {
    value: Schemas.Array(
      Schemas.Map({
        type: Schemas.String,
        jsonSchema: Schemas.String,
      }),
    ),
  })

  const Actions = engine.defineComponent(ComponentName.ACTIONS, {
    id: Schemas.Int,
    value: Schemas.Array(
      Schemas.Map({
        name: Schemas.String,
        type: Schemas.String,
        jsonPayload: Schemas.String,
      }),
    ),
  })

  const Counter = engine.defineComponent(ComponentName.COUNTER, {
    id: Schemas.Number,
    value: Schemas.Int,
  })

  const Triggers = engine.defineComponent(ComponentName.TRIGGERS, {
    value: Schemas.Array(
      Schemas.Map({
        type: Schemas.EnumString<TriggerType>(
          TriggerType,
          TriggerType.ON_CLICK,
        ),
        conditions: Schemas.Optional(
          Schemas.Array(
            Schemas.Map({
              id: Schemas.Optional(Schemas.Int),
              type: Schemas.EnumString<TriggerConditionType>(
                TriggerConditionType,
                TriggerConditionType.WHEN_STATE_IS,
              ),
              value: Schemas.String,
            }),
          ),
        ),
        operation: Schemas.Optional(
          Schemas.EnumString<TriggerConditionOperation>(
            TriggerConditionOperation,
            TriggerConditionOperation.AND,
          ),
        ),
        actions: Schemas.Array(
          Schemas.Map({
            id: Schemas.Optional(Schemas.Int),
            name: Schemas.Optional(Schemas.String),
          }),
        ),
      }),
    ),
  })

  const States = engine.defineComponent(ComponentName.STATES, {
    id: Schemas.Number,
    value: Schemas.Array(Schemas.String),
    defaultValue: Schemas.Optional(Schemas.String),
    currentValue: Schemas.Optional(Schemas.String),
  })

  return {
    ActionTypes,
    Actions,
    Counter,
    Triggers,
    States,
  }
}

export function initComponents(engine: IEngine) {
  // Add actions from this package
  const actionTypes = Object.values(ActionType)
  for (const type of actionTypes) {
    const actionType = type as ActionType
    addActionType(engine, actionType, ActionSchemas[actionType])
  }

  // Add counter to root entity
  const Counter = engine.getComponent(
    ComponentName.COUNTER,
  ) as LastWriteWinElementSetComponentDefinition<Counter>
  const counter = Counter.getOrCreateMutable(engine.RootEntity)
  counter.value = counter.value || 0
}

export function getConditionTypesByComponentName(componentName: ComponentName) {
  switch (componentName) {
    case ComponentName.STATES: {
      return [
        TriggerConditionType.WHEN_STATE_IS,
        TriggerConditionType.WHEN_STATE_IS_NOT,
      ]
    }
    case ComponentName.COUNTER: {
      return [
        TriggerConditionType.WHEN_COUNTER_EQUALS,
        TriggerConditionType.WHEN_COUNTER_IS_GREATER_THAN,
        TriggerConditionType.WHEN_COUNTER_IS_LESS_THAN,
      ]
    }
    default: {
      return []
    }
  }
}

export type Components = ReturnType<typeof createComponents>

export type ActionTypesComponent = Components['ActionTypes']
export type ActionTypes = ReturnType<
  ActionTypesComponent['schema']['deserialize']
>

export type ActionsComponent = Components['Actions']
export type Actions = ReturnType<ActionsComponent['schema']['deserialize']>
export type Action = Actions['value'][0]

export type CounterComponent = Components['Counter']
export type Counter = ReturnType<CounterComponent['schema']['deserialize']>

export type TriggersComponent = Components['Triggers']
export type Triggers = ReturnType<TriggersComponent['schema']['deserialize']>
export type Trigger = Triggers['value'][0]
export type TriggerAction = Trigger['actions'][0]
export type TriggerCondition = Exclude<Trigger['conditions'], undefined>[0]

export type StatesComponent = Components['States']
export type States = ReturnType<StatesComponent['schema']['deserialize']>
