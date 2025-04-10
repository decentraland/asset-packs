import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import { getComponents } from '../../definitions'
import { getExplorerComponents } from '../../components'
import { nextTickFunctions, state } from '../index'
import { DEFAULT_VOLUME } from '.'


// Types
interface VideoPlayerControls {
  play(): void
  pause(): void
  restart(): void
  previous(): void
  next(): void
  setVolume(volume: number): void
  setSource(url: string): void
  setLoop(loop: boolean): void
}

export function getAdminToolkitVideoControl(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  return adminToolkitEntities.length > 0
    ? adminToolkitEntities[0][1].videoControl
    : null
}

export function getVideoPlayers(engine: IEngine) {
  const adminToolkitVideoControl = getAdminToolkitVideoControl(engine)

  if (
    !adminToolkitVideoControl ||
    !adminToolkitVideoControl.videoPlayers ||
    adminToolkitVideoControl.videoPlayers.length === 0
  )
    return []

  return Array.from(adminToolkitVideoControl.videoPlayers)
}

function checkVideoPlayerSound(entity: Entity, engine: IEngine) {
  const videoControl = getAdminToolkitVideoControl(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  if (videoControl?.disableVideoPlayersSound) {
    const video = VideoPlayer.get(entity)
    if (video.volume) {
      VideoPlayer.getMutable(entity).volume = 0
    }
  }
}

export function createVideoPlayerControls(
  entity: Entity,
  engine: IEngine
): VideoPlayerControls {
  const videoControl = getAdminToolkitVideoControl(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  checkVideoPlayerSound(entity, engine)

  return {
    play: () => {
      VideoPlayer.getMutable(entity).playing = true
    },
    pause: () => VideoPlayer.getMutable(entity).playing = false,
    restart: () => {
      VideoPlayer.getMutable(entity).playing = false
      VideoPlayer.getMutable(entity).position = 0
      nextTickFunctions.push(() => {
        const video = VideoPlayer.getMutable(entity)
        video.playing = true
      })
    },
    previous: () => {
      console.log('TODO: Previous Track clicked')
    },
    next: () => {
      console.log('TODO: Next Track clicked')
    },
    setVolume: (volumeOrStep) => {
      // Don't allow volume changes if sound is disabled
      if (videoControl?.disableVideoPlayersSound) {
        return
      }
      const video = VideoPlayer.getMutable(entity)
      if (volumeOrStep === 0) {
        video.volume = 0
      } else {
        const steps = Math.round((video.volume ?? DEFAULT_VOLUME) * 10)
        const newSteps = Math.max(0, Math.min(10, steps + (volumeOrStep as number) * 10))
        video.volume = newSteps / 10
      }
    },
    setSource: (url) => {
      VideoPlayer.getMutable(entity).src = url
      nextTickFunctions.push(() => {
        VideoPlayer.getMutable(entity).playing = true
      })
    },
    setLoop(loop) {
      VideoPlayer.getMutable(entity).loop = loop
    }
  }
}

export function useSelectedVideoPlayer(
  engine: IEngine
): [Entity, DeepReadonlyObject<PBVideoPlayer>] | null {
  const { VideoPlayer } = getExplorerComponents(engine)
  const videoPlayers = getVideoPlayers(engine)

  if (videoPlayers.length === 0) return null

  const entity = videoPlayers[state.videoControl.selectedVideoPlayer ?? 0].entity as Entity
  const videoPlayer = VideoPlayer.getOrNull(entity)
  return [entity, videoPlayer!]
}
