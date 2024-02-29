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
  Material as defineMaterial
} from '@dcl/ecs/dist/components'
import { IEngine } from '@dcl/sdk/ecs'

export function getExplorerComponents(engine: IEngine) {
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
    Material: defineMaterial(engine)
  }
}
