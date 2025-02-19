import { Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity, Input, Dropdown } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { getComponents } from '../definitions'
import { getExplorerComponents } from '../components'
import { Button } from './Button'
import { CONTENT_URL } from './constants'
import { State } from './types'

// Constants
const ICONS = {
  VIDEO_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control.png`,
  PREVIOUS_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-previous-button.png`,
  FORWARD_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-forward-button.png`,
  PLAY_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-play-button.png`,
  VOLUME_MINUS_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-volume-minus-button.png`,
  VOLUME_PLUS_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-volume-plus-button.png`,
} as const

const UI_STYLES = {
  BUTTON_TRANSFORM: {
    margin: '0 16px 0 0',
    minWidth: 69,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0px 0px 0px 0px',
  } as const,
  ICON_TRANSFORM: {
    width: 35,
    height: 35,
  } as const,
} as const

const DROPDOWN_BACKGROUND = `${CONTENT_URL}/admin_toolkit/backgrounds/dropdown-background.png`

const VOLUME_STEP = 0.1
const MAX_VOLUME = 1
const DEFAULT_VOLUME = 1

const COLORS = {
  WHITE: Color4.White(),
  GRAY: Color4.create(160 / 255, 155 / 255, 168 / 255, 1),
} as const

const VOLUME_STYLES = {
  CONTAINER: {
    flexDirection: 'column',
  } as const,
  HEADER: {
    margin: '0 0 10px 0',
  } as const,
  CONTROLS: {
    flexDirection: 'row',
  } as const,
} as const

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

function getAdminToolkitVideoControl(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  return adminToolkitEntities.length > 0
    ? adminToolkitEntities[0][1].videoControl
    : null
}

function getVideoPlayers(engine: IEngine) {
  const adminToolkitVideoControl = getAdminToolkitVideoControl(engine)

  if (
    !adminToolkitVideoControl ||
    !adminToolkitVideoControl.videoPlayers ||
    adminToolkitVideoControl.videoPlayers.length === 0
  )
    return []

  return Array.from(adminToolkitVideoControl.videoPlayers)
}

// Helper functions
function createVideoPlayerControls(
  engine: IEngine,
  state: State,
): VideoPlayerControls {
  const videoControl = getAdminToolkitVideoControl(engine)

  return {
    play: () => updateVideoPlayerProps(engine, state, 'playing', true),
    pause: () => updateVideoPlayerProps(engine, state, 'playing', false),
    restart: () => {
      updateVideoPlayerProps(engine, state, 'playing', false)
      updateVideoPlayerProps(engine, state, 'position', -1)
      updateVideoPlayerProps(engine, state, 'playing', true)
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

function updateVideoPlayerProps<K extends keyof PBVideoPlayer>(
  engine: IEngine,
  state: State,
  property: K,
  value: NonNullable<PBVideoPlayer[K]>,
) {
  const { VideoPlayer } = getExplorerComponents(engine)
  const videoControl = getAdminToolkitVideoControl(engine)
  const linkAllVideoPlayers =
    state.videoControl.linkAllVideoPlayers ?? videoControl?.linkAllVideoPlayers
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
      if (videoSource) {
        videoSource.volume = 0
      }
    })
  }

  if (linkAllVideoPlayers) {
    // Apply to all players
    players.forEach((player) => {
      const videoSource = VideoPlayer.getMutableOrNull(player.entity as Entity)
      if (!videoSource) return
      updateVideoSourceProperty(videoSource, property, value)
    })
  } else {
    // Apply to selected player only
    const selectedPlayer = VideoPlayer.getMutableOrNull(
      players[state.videoControl.selectedVideoPlayer ?? 0].entity as Entity,
    )
    if (!selectedPlayer) return

    updateVideoSourceProperty(selectedPlayer, property, value)
  }
}

// Helper function to update a video source property
function updateVideoSourceProperty<K extends keyof PBVideoPlayer>(
  videoSource: PBVideoPlayer,
  property: K,
  value: NonNullable<PBVideoPlayer[K]>,
) {
  if (property === 'volume') {
    if (value === 0) {
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

// Components
function VideoPlayerSelector({
  engine,
  state,
}: {
  engine: IEngine
  state: State
}) {
  const videoPlayers = getVideoPlayers(engine)

  if (videoPlayers.length <= 1) return null

  if (videoPlayers.length > 4) {
    return (
      <UiEntity uiTransform={{ flexDirection: 'row', margin: { bottom: 16 } }}>
        <Dropdown
          options={videoPlayers.map((player) => player.customName)}
          selectedIndex={state.videoControl.selectedVideoPlayer ?? 0}
          onChange={(idx) => (state.videoControl.selectedVideoPlayer = idx)}
          textAlign="middle-left"
          uiTransform={{ margin: { right: 8 }, minWidth: 150 }}
          uiBackground={{ color: Color4.White() }}
        />
        <Button
          id="video_control_link_all"
          value="<b>Link All</b>"
          variant="text"
          color={Color4.White()}
          onMouseDown={() => {
            state.videoControl.linkAllVideoPlayers = true
            state.videoControl.selectedVideoPlayer = undefined
          }}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
        />
      </UiEntity>
    )
  }

  // For 4 or fewer players, show numbered buttons
  return (
    <UiEntity uiTransform={{ flexDirection: 'row', margin: { bottom: 16 } }}>
      {videoPlayers.map((player, idx) => (
        <Button
          id={`video_control_player_${idx}`}
          key={player.entity}
          value={`<b>${player.customName}</b>`}
          variant={
            (state.videoControl.selectedVideoPlayer ?? 0) === idx
              ? 'primary'
              : 'secondary'
          }
          color={
            (state.videoControl.selectedVideoPlayer ?? 0) === idx
              ? Color4.Black()
              : Color4.White()
          }
          onMouseDown={() => {
            state.videoControl.selectedVideoPlayer = idx
            state.videoControl.linkAllVideoPlayers = false
          }}
          uiTransform={{
            ...UI_STYLES.BUTTON_TRANSFORM,
            margin: { right: 8 },
          }}
        />
      ))}
      <Button
        id="video_control_link_all"
        value="<b>Link All</b>"
        variant="text"
        color={Color4.White()}
        onMouseDown={() => {
          state.videoControl.linkAllVideoPlayers = true
          state.videoControl.selectedVideoPlayer = undefined
        }}
        uiTransform={UI_STYLES.BUTTON_TRANSFORM}
      />
    </UiEntity>
  )
}

function useSelectedVideoPlayer(engine: IEngine, state: State) {
  const videoControl = getAdminToolkitVideoControl(engine)
  const { VideoPlayer } = getExplorerComponents(engine)
  const videoPlayers = getVideoPlayers(engine)
  const linkAllVideoPlayers =
    state.videoControl.linkAllVideoPlayers ?? videoControl?.linkAllVideoPlayers

  if (videoPlayers.length === 0) return null

  if (linkAllVideoPlayers) {
    return VideoPlayer.getOrNull(videoPlayers[0].entity as Entity)
  }

  return VideoPlayer.getOrNull(
    videoPlayers[state.videoControl.selectedVideoPlayer ?? 0].entity as Entity,
  )
}

function VideoControlVolume({
  engine,
  state,
}: {
  engine: IEngine
  state: State
}) {
  const controls = createVideoPlayerControls(engine, state)
  const selectedVideoPlayer = useSelectedVideoPlayer(engine, state)
  const videoControl = getAdminToolkitVideoControl(engine)
  const isSoundDisabled = videoControl?.disableVideoPlayersSound
  const volumePercentage = `${Math.round((selectedVideoPlayer?.volume ?? DEFAULT_VOLUME) * 100)}%`

  return !isSoundDisabled ? (
    <UiEntity uiTransform={VOLUME_STYLES.CONTAINER}>
      <Label
        value={'Video Volume'}
        fontSize={16}
        color={COLORS.WHITE}
        uiTransform={VOLUME_STYLES.HEADER}
      />

      <UiEntity uiTransform={VOLUME_STYLES.CONTROLS}>
        <Button
          id="video_control_volume_minus"
          value="Minus"
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          icon={ICONS.VOLUME_MINUS_BUTTON}
          onlyIcon={true}
          iconTransform={UI_STYLES.ICON_TRANSFORM}
          onMouseDown={() => controls.setVolume(-VOLUME_STEP)}
          disabled={!selectedVideoPlayer}
        />
        <Label
          value={volumePercentage}
          fontSize={18}
          color={COLORS.GRAY}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
        />
        <Button
          id="video_control_volume_plus"
          value="Plus"
          icon={ICONS.VOLUME_PLUS_BUTTON}
          onlyIcon={true}
          iconTransform={UI_STYLES.ICON_TRANSFORM}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          onMouseDown={() => controls.setVolume(VOLUME_STEP)}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_volume_mute"
          value="<b>Mute</b>"
          fontSize={18}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          onMouseDown={() => controls.setVolume(0)}
          disabled={!selectedVideoPlayer}
        />
      </UiEntity>
    </UiEntity>
  ) : null
}

// Main component
export function VideoControl({
  engine,
  state,
}: {
  engine: IEngine
  state: State
}) {
  const controls = createVideoPlayerControls(engine, state)
  const selectedVideoPlayer = useSelectedVideoPlayer(engine, state)
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          margin: { bottom: 10 },
          height: 30,
        }}
      >
        <UiEntity
          uiTransform={{ width: 30, height: 30 }}
          uiBackground={{
            textureMode: 'stretch',
            texture: {
              src: ICONS.VIDEO_CONTROL,
            },
          }}
        />
        <Label
          value="<b>Video Control</b>"
          fontSize={24}
          color={Color4.White()}
        />
      </UiEntity>

      <Label
        value="<b>Current Screen</b>"
        fontSize={16}
        color={Color4.White()}
        uiTransform={{ margin: { bottom: 16 } }}
      />

      <VideoPlayerSelector engine={engine} state={state} />

      <Input
        onSubmit={(value) => {
          state.videoControl.shareScreenUrl = value
        }}
        value={state.videoControl.shareScreenUrl}
        onChange={($) => (state.videoControl.shareScreenUrl = $)}
        fontSize={16}
        placeholder={'Paster your video or Playlist URL'}
        placeholderColor={Color4.create(160 / 255, 155 / 255, 168 / 255, 1)}
        color={Color4.Black()}
        uiBackground={{ color: Color4.White() }}
        uiTransform={{
          width: '100%',
          height: '80px',
        }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          margin: '10px 0 0 0',
        }}
      >
        <Button
          id="video_control_share_screen_clear"
          value="<b>Clear</b>"
          variant="text"
          fontSize={16}
          color={Color4.White()}
          uiTransform={{ margin: { right: 8 } }}
          onMouseDown={() => {
            state.videoControl.shareScreenUrl = undefined
          }}
        />
        <Button
          id="video_control_share_screen_share"
          value="<b>Share</b>"
          fontSize={16}
          onMouseDown={() => {
            controls.setSource(state.videoControl.shareScreenUrl ?? '')
          }}
          disabled={!selectedVideoPlayer}
        />
      </UiEntity>

      <Label
        value="Video Playback"
        fontSize={16}
        color={Color4.White()}
        uiTransform={{ margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          id="video_control_previous"
          value="Previous"
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          icon={ICONS.PREVIOUS_BUTTON}
          onlyIcon={true}
          iconTransform={UI_STYLES.ICON_TRANSFORM}
          onMouseDown={() => {
            controls.previous()
          }}
          disabled={true}
        />
        <Button
          id="video_control_play"
          value="<b>Play</b>"
          fontSize={18}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          icon={ICONS.PLAY_BUTTON}
          iconTransform={UI_STYLES.ICON_TRANSFORM}
          onMouseDown={() => {
            controls.play()
          }}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_pause"
          value="<b>Pause</b>"
          fontSize={18}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          onMouseDown={() => {
            controls.pause()
          }}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_restart"
          value="<b>Restart</b>"
          fontSize={18}
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          onMouseDown={() => {
            controls.restart()
          }}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_next"
          value="Next"
          uiTransform={UI_STYLES.BUTTON_TRANSFORM}
          icon={ICONS.FORWARD_BUTTON}
          onlyIcon={true}
          iconTransform={UI_STYLES.ICON_TRANSFORM}
          onMouseDown={() => {
            controls.next()
          }}
          disabled={true}
        />
      </UiEntity>

      <VideoControlVolume engine={engine} state={state} />
    </UiEntity>
  )
}
