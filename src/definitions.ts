import { IEngine, ISchema, Schemas } from '@dcl/sdk/ecs'
import { InterpolationType } from '@dcl-sdk/utils'
import { addActionType } from './action-types'

export * from './action-types'
export * from './events'
export * from './states'

export { InterpolationType }

export enum ComponentName {
  ACTION_TYPES = 'asset-packs::ActionTypes',
  ACTIONS = 'asset-packs::Actions',
  TRIGGERS = 'asset-packs::Triggers',
  STATES = 'asset-packs::States',
}

export enum TweenType {
  MOVE_ITEM = 'move_item',
  ROTATE_ITEM = 'rotate_item',
  SCALE_ITEM = 'scale_item',
}

export enum ActionType {
  PLAY_ANIMATION = 'play_animation',
  SET_STATE = 'set_state',
  START_TWEEN = 'start_tween',
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
}

export enum TriggerConditionType {
  WHEN_STATE_IS = 'when_state_is',
  WHEN_STATE_IS_NOT = 'when_state_is_not',
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
    value: Schemas.Array(
      Schemas.Map({
        name: Schemas.String,
        type: Schemas.String,
        jsonPayload: Schemas.String,
      }),
    ),
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
              entity: Schemas.Optional(Schemas.Entity),
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
            entity: Schemas.Optional(Schemas.Entity),
            name: Schemas.Optional(Schemas.String),
          }),
        ),
      }),
    ),
  })

  const States = engine.defineComponent(ComponentName.STATES, {
    value: Schemas.Array(Schemas.String),
    defaultValue: Schemas.Optional(Schemas.String),
    currentValue: Schemas.Optional(Schemas.String),
  })

  return {
    ActionTypes,
    Actions,
    Triggers,
    States,
  }
}

export type Components = ReturnType<typeof createComponents>

export type ActionTypesComponent = Components['ActionTypes']
export type ActionTypes = ReturnType<ActionTypesComponent['getOrCreateMutable']>

export type ActionsComponent = Components['Actions']
export type Action = ReturnType<ActionsComponent['get']>['value'][0]

export type TriggersComponent = Components['Triggers']
export type Trigger = ReturnType<TriggersComponent['get']>['value'][0]
export type TriggerAction = Trigger['actions'][0]
export type TriggerCondition = Exclude<Trigger['conditions'], undefined>[0]

export type StatesComponent = Components['States']
export type States = ReturnType<StatesComponent['get']>

export function addActionTypes(engine: IEngine) {
  // Add actions from this package
  for (const type of Object.values(ActionType).filter(
    ($) => typeof $ === 'string' && isNaN(+$),
  )) {
    const actionType = type as ActionType
    addActionType(engine, actionType, ActionSchemas[actionType])
  }
}
