import {
  IEngine,
  Entity,
  AnimatorComponentDefinitionExtended,
  TransformComponentExtended,
  LastWriteWinElementSetComponentDefinition,
  PBAudioSource,
  PBAvatarAttach,
  PBVisibilityComponent,
  PBGltfContainer,
  VideoPlayer,
  Material,
  AudioStream,
  UiText,
  UiTransform,
  YGUnit,
  TextAlignMode,
  Font,
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { tweens } from '@dcl-sdk/utils/dist/tween'
import { getActiveVideoStreams } from '~system/CommsApi'
import {
  ActionPayload,
  ActionType,
  TriggerType,
  TweenType,
  getComponents,
  initVideoPlayerComponentMaterial,
} from './definitions'
import { getDefaultValue, isValidState } from './states'
import { getActionEvents, getTriggerEvents } from './events'
import { startInterval, startTimeout, stopInterval, stopTimeout } from './timer'
import { getPayload } from './action-types'
import { requestTeleport } from '~system/UserActionModule'
import {
  movePlayerTo,
  triggerEmote,
  triggerSceneEmote,
  openExternalUrl,
} from '~system/RestrictedActions'

const initedEntities = new Set<Entity>()

export function createActionsSystem(
  engine: IEngine,
  components: {
    Animator: AnimatorComponentDefinitionExtended
    Transform: TransformComponentExtended
    AudioSource: LastWriteWinElementSetComponentDefinition<PBAudioSource>
    AvatarAttach: LastWriteWinElementSetComponentDefinition<PBAvatarAttach>
    VisibilityComponent: LastWriteWinElementSetComponentDefinition<PBVisibilityComponent>
    GltfContainer: LastWriteWinElementSetComponentDefinition<PBGltfContainer>
  },
) {
  const {
    Animator,
    Transform,
    AudioSource,
    AvatarAttach,
    VisibilityComponent,
    GltfContainer,
  } = components
  const { Actions, States, Counter } = getComponents(engine)

  return function actionsSystem(_dt: number) {
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
              handleStartTween(
                entity,
                getPayload<ActionType.START_TWEEN>(action),
              )
              break
            }
            case ActionType.SET_COUNTER: {
              handleSetCounter(
                entity,
                getPayload<ActionType.SET_COUNTER>(action),
              )
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
            case ActionType.PLAY_VIDEO_STREAM: {
              handlePlayVideo(
                entity,
                getPayload<ActionType.PLAY_VIDEO_STREAM>(action),
              )
              break
            }
            case ActionType.STOP_VIDEO_STREAM: {
              handleStopVideo(
                entity,
                getPayload<ActionType.STOP_VIDEO_STREAM>(action),
              )
              break
            }
            case ActionType.PLAY_AUDIO_STREAM: {
              handlePlayAudioStream(
                entity,
                getPayload<ActionType.PLAY_AUDIO_STREAM>(action),
              )
              break
            }
            case ActionType.STOP_AUDIO_STREAM: {
              handleStopAudioStream(
                entity,
                getPayload<ActionType.STOP_AUDIO_STREAM>(action),
              )
              break
            }
            case ActionType.TELEPORT_PLAYER: {
              handleTeleportPlayer(
                entity,
                getPayload<ActionType.TELEPORT_PLAYER>(action),
              )
              break
            }
            case ActionType.MOVE_PLAYER: {
              handleMovePlayer(
                entity,
                getPayload<ActionType.MOVE_PLAYER>(action),
              )
              break
            }
            case ActionType.PLAY_DEFAULT_EMOTE: {
              handlePlayDefaultEmote(
                entity,
                getPayload<ActionType.PLAY_DEFAULT_EMOTE>(action),
              )
              break
            }
            case ActionType.PLAY_CUSTOM_EMOTE: {
              handlePlayCustomEmote(
                entity,
                getPayload<ActionType.PLAY_CUSTOM_EMOTE>(action),
              )
              break
            }
            case ActionType.OPEN_LINK: {
              handleOpenLink(entity, getPayload<ActionType.OPEN_LINK>(action))
              break
            }
            case ActionType.SHOW_TEXT: {
              handleShowText(entity, getPayload<ActionType.SHOW_TEXT>(action))
              break
            }
            case ActionType.HIDE_TEXT: {
              handleHideText(entity, getPayload<ActionType.HIDE_TEXT>(action))
              break
            }
            case ActionType.START_DELAY: {
              handleStartDelay(
                entity,
                getPayload<ActionType.START_DELAY>(action),
              )
              break
            }
            case ActionType.STOP_DELAY: {
              handleStopDelay(entity, getPayload<ActionType.STOP_DELAY>(action))
              break
            }
            case ActionType.START_LOOP: {
              handleStartLoop(entity, getPayload<ActionType.START_LOOP>(action))
              break
            }
            case ActionType.STOP_LOOP: {
              handleStopLoop(entity, getPayload<ActionType.STOP_LOOP>(action))
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
    const end = Quaternion.fromEulerDegrees(
      tween.end.x,
      tween.end.y,
      tween.end.z,
    )
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

  // TELEPORT PLAYER
  function handleTeleportPlayer(
    _entity: Entity,
    payload: ActionPayload<ActionType.TELEPORT_PLAYER>,
  ) {
    const { x, y } = payload
    requestTeleport({
      destination: `${x},${y}`,
    })
  }

  // MOVE PLAYER
  function handleMovePlayer(
    _entity: Entity,
    payload: ActionPayload<ActionType.MOVE_PLAYER>,
  ) {
    const options = {
      newRelativePosition: payload.position,
      cameraTarget: payload.cameraTarget,
    }
    console.log('movePlayerTo', options)
    void movePlayerTo(options)
  }

  // PLAY DEFAULT EMOTE
  function handlePlayDefaultEmote(
    _entity: Entity,
    payload: ActionPayload<ActionType.PLAY_DEFAULT_EMOTE>,
  ) {
    const { emote } = payload
    void triggerEmote({ predefinedEmote: emote })
  }

  // PLAY CUSTOM EMOTE
  function handlePlayCustomEmote(
    _entity: Entity,
    payload: ActionPayload<ActionType.PLAY_CUSTOM_EMOTE>,
  ) {
    const { src, loop } = payload
    void triggerSceneEmote({ src, loop })
  }

  // OPEN LINK
  function handleOpenLink(
    _entity: Entity,
    payload: ActionPayload<ActionType.OPEN_LINK>,
  ) {
    const { url } = payload
    void openExternalUrl({ url })
  }

  async function getVideoSrc({
    src,
    dclCast,
  }: ActionPayload<ActionType.PLAY_VIDEO_STREAM>) {
    if (dclCast) {
      const { streams } = await getActiveVideoStreams({})
      return streams.length > 0 ? streams[0].trackSid : ''
    }
    return src ?? ''
  }

  // PLAY_VIDEO
  function handlePlayVideo(
    entity: Entity,
    payload: ActionPayload<ActionType.PLAY_VIDEO_STREAM>,
  ) {
    // Get the video src from a promise (Video File/Video Stream/DCL Cast)
    getVideoSrc(payload).then((src) => {
      if (!src) return

      const videoSource = VideoPlayer.getMutableOrNull(entity)

      if (videoSource) {
        videoSource.src = src
        videoSource.volume = payload.volume ?? 1
        videoSource.loop = payload.loop ?? false
        videoSource.playing = true
      } else {
        VideoPlayer.createOrReplace(entity, {
          src,
          volume: payload.volume ?? 1,
          loop: payload.loop ?? false,
          playing: true,
        })

        // Init video player material when the entity doesn't have a VideoPlayer component defined
        initVideoPlayerComponentMaterial(entity, Material.getOrNull(entity))
      }
    })
  }

  // STOP_VIDEO
  function handleStopVideo(
    entity: Entity,
    _payload: ActionPayload<ActionType.STOP_VIDEO_STREAM>,
  ) {
    const videoSource = VideoPlayer.getMutableOrNull(entity)
    if (videoSource) {
      videoSource.playing = false
    }
  }

  // PLAY_AUDIO_STREAM
  function handlePlayAudioStream(
    entity: Entity,
    payload: ActionPayload<ActionType.PLAY_AUDIO_STREAM>,
  ) {
    const { url, volume } = payload
    AudioStream.createOrReplace(entity, {
      url,
      playing: true,
      volume: volume ?? 1,
    })
  }

  // STOP_AUDIO_STREAM
  function handleStopAudioStream(
    entity: Entity,
    _payload: ActionPayload<ActionType.STOP_AUDIO_STREAM>,
  ) {
    const audioSource = AudioStream.getMutableOrNull(entity)
    if (audioSource) {
      audioSource.playing = false
    }
  }

  function getUITransform(entiy: Entity) {
    let uiTransformComponent = UiTransform.getMutableOrNull(entiy)
    if (!uiTransformComponent) {
      uiTransformComponent = UiTransform.create(entiy)
      uiTransformComponent.heightUnit = YGUnit.YGU_PERCENT
      uiTransformComponent.widthUnit = YGUnit.YGU_PERCENT
      uiTransformComponent.height = 100
      uiTransformComponent.width = 100
    }

    return uiTransformComponent
  }

  // SHOW_TEXT
  function handleShowText(
    entity: Entity,
    payload: ActionPayload<ActionType.SHOW_TEXT>,
  ) {
    const { text, hideAfterSeconds, font, fontSize, textAlign } = payload
    const uiTransformComponent = getUITransform(entity)
    if (uiTransformComponent) {
      UiText.createOrReplace(entity, {
        value: text,
        font: font as unknown as Font,
        fontSize,
        textAlign: textAlign as unknown as TextAlignMode,
      })
      startTimeout(entity, ActionType.SHOW_TEXT, hideAfterSeconds, () =>
        handleHideText(entity, {}),
      )
    }
  }

  // HIDE_TEXT
  function handleHideText(
    entity: Entity,
    _payload: ActionPayload<ActionType.HIDE_TEXT>,
  ) {
    const uiTextComponent = UiText.getOrNull(entity)
    if (uiTextComponent) {
      UiText.deleteFrom(entity)
    }
  }

  function findActionByName(entity: Entity, name: string) {
    const actions = Actions.getOrNull(entity)
    return actions?.value.find(($) => $.name === name)
  }

  // START_DELAY
  function handleStartDelay(
    entity: Entity,
    payload: ActionPayload<ActionType.START_DELAY>,
  ) {
    const { actions, timeout } = payload
    for (const actionName of actions) {
      const action = findActionByName(entity, actionName)
      if (action) {
        startTimeout(entity, actionName, timeout, () => {
          const actionEvents = getActionEvents(entity)
          actionEvents.emit(action.name, getPayload(action))
        })
      }
    }
  }

  // STOP_DELAY
  function handleStopDelay(
    entity: Entity,
    payload: ActionPayload<ActionType.STOP_DELAY>,
  ) {
    const { action } = payload
    stopTimeout(entity, action)
  }

  // START_LOOP
  function handleStartLoop(
    entity: Entity,
    payload: ActionPayload<ActionType.START_LOOP>,
  ) {
    const { actions, interval } = payload
    for (const actionName of actions) {
      const action = findActionByName(entity, actionName)
      if (action) {
        startInterval(entity, actionName, interval, () => {
          const actionEvents = getActionEvents(entity)
          actionEvents.emit(action.name, getPayload(action))
        })
      }
    }
  }

  // STOP_LOOP
  function handleStopLoop(
    entity: Entity,
    payload: ActionPayload<ActionType.STOP_LOOP>,
  ) {
    const { action } = payload
    stopInterval(entity, action)
  }
}
