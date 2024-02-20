import {
  engine,
  pointerEventsSystem,
  Animator,
  Transform,
  AudioSource,
  AvatarAttach,
  VisibilityComponent,
  GltfContainer,
  Material,
  VideoPlayer,
  UiTransform,
  UiText,
  UiBackground
} from '@dcl/sdk/ecs'
import { initAssetPacks } from './scene-entrypoint'

initAssetPacks(engine, pointerEventsSystem, {
  Animator,
  Transform,
  AudioSource,
  AvatarAttach,
  VisibilityComponent,
  GltfContainer,
  Material,
  VideoPlayer,
  UiTransform,
  UiText,
  UiBackground
})

export function main() {
  console.log('Scene ready')
}
