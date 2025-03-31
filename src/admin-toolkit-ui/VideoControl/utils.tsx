import { Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity, Input, Dropdown } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { getComponents } from '../../definitions'
import { getExplorerComponents } from '../../components'
import { getScaleUIFactor } from '../../ui'
import { nextTickFunctions, state } from '../index'
import { Button } from '../Button'
import { CONTENT_URL } from '../constants'
import { State } from '../types'
import { Header } from '../Header'
import { DEFAULT_VOLUME } from '.'


// Types
interface VideoPlayerControls {
  play: () => void
  pause: () => void
  restart: () => void
  previous: () => void
  next: () => void
  setVolume: (volume: number) => void
  setSource: (url: string) => void
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

export function createVideoPlayerControls(
  engine: IEngine,
  state: State,
): VideoPlayerControls {
  const videoControl = getAdminToolkitVideoControl(engine)

  return {
    play: () => updateVideoPlayerProps(engine, state, 'playing', true),
    pause: () => updateVideoPlayerProps(engine, state, 'playing', false),
    restart: () => {
      updateVideoPlayerProps(engine, state, 'playing', false)
      nextTickFunctions.push(() => {
        updateVideoPlayerProps(engine, state, 'position', -1)
      })
      nextTickFunctions.push(() => {
        updateVideoPlayerProps(engine, state, 'playing', true)
      })
      nextTickFunctions.push(() => {
        updateVideoPlayerProps(engine, state, 'position', undefined)
      })
    },
    previous: () => {
      console.log('TODO: Previous Track clicked')
    },
    next: () => {
      console.log('TODO: Next Track clicked')
    },
    setVolume: (volume) => {
      // Don't allow volume changes if sound is disabled
      if (videoControl?.disableVideoPlayersSound) {
        return
      }
      updateVideoPlayerProps(engine, state, 'volume', volume)
    },
    setSource: (url) => updateVideoPlayerProps(engine, state, 'src', url),
  }
}

export function updateVideoPlayerProps<K extends keyof PBVideoPlayer>(
  engine: IEngine,
  state: State,
  property: K,
  value: PBVideoPlayer[K],
) {
  const { VideoPlayer } = getExplorerComponents(engine)
  const videoControl = getAdminToolkitVideoControl(engine)
  const players = getVideoPlayers(engine)

  // If sound is disabled and we're updating the 'playing' property to true,
  // we need to ensure volume is 0
  if (
    property === 'playing' &&
    value === true &&
    videoControl?.disableVideoPlayersSound
  ) {
    players.forEach((player) => {
      const videoSource = VideoPlayer.getMutableOrNull(player.entity as Entity)
      if (!videoSource) return
      updateVideoSourceProperty(videoSource, 'volume', 0)
      updateVideoPlayerControlState(
        engine,
        state,
        player.entity as Entity,
        'volume',
        0,
      )
    })
  }

  // Apply to selected player only
  const selectedPlayerEntity = players[
    state.videoControl.selectedVideoPlayer ?? 0
  ].entity as Entity
  const selectedPlayer = VideoPlayer.getMutableOrNull(selectedPlayerEntity)
  if (!selectedPlayer) return

  updateVideoSourceProperty(selectedPlayer, property, value)

  updateVideoPlayerControlState(
    engine,
    state,
    selectedPlayerEntity,
    property,
    value,
  )
}

// Helper function to update a video source property
export function updateVideoSourceProperty<K extends keyof PBVideoPlayer>(
  videoSource: PBVideoPlayer,
  property: K,
  value: PBVideoPlayer[K],
) {
  if (property === 'volume') {
    if (!value) {
      videoSource.volume = 0
      return
    }

    const steps = Math.round((videoSource.volume ?? DEFAULT_VOLUME) * 10)
    const newSteps = Math.max(0, Math.min(10, steps + (value as number) * 10))
    videoSource.volume = newSteps / 10
  } else {
    videoSource[property] = value
  }
}

export function updateVideoPlayerControlState<K extends keyof PBVideoPlayer>(
  engine: IEngine,
  state: State,
  selectedPlayerEntity: Entity,
  property: K,
  value: PBVideoPlayer[K],
) {
  const { VideoControlState } = getComponents(engine)
  const videoControlState = VideoControlState.getMutable(
    state.adminToolkitUiEntity,
  )
  const videoPlayerControlState = videoControlState.videoPlayers?.find(
    (player) => (player.entity as Entity) === selectedPlayerEntity,
  )
  if (!!videoPlayerControlState) {
    updateVideoSourceProperty(videoPlayerControlState, property, value)
  }
}


export function useSelectedVideoPlayer(engine: IEngine, state: State) {
  const { VideoPlayer } = getExplorerComponents(engine)
  const videoPlayers = getVideoPlayers(engine)

  if (videoPlayers.length === 0) return null

  return VideoPlayer.getOrNull(
    videoPlayers[state.videoControl.selectedVideoPlayer ?? 0].entity as Entity,
  )
}
