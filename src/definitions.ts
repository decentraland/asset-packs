import {
  Entity,
  IEngine,
  ISchema,
  LastWriteWinElementSetComponentDefinition,
  Material,
  PBMaterial,
  Schemas,
  VideoPlayer,
  VideoTexture,
} from '@dcl/sdk/ecs'
import { addActionType } from './action-types'
import {
  ComponentName,
  TweenType,
  InterpolationType,
  ActionType,
  TriggerType,
  TriggerConditionType,
  TriggerConditionOperation,
  TextAlignMode,
  Font,
} from './enums'

export * from './enums'
export * from './action-types'
export * from './events'
export * from './id'
export * from './states'

export const ActionSchemas = {
  [ActionType.PLAY_ANIMATION]: Schemas.Map({
    animation: Schemas.String,
    loop: Schemas.Optional(Schemas.Boolean),
  }),
  [ActionType.STOP_ANIMATION]: Schemas.Map({}),
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
    volume: Schemas.Optional(Schemas.Float),
  }),
  [ActionType.STOP_SOUND]: Schemas.Map({}),
  [ActionType.SET_VISIBILITY]: Schemas.Map({
    visible: Schemas.Boolean,
    physicsCollider: Schemas.Optional(Schemas.Boolean),
  }),
  [ActionType.ATTACH_TO_PLAYER]: Schemas.Map({
    anchorPointId: Schemas.Int,
  }),
  [ActionType.DETACH_FROM_PLAYER]: Schemas.Map({}),
  [ActionType.PLAY_VIDEO_STREAM]: Schemas.Map({
    src: Schemas.Optional(Schemas.String),
    loop: Schemas.Optional(Schemas.Boolean),
    volume: Schemas.Optional(Schemas.Float),
    dclCast: Schemas.Optional(Schemas.Boolean),
  }),
  [ActionType.STOP_VIDEO_STREAM]: Schemas.Map({}),
  [ActionType.PLAY_AUDIO_STREAM]: Schemas.Map({
    url: Schemas.String,
    volume: Schemas.Optional(Schemas.Float),
  }),
  [ActionType.STOP_AUDIO_STREAM]: Schemas.Map({}),
  [ActionType.TELEPORT_PLAYER]: Schemas.Map({
    x: Schemas.Int,
    y: Schemas.Int,
  }),
  [ActionType.MOVE_PLAYER]: Schemas.Map({
    position: Schemas.Vector3,
    cameraTarget: Schemas.Optional(Schemas.Vector3),
  }),
  [ActionType.PLAY_DEFAULT_EMOTE]: Schemas.Map({
    emote: Schemas.String,
  }),
  [ActionType.PLAY_CUSTOM_EMOTE]: Schemas.Map({
    src: Schemas.String,
    loop: Schemas.Optional(Schemas.Boolean),
  }),
  [ActionType.OPEN_LINK]: Schemas.Map({
    url: Schemas.String,
  }),
  [ActionType.SHOW_TEXT]: Schemas.Map({
    text: Schemas.String,
    hideAfterSeconds: Schemas.Float,
    font: Schemas.EnumNumber(Font, Font.F_SANS_SERIF),
    fontSize: Schemas.Optional(Schemas.Float),
    textAlign: Schemas.EnumNumber(
      TextAlignMode,
      TextAlignMode.TAM_MIDDLE_CENTER,
    ),
  }),
  [ActionType.HIDE_TEXT]: Schemas.Map({}),
  [ActionType.START_DELAY]: Schemas.Map({
    actions: Schemas.Array(Schemas.String),
    timeout: Schemas.Float,
  }),
  [ActionType.STOP_DELAY]: Schemas.Map({
    action: Schemas.String,
  }),
  [ActionType.START_LOOP]: Schemas.Map({
    actions: Schemas.Array(Schemas.String),
    interval: Schemas.Float,
  }),
  [ActionType.STOP_LOOP]: Schemas.Map({
    action: Schemas.String,
  }),
}

export type ActionPayload<T extends ActionType = any> =
  T extends keyof typeof ActionSchemas
    ? (typeof ActionSchemas)[T] extends ISchema
      ? ReturnType<(typeof ActionSchemas)[T]['deserialize']>
      : {}
    : {}

export function getComponent<T>(componentName: string, engine: IEngine) {
  try {
    return engine.getComponent(
      componentName,
    ) as LastWriteWinElementSetComponentDefinition<T>
  } catch (error) {
    console.error(
      `Error using getComponent with componentName="${componentName}"`,
    )
    throw error
  }
}

export function getComponents(engine: IEngine) {
  return {
    Actions: getComponent<Actions>(ComponentName.ACTIONS, engine),
    States: getComponent<States>(ComponentName.STATES, engine),
    Counter: getComponent<Counter>(ComponentName.COUNTER, engine),
    Triggers: getComponent<Triggers>(ComponentName.TRIGGERS, engine),
  }
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

  initVideoPlayerComponents(engine)
}

function getVideoTexture({ material }: PBMaterial): VideoTexture | undefined {
  if (
    material?.$case === 'pbr' &&
    material.pbr.texture?.tex?.$case === 'videoTexture'
  ) {
    return material.pbr.texture.tex.videoTexture
  }

  return undefined
}

export function initVideoPlayerComponentMaterial(
  entity: Entity,
  material?: PBMaterial | null,
) {
  if (!material || !material.material || material.material.$case !== 'pbr') {
    return null
  }

  Material.setPbrMaterial(entity, {
    ...material.material.pbr,
    texture: Material.Texture.Video({
      videoPlayerEntity: entity,
    }),
  })
}

function initVideoPlayerComponents(engine: IEngine) {
  function replaceVideoTexture() {
    engine.removeSystem(replaceVideoTexture)
    for (const [entity, material] of engine.getEntitiesWith(
      Material,
      VideoPlayer,
    )) {
      const videoTexture = getVideoTexture(material)
      if (videoTexture?.videoPlayerEntity === engine.RootEntity) {
        initVideoPlayerComponentMaterial(entity, material)
      }
    }
  }
  engine.addSystem(replaceVideoTexture)
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
