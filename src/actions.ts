import {
  engine,
  Entity,
  Animator,
  Transform,
  AudioSource,
  VisibilityComponent,
  AvatarAttach,
  GltfContainer,
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { tweens } from '@dcl-sdk/utils/dist/tween'
import { Actions, States, Counter } from './components'
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
          case ActionType.STOP_ANIMATION: {
            handleStopAnimation(
              entity,
              getPayload<ActionType.STOP_ANIMATION>(action),
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
          case ActionType.SET_COUNTER: {
            handleSetCounter(entity, getPayload<ActionType.SET_COUNTER>(action))
            break
          }
          case ActionType.INCREMENT_COUNTER: {
            handleIncrementCounter(
              entity,
              getPayload<ActionType.INCREMENT_COUNTER>(action),
            )
            break
          }
          case ActionType.DECREASE_COUNTER: {
            handleDecreaseCounter(
              entity,
              getPayload<ActionType.DECREASE_COUNTER>(action),
            )
            break
          }
          case ActionType.PLAY_SOUND: {
            handlePlaySound(entity, getPayload<ActionType.PLAY_SOUND>(action))
            break
          }
          case ActionType.STOP_SOUND: {
            handleStopSound(entity, getPayload<ActionType.STOP_SOUND>(action))
            break
          }
          case ActionType.SET_VISIBILITY: {
            handleSetVisibility(
              entity,
              getPayload<ActionType.SET_VISIBILITY>(action),
            )
            break
          }
          case ActionType.ATTACH_TO_PLAYER: {
            handleAttachToPlayer(
              entity,
              getPayload<ActionType.ATTACH_TO_PLAYER>(action),
            )
            break
          }
          case ActionType.DETACH_FROM_PLAYER: {
            handleDetachFromPlayer(
              entity,
              getPayload<ActionType.DETACH_FROM_PLAYER>(action),
            )
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
  const { animation, loop } = payload

  const animator = Animator.getMutable(entity)
  if (!animator.states.some(($) => $.clip === animation)) {
    animator.states = [
      ...animator.states,
      {
        clip: animation,
      },
    ]
  }

  Animator.stopAllAnimations(entity)
  const clip = Animator.getClip(entity, animation)
  clip.playing = true
  clip.loop = loop ?? false
}

// STOP_ANIMATION
function handleStopAnimation(
  entity: Entity,
  _payload: ActionPayload<ActionType.STOP_ANIMATION>,
) {
  if (Animator.has(entity)) {
    Animator.stopAllAnimations(entity)
  }
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
  tween: ActionPayload<ActionType.START_TWEEN>,
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  const end = Vector3.create(tween.end.x, tween.end.y, tween.end.z)
  const endPosition = relative ? Vector3.add(transform.position, end) : end

  tweens.startTranslation(
    entity,
    transform.position,
    endPosition,
    duration,
    interpolationType,
    onTweenEnd,
  )
}

// ROTATE_ITEM
function handleRotateItem(
  entity: Entity,
  tween: ActionPayload<ActionType.START_TWEEN>,
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  const end = Quaternion.fromEulerDegrees(tween.end.x, tween.end.y, tween.end.z)
  const endRotation = relative
    ? Quaternion.multiply(transform.rotation, end)
    : end

  tweens.startRotation(
    entity,
    transform.rotation,
    endRotation,
    duration,
    interpolationType,
    onTweenEnd,
  )
}

// SCALE_ITEM
function handleScaleItem(
  entity: Entity,
  tween: ActionPayload<ActionType.START_TWEEN>,
  onTweenEnd: () => void,
) {
  const transform = Transform.get(entity)
  const { duration, interpolationType, relative } = tween
  const end = Vector3.create(tween.end.x, tween.end.y, tween.end.z)
  const endScale = relative ? Vector3.add(transform.scale, end) : end

  tweens.startScaling(
    entity,
    transform.scale,
    endScale,
    duration,
    interpolationType,
    onTweenEnd,
  )
}

// SET_COUNTER
function handleSetCounter(
  entity: Entity,
  payload: ActionPayload<ActionType.SET_COUNTER>,
) {
  const counter = Counter.getMutableOrNull(entity)

  if (counter) {
    counter.value = payload.counter

    const triggerEvents = getTriggerEvents(entity)
    triggerEvents.emit(TriggerType.ON_COUNTER_CHANGE)
  }
}

// INCREMENT_COUNTER
function handleIncrementCounter(
  entity: Entity,
  _payload: ActionPayload<ActionType.INCREMENT_COUNTER>,
) {
  const counter = Counter.getMutableOrNull(entity)

  if (counter) {
    counter.value += 1

    const triggerEvents = getTriggerEvents(entity)
    triggerEvents.emit(TriggerType.ON_COUNTER_CHANGE)
  }
}

// DECREASE_COUNTER
function handleDecreaseCounter(
  entity: Entity,
  _payload: ActionPayload<ActionType.INCREMENT_COUNTER>,
) {
  const counter = Counter.getMutableOrNull(entity)

  if (counter) {
    counter.value -= 1

    const triggerEvents = getTriggerEvents(entity)
    triggerEvents.emit(TriggerType.ON_COUNTER_CHANGE)
  }
}

// PLAY_SOUND
function handlePlaySound(
  entity: Entity,
  payload: ActionPayload<ActionType.PLAY_SOUND>,
) {
  const { src, loop, volume } = payload
  AudioSource.createOrReplace(entity, {
    audioClipUrl: src,
    loop,
    playing: true,
    volume: volume ?? 1,
  })
}

// STOP_SOUND
function handleStopSound(
  entity: Entity,
  _payload: ActionPayload<ActionType.STOP_SOUND>,
) {
  const audioSource = AudioSource.getMutableOrNull(entity)
  if (audioSource) {
    audioSource.playing = false
  }
}

// SET_VISIBILITY
function handleSetVisibility(
  entity: Entity,
  payload: ActionPayload<ActionType.SET_VISIBILITY>,
) {
  const { visible, physicsCollider } = payload
  VisibilityComponent.createOrReplace(entity, { visible })
  const gltf = GltfContainer.getMutableOrNull(entity)

  if (gltf && physicsCollider !== undefined) {
    gltf.invisibleMeshesCollisionMask = physicsCollider ? 2 : 0
  }
}

// ATTACH_TO_PLAYER
function handleAttachToPlayer(
  entity: Entity,
  payload: ActionPayload<ActionType.ATTACH_TO_PLAYER>,
) {
  const { anchorPointId } = payload
  AvatarAttach.createOrReplace(entity, { anchorPointId })
}

// DETACH_FROM_PLAYER
function handleDetachFromPlayer(
  entity: Entity,
  _payload: ActionPayload<ActionType.DETACH_FROM_PLAYER>,
) {
  if (AvatarAttach.has(entity)) {
    AvatarAttach.deleteFrom(entity)
  }
}
