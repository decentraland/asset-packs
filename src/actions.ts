import {
  engine,
  Entity,
  Animator,
  Transform,
  TransformType,
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { Actions, States } from './components'
import {
  ActionPayload,
  ActionType,
  TriggerType,
  TweenType,
} from './definitions'
import { getDefaultValue, isValidState } from './states'
import { getActionEvents, getTriggerEvents } from './events'
import { getPayload } from './action-types'

const initedEntities = new Set<Entity>()
const initialTransform = new Map<Entity, TransformType>()

export function actionsSystem(_dt: number) {
  const entitiesWithActions = engine.getEntitiesWith(Actions)
  for (const [entity, actions] of entitiesWithActions) {
    if (initedEntities.has(entity)) {
      continue
    }

    // initialize actions for given entity
    const types = actions.value.reduce(
      (types, action) => types.add(action.type),
      new Set<String>(),
    )
    for (const type of types) {
      switch (type) {
        case ActionType.PLAY_ANIMATION: {
          initPlayAnimation(entity)
          break
        }
        case ActionType.START_TWEEN: {
          initTween(entity)
          break
        }
        default:
          break
      }
    }

    // bind actions
    const actionEvents = getActionEvents(entity)
    for (const action of actions.value) {
      actionEvents.on(action.name, () => {
        switch (action.type) {
          case ActionType.PLAY_ANIMATION: {
            handlePlayAnimation(
              entity,
              getPayload<ActionType.PLAY_ANIMATION>(action),
            )
            break
          }
          case ActionType.SET_STATE: {
            handleSetState(entity, getPayload<ActionType.SET_STATE>(action))
            break
          }
          case ActionType.START_TWEEN: {
            handleStartTween(entity, getPayload<ActionType.START_TWEEN>(action))
            break
          }
          default:
            break
        }
      })
    }

    initedEntities.add(entity)
  }
}

// PLAY_ANIMATION
function initPlayAnimation(entity: Entity) {
  Animator.create(entity, {
    states: [],
  })
  Animator.stopAllAnimations(entity)
}

function handlePlayAnimation(
  entity: Entity,
  payload: ActionPayload<ActionType.PLAY_ANIMATION>,
) {
  const clipName = payload.animation

  const animator = Animator.getMutable(entity)
  if (!animator.states.some(($) => $.name === clipName)) {
    animator.states = [
      ...animator.states,
      {
        name: clipName,
        clip: clipName,
      },
    ]
  }

  Animator.stopAllAnimations(entity)
  const clip = Animator.getClip(entity, clipName)
  clip.playing = true
  clip.loop = false
}

// SET_STATE
function handleSetState(
  entity: Entity,
  payload: ActionPayload<ActionType.SET_STATE>,
) {
  const states = States.getMutableOrNull(entity)

  if (states) {
    let nextState: string | undefined = payload.state
    nextState = isValidState(states, nextState)
      ? nextState
      : getDefaultValue(states)
    states.currentValue = nextState

    const triggerEvents = getTriggerEvents(entity)
    triggerEvents.emit(TriggerType.ON_STATE_CHANGE)
  }
}

// INIT_TWEEN
function initTween(entity: Entity) {
  initialTransform.set(entity, Transform.get(entity))
}

// START_TWEEN
function handleStartTween(
  entity: Entity,
  payload: ActionPayload<ActionType.START_TWEEN>,
) {
  if (payload) {
    const triggerEvents = getTriggerEvents(entity)
    const onTweenEnd = () => triggerEvents.emit(TriggerType.ON_TWEEN_END)

    switch (payload.type) {
      case TweenType.MOVE_ITEM: {
        handleMoveItem(entity, payload, onTweenEnd)
        break
      }
      case TweenType.ROTATE_ITEM: {
        handleRotateItem(entity, payload, onTweenEnd)
        break
      }
      case TweenType.SCALE_ITEM: {
        handleScaleItem(entity, payload, onTweenEnd)
        break
      }
      default: {
        throw new Error(`Unknown tween type: ${payload.type}`)
      }
    }
  }
}

// MOVE_ITEM
function handleMoveItem(
  entity: Entity,
  tween: ActionPayload['start_tween'],
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  const start = relative
    ? transform.position
    : (initialTransform.get(entity)?.position as Vector3)
  const end = Vector3.add(
    start,
    Vector3.create(tween.end.x, tween.end.y, tween.end.z),
  )

  utils.tweens.startTranslation(
    entity,
    start,
    end,
    duration,
    interpolationType,
    onTweenEnd,
  )
}

// ROTATE_ITEM
function handleRotateItem(
  entity: Entity,
  tween: ActionPayload['start_tween'],
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  const start = relative
    ? transform.rotation
    : (initialTransform.get(entity)?.rotation as Quaternion)
  const end = Quaternion.multiply(
    start,
    Quaternion.fromEulerDegrees(tween.end.x, tween.end.y, tween.end.z),
  )

  utils.tweens.startRotation(
    entity,
    start,
    end,
    duration,
    interpolationType,
    onTweenEnd,
  )
}

// SCALE_ITEM
function handleScaleItem(
  entity: Entity,
  tween: ActionPayload['start_tween'],
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  const start = relative
    ? transform.scale
    : (initialTransform.get(entity)?.scale as Vector3)
  const end = relative
    ? Vector3.add(start, Vector3.create(tween.end.x, tween.end.y, tween.end.z))
    : Vector3.create(tween.end.x, tween.end.y, tween.end.z)

  utils.tweens.startScaling(
    entity,
    start,
    end,
    duration,
    interpolationType,
    onTweenEnd,
  )
}
