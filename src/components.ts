import {
  Animator as defineAnimator,
  Transform as defineTransform,
  AudioSource as defineAudioSource,
  AvatarAttach as defineAvatarAttach,
  VisibilityComponent as defineVisibilityComponent,
  GltfContainer as defineGltfContainer,
  UiTransform as defineUiTransform,
  UiText as defineUiText,
  UiBackground as defineUiBackground,
  VideoPlayer as defineVideoPlayer,
  Material as defineMaterial,
  MeshRenderer as defineMeshRenderer,
  Billboard as defineBillboard,
  Name as defineName,
  Tween as defineTween,
  TweenSequence as defineTweenSequence,
  PointerEvents as definePointerEvents,
  NetworkEntity as defineNetworkEntity,
  SyncComponents as defineSyncComponents
} from '@dcl/ecs/dist/components'
import { IEngine } from '@dcl/ecs'
import { EngineComponents } from './definitions'

export function getExplorerComponents(engine: IEngine): EngineComponents {
  return {
    Animator: defineAnimator(engine),
    Transform: defineTransform(engine),
    AudioSource: defineAudioSource(engine),
    AvatarAttach: defineAvatarAttach(engine),
    VisibilityComponent: defineVisibilityComponent(engine),
    GltfContainer: defineGltfContainer(engine),
    UiTransform: defineUiTransform(engine),
    UiText: defineUiText(engine),
    UiBackground: defineUiBackground(engine),
    VideoPlayer: defineVideoPlayer(engine),
    Material: defineMaterial(engine),
    MeshRenderer: defineMeshRenderer(engine),
    Billboard: defineBillboard(engine),
    Name: defineName(engine),
    Tween: defineTween(engine),
    TweenSequence: defineTweenSequence(engine),
    PointerEvents: definePointerEvents(engine),
    NetworkEntity: defineNetworkEntity(engine),
    SyncComponents: defineSyncComponents(engine)
  }
}
