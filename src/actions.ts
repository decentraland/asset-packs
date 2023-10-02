import { engine, Entity, Animator, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { Actions, States, Tweens } from './components'
import {
  ActionPayload,
  ActionType,
  TriggerType,
  Tween,
  TweensType,
} from './definitions'
import { getDefaultValue, isValidState } from './states'
import { getActionEvents, getTriggerEvents } from './events'
import { getPayload } from './action-types'

const initedEntities = new Set<Entity>()

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

// START_TWEEN
function handleStartTween(
  entity: Entity,
  payload: ActionPayload<ActionType.START_TWEEN>,
) {
  const tweenName = payload.tween
  const tweens = Tweens.getMutable(entity)
  const tween = tweens.value.find(($) => $.name === tweenName)

  if (tween) {
    const triggerEvents = getTriggerEvents(entity)
    const onTweenEnd = () => triggerEvents.emit(TriggerType.ON_TWEEN_END)

    switch (tween.type) {
      case TweensType.MOVE_ITEM: {
        handleMoveItem(entity, tween, onTweenEnd)
        break
      }
      case TweensType.ROTATE_ITEM: {
        handleRotateItem(entity, tween, onTweenEnd)
        break
      }
      case TweensType.SCALE_ITEM: {
        handleScaleItem(entity, tween, onTweenEnd)
        break
      }
      default: {
        throw new Error(`Unknown tween type: ${tween.type}`)
      }
    }
  }
}

// MOVE_ITEM
function handleMoveItem(entity: Entity, tween: Tween, onTweenEnd: () => void) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  let { end, start = Vector3.Zero() } = tween

  if (relative) {
    start = Vector3.add(start, transform.position)
    end = Vector3.add(end, transform.position)
  }

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
  tween: Tween,
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const {
    duration,
    interpolationType,
    relative,
    end,
    start = Vector3.Zero(),
  } = tween
  let startRotation = Quaternion.fromEulerDegrees(start.x, start.y, start.z)
  let endRotation = Quaternion.fromEulerDegrees(end.x, end.y, end.z)

  if (relative) {
    startRotation = Quaternion.add(startRotation, transform.rotation)
    endRotation = Quaternion.add(endRotation, transform.rotation)
  }

  utils.tweens.startRotation(
    entity,
    startRotation,
    endRotation,
    duration,
    interpolationType,
    onTweenEnd,
  )
}

// SCALE_ITEM
function handleScaleItem(entity: Entity, tween: Tween, onTweenEnd: () => void) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween!
  let { end, start = Vector3.Zero() } = tween

  if (relative) {
    start = Vector3.add(start, transform.scale)
    end = Vector3.add(end, transform.scale)
  }

  utils.tweens.startScaling(
    entity,
    start,
    end,
    duration,
    interpolationType,
    onTweenEnd,
  )
}
