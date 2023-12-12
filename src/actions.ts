import {
  IEngine,
  Entity,
  VideoPlayer,
  Material,
  AudioStream,
  UiText,
  YGUnit,
  TextAlignMode,
  Font,
  YGPositionType,
  PointerFilterMode,
  pointerEventsSystem,
  InputAction,
  MeshCollider,
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { tweens } from '@dcl-sdk/utils/dist/tween'
import { requestTeleport } from '~system/UserActionModule'
import {
  movePlayerTo,
  triggerEmote,
  triggerSceneEmote,
  openExternalUrl,
} from '~system/RestrictedActions'
import { getActiveVideoStreams } from '~system/CommsApi'
import {
  ActionPayload,
  ActionType,
  EngineComponents,
  ScreenAlignMode,
  TriggerType,
  TweenType,
  clone,
  getComponents,
  initVideoPlayerComponentMaterial,
} from './definitions'
import { getDefaultValue, isValidState } from './states'
import { getActionEvents, getTriggerEvents } from './events'
import {
  startInterval,
  startTimeout,
  stopAllIntervals,
  stopAllTimeouts,
  stopInterval,
  stopTimeout,
} from './timer'
import { getPayload } from './action-types'
import {
  getUIBackground,
  getUIText,
  getUITransform,
  mapAlignToScreenAlign,
} from './ui'
import { initTriggers } from './triggers'

const initedEntities = new Set<Entity>()
const uiStacks = new Map<string, Entity>()
const lastUiEntityClicked = new Map<Entity, Entity>()

let internalInitActions: ((entity: Entity) => void) | null = null

export function initActions(entity: Entity) {
  if (internalInitActions) {
    return internalInitActions(entity)
  }
  throw new Error(
    `Cannot call initActions while actionsSystem has not been created`,
  )
}

export function createActionsSystem(
  engine: IEngine,
  components: EngineComponents,
) {
  const {
    Animator,
    Transform,
    AudioSource,
    AvatarAttach,
    VisibilityComponent,
    GltfContainer,
  } = components
  const { Actions, States, Counter, Triggers } = getComponents(engine)

  // save internal reference to init funcion
  internalInitActions = initActions

  return function actionsSystem(_dt: number) {
    const entitiesWithActions = engine.getEntitiesWith(Actions)

    for (const [entity] of entitiesWithActions) {
      initActions(entity)
    }
  }

  function initActions(entity: Entity) {
    if (!Actions.has(entity) || initedEntities.has(entity)) {
      return
    }

    // get actions data
    const actions = Actions.get(entity)

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
            handleMovePlayer(entity, getPayload<ActionType.MOVE_PLAYER>(action))
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
            handleStartDelay(entity, getPayload<ActionType.START_DELAY>(action))
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
          case ActionType.CLONE_ENTITY: {
            handleCloneEntity(
              entity,
              getPayload<ActionType.CLONE_ENTITY>(action),
            )
            break
          }
          case ActionType.REMOVE_ENTITY: {
            handleRemoveEntity(
              entity,
              getPayload<ActionType.REMOVE_ENTITY>(action),
            )
            break
          }
          case ActionType.SHOW_IMAGE: {
            handleShowImage(entity, getPayload<ActionType.SHOW_IMAGE>(action))
            break
          }
          case ActionType.HIDE_IMAGE: {
            handleHideImage(entity, getPayload<ActionType.HIDE_IMAGE>(action))
            break
          }
          default:
            break
        }
      })
    }

    initedEntities.add(entity)
  }

  // PLAY_ANIMATION
  function initPlayAnimation(entity: Entity) {
    if (!Animator.has(entity)) {
      Animator.create(entity, {
        states: [],
      })
      Animator.stopAllAnimations(entity)
    }
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
    const { visible, collider } = payload
    VisibilityComponent.createOrReplace(entity, { visible })
    const gltf = GltfContainer.getMutableOrNull(entity)
    const meshCollider = MeshCollider.getMutableOrNull(entity)

    if (collider !== undefined) {
      if (gltf) {
        gltf.invisibleMeshesCollisionMask = collider
      } else if (meshCollider) {
        meshCollider.collisionMask = collider
      }
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
    const videoSource = VideoPlayer.getMutableOrNull(entity)

    if (videoSource && videoSource.src) {
      videoSource.playing = true
    } else {
      // Get the video src from a promise (Video File/Video Stream/DCL Cast)
      getVideoSrc(payload).then((src) => {
        if (!src) return

        VideoPlayer.createOrReplace(entity, {
          src,
          volume: payload.volume ?? 1,
          loop: payload.loop ?? false,
          playing: true,
        })

        // Init video player material when the entity doesn't have a VideoPlayer component defined
        initVideoPlayerComponentMaterial(
          entity,
          components,
          Material.getOrNull(entity),
        )
      })
    }
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
      startTimeout(entity, ActionType.HIDE_TEXT, hideAfterSeconds, () =>
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

  // CLONE_ENTITY
  function handleCloneEntity(
    entity: Entity,
    payload: ActionPayload<ActionType.CLONE_ENTITY>,
  ) {
    const { position } = payload

    // clone entity
    const cloned = clone(entity, engine, Triggers)

    // initialize
    initActions(cloned)
    initTriggers(cloned)

    const transform = Transform.getOrCreateMutable(cloned)
    transform.position = position

    const triggerEvents = getTriggerEvents(cloned)
    triggerEvents.emit(TriggerType.ON_CLONE)
  }

  // REMOVE_ENTITY
  function handleRemoveEntity(
    entity: Entity,
    _payload: ActionPayload<ActionType.REMOVE_ENTITY>,
  ) {
    // Remove all timers before remove the entity
    stopAllTimeouts(entity)
    stopAllIntervals(entity)
    engine.removeEntity(entity)
  }

  function getUiStack(align: ScreenAlignMode) {
    const key = `${align.alignItems},${align.justifyContent}`

    if (!uiStacks.has(key)) {
      uiStacks.set(key, engine.addEntity())
    }

    return uiStacks.get(key)!
  }

  // SHOW_IMAGE
  function handleShowImage(
    entity: Entity,
    payload: ActionPayload<ActionType.SHOW_IMAGE>,
  ) {
    const { src, text, hideAfterSeconds, fontSize, align, height, width } =
      payload

    // Get/Create a UI transform for the root entity
    getUITransform(engine.RootEntity)

    // Get a UI Stack entity
    const screenAlign = mapAlignToScreenAlign(align)
    const uiStack = getUiStack(screenAlign)

    // TODO: Fix items wrapping
    // Get/Create a UI Transform for the UI stack
    const uiStackTransformComponent = getUITransform(uiStack)
    uiStackTransformComponent.alignItems = screenAlign.alignItems
    uiStackTransformComponent.justifyContent = screenAlign.justifyContent
    uiStackTransformComponent.positionType = YGPositionType.YGPT_ABSOLUTE

    // Create a UI entity and a Transform component for the image
    const imageEntity = engine.addEntity()
    const imageTransformComponent = getUITransform(
      imageEntity,
      width,
      height,
      YGUnit.YGU_POINT,
    )
    imageTransformComponent.parent = uiStack
    imageTransformComponent.pointerFilter = PointerFilterMode.PFM_BLOCK

    // Create Background Component
    getUIBackground(imageEntity, src)

    if (text) {
      // Create Text Component
      // TODO: Fix text wrapping and scrolling
      getUIText(imageEntity, text, fontSize, width)
    }

    pointerEventsSystem.onPointerDown(
      {
        entity: imageEntity,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Click',
        },
      },
      () => {
        lastUiEntityClicked.set(entity, imageEntity)
        const triggerEvents = getTriggerEvents(entity)
        triggerEvents.emit(TriggerType.ON_CLICK_IMAGE)
      },
    )

    if (hideAfterSeconds) {
      startTimeout(entity, ActionType.HIDE_IMAGE, hideAfterSeconds, () =>
        handleHideImage(entity, { imageEntity: imageEntity }),
      )
    }
  }

  // HIDE_IMAGE
  function handleHideImage(
    entity: Entity,
    payload: ActionPayload<ActionType.HIDE_IMAGE>,
  ) {
    const { imageEntity } = payload

    if (imageEntity) {
      engine.removeEntity(imageEntity as Entity)
    } else {
      const clickedImage = lastUiEntityClicked.get(entity)
      if (clickedImage) {
        engine.removeEntity(clickedImage)
        lastUiEntityClicked.delete(entity)
      }
    }
  }
}
