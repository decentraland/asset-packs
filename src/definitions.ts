import { IEngine, Schemas } from '@dcl/sdk/ecs'

export enum ComponentName {
  ACTIONS = 'inspector::Actions',
  TRIGGERS = 'inspector::Triggers',
}

export enum ActionType {
  PLAY_ANIMATION = 'play_animation',
}

export enum TriggerType {
  ON_CLICK = 'on_click',
}

export function createComponents(engine: IEngine) {
  const Actions = engine.defineComponent(ComponentName.ACTIONS, {
    value: Schemas.Array(
      Schemas.Map({
        name: Schemas.String,
        type: Schemas.EnumString<ActionType>(
          ActionType,
          ActionType.PLAY_ANIMATION,
        ),
        animation: Schemas.Optional(Schemas.String),
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
        actions: Schemas.Array(
          Schemas.Map({
            entity: Schemas.Optional(Schemas.Entity),
            name: Schemas.Optional(Schemas.String),
          }),
        ),
      }),
    ),
  })

  return {
    Actions,
    Triggers,
  }
}

export type Components = ReturnType<typeof createComponents>

export type ActionsComponent = Components['Actions']
export type Action = ReturnType<ActionsComponent['get']>['value'][0]

export type TriggersComponent = Components['Triggers']
export type Trigger = ReturnType<TriggersComponent['get']>['value'][0]
export type TriggerAction = Trigger['actions'][0]
