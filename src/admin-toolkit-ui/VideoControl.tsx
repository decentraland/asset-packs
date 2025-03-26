import { Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity, Input, Dropdown } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { getComponents } from '../definitions'
import { getExplorerComponents } from '../components'
import { getScaleUIFactor } from '../ui'
import { nextTickFunctions } from './index'
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

const DROPDOWN_BACKGROUND = `${CONTENT_URL}/admin_toolkit/backgrounds/dropdown-background.png`

const VOLUME_STEP = 0.1
const MAX_VOLUME = 1
const DEFAULT_VOLUME = 1

const COLORS = {
  WHITE: Color4.White(),
  GRAY: Color4.create(160 / 255, 155 / 255, 168 / 255, 1),
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

function updateVideoPlayerProps<K extends keyof PBVideoPlayer>(
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

  // TODO: Needs to be redefined the link all feature
  // const linkAllVideoPlayers =
  //   state.videoControl.linkAllVideoPlayers ?? videoControl?.linkAllVideoPlayers
  // if (linkAllVideoPlayers) {
  //   // Apply to all players
  //   players.forEach((player) => {
  //     const videoSource = VideoPlayer.getMutableOrNull(player.entity as Entity)
  //     if (!videoSource) return
  //     updateVideoSourceProperty(videoSource, property, value)

  //     updateVideoPlayerControlState(
  //       engine,
  //       state,
  //       player.entity as Entity,
  //       property,
  //       value,
  //     )
  //   })
  //   return
  // }

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
function updateVideoSourceProperty<K extends keyof PBVideoPlayer>(
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

function updateVideoPlayerControlState<K extends keyof PBVideoPlayer>(
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

// Components
function VideoPlayerSelector({
  engine,
  state,
}: {
  engine: IEngine
  state: State
}) {
  const videoPlayers = getVideoPlayers(engine)
  const scaleFactor = getScaleUIFactor(engine)

  if (videoPlayers.length <= 1) return null

  if (videoPlayers.length > 4) {
    return (
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          margin: { bottom: 16 * scaleFactor },
        }}
      >
        <Dropdown
          options={videoPlayers.map((player) => player.customName)}
          selectedIndex={state.videoControl.selectedVideoPlayer ?? 0}
          onChange={(idx) => (state.videoControl.selectedVideoPlayer = idx)}
          textAlign="middle-left"
          fontSize={14 * scaleFactor}
          uiTransform={{
            margin: { right: 8 * scaleFactor },
            minWidth: 150 * scaleFactor,
          }}
          uiBackground={{ color: Color4.White() }}
        />
        {/* TODO: Needs to be redefined the link all feature. */}
        {/* <Button
          id="video_control_link_all"
          value="<b>Link All</b>"
          variant="text"
          fontSize={14 * scaleFactor}
          color={Color4.White()}
          onMouseDown={() => {
            state.videoControl.linkAllVideoPlayers = true
            state.videoControl.selectedVideoPlayer = undefined
          }}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        /> */}
      </UiEntity>
    )
  }

  // For 4 or fewer players, show numbered buttons
  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'row',
        margin: { bottom: 16 * scaleFactor },
      }}
    >
      {videoPlayers.map((player, idx) => {
        const isPlayerSelected =
          (state.videoControl.selectedVideoPlayer ?? 0) === idx
        const playerName = player.customName ?? `#${idx + 1}`
        return (
          <Button
            id={`video_control_player_${idx}`}
            key={player.entity}
            value={`<b>${playerName}</b>`}
            fontSize={14 * scaleFactor}
            variant={isPlayerSelected ? 'primary' : 'secondary'}
            color={isPlayerSelected ? Color4.Black() : Color4.White()}
            onMouseDown={() => {
              state.videoControl.selectedVideoPlayer = idx
            }}
            uiTransform={{
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              margin: { right: 8 * scaleFactor },
            }}
            labelTransform={{
              padding: 4 * scaleFactor,
            }}
          />
        )
      })}
      {/* TODO: Needs to be redefined the link all feature. */}
      {/* <Button
        id="video_control_link_all"
        value="<b>Link All</b>"
        fontSize={14 * scaleFactor}
        variant={
          state.videoControl.linkAllVideoPlayers ? 'primary' : 'secondary'
        }
        color={
          state.videoControl.linkAllVideoPlayers
            ? Color4.Black()
            : Color4.White()
        }
        onMouseDown={() => {
          state.videoControl.linkAllVideoPlayers = true
          state.videoControl.selectedVideoPlayer = undefined
        }}
        uiTransform={{
          margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
          minWidth: 69 * scaleFactor,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      /> */}
    </UiEntity>
  )
}

function useSelectedVideoPlayer(engine: IEngine, state: State) {
  const { VideoPlayer } = getExplorerComponents(engine)
  const videoPlayers = getVideoPlayers(engine)

  if (videoPlayers.length === 0) return null

  // TODO: Needs to be redefined the link all feature
  // const videoControl = getAdminToolkitVideoControl(engine)
  // const linkAllVideoPlayers =
  //   state.videoControl.linkAllVideoPlayers ?? videoControl?.linkAllVideoPlayers

  // if (linkAllVideoPlayers) {
  //   return VideoPlayer.getOrNull(videoPlayers[0].entity as Entity)
  // }

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
  const scaleFactor = getScaleUIFactor(engine)
  const controls = createVideoPlayerControls(engine, state)
  const selectedVideoPlayer = useSelectedVideoPlayer(engine, state)
  const videoControl = getAdminToolkitVideoControl(engine)
  const isSoundDisabled = videoControl?.disableVideoPlayersSound
  const volumePercentage = `${Math.round((selectedVideoPlayer?.volume ?? DEFAULT_VOLUME) * 100)}%`

  return !isSoundDisabled ? (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
      }}
    >
      <Label
        value={'Video Volume'}
        fontSize={16 * scaleFactor}
        color={COLORS.WHITE}
        uiTransform={{
          margin: { top: 0, right: 0, bottom: 10 * scaleFactor, left: 0 },
        }}
      />

      <UiEntity
        uiTransform={{
          flexDirection: 'row',
        }}
      >
        <Button
          id="video_control_volume_minus"
          value="Minus"
          fontSize={14 * scaleFactor}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          icon={ICONS.VOLUME_MINUS_BUTTON}
          onlyIcon={true}
          iconTransform={{
            width: 35 * scaleFactor,
            height: 35 * scaleFactor,
          }}
          onMouseDown={() => controls.setVolume(-VOLUME_STEP)}
          disabled={!selectedVideoPlayer}
        />
        <Label
          value={volumePercentage}
          fontSize={18 * scaleFactor}
          color={COLORS.GRAY}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        />
        <Button
          id="video_control_volume_plus"
          value="Plus"
          fontSize={14 * scaleFactor}
          icon={ICONS.VOLUME_PLUS_BUTTON}
          onlyIcon={true}
          iconTransform={{
            width: 35 * scaleFactor,
            height: 35 * scaleFactor,
          }}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={() => controls.setVolume(VOLUME_STEP)}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_volume_mute"
          value="<b>Mute</b>"
          fontSize={18 * scaleFactor}
          labelTransform={{ margin: '0 20' }}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
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
  const scaleFactor = getScaleUIFactor(engine)

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
          margin: { bottom: 10 * scaleFactor },
          height: 30 * scaleFactor,
        }}
      >
        <UiEntity
          uiTransform={{ width: 30 * scaleFactor, height: 30 * scaleFactor }}
          uiBackground={{
            textureMode: 'stretch',
            texture: {
              src: ICONS.VIDEO_CONTROL,
            },
          }}
        />
        <Label
          value="<b>Video Control</b>"
          uiTransform={{ margin: { bottom: 8, left: 20 } }}
          fontSize={24 * scaleFactor}
          color={Color4.White()}
        />
      </UiEntity>

      <Label
        value="<b>Current Screen</b>"
        fontSize={16 * scaleFactor}
        color={Color4.White()}
        uiTransform={{ margin: { bottom: 16 * scaleFactor } }}
      />

      <VideoPlayerSelector engine={engine} state={state} />

      <Input
        onSubmit={(value) => {
          state.videoControl.shareScreenUrl = value
          handleShareScreenUrl(engine, state, value)
        }}
        onChange={($) => (state.videoControl.shareScreenUrl = $)}
        fontSize={16 * scaleFactor}
        placeholder="Paste your video URL"
        placeholderColor={Color4.create(160 / 255, 155 / 255, 168 / 255, 1)}
        color={Color4.Black()}
        uiBackground={{ color: Color4.White() }}
        uiTransform={{
          width: '100%',
          height: 80 * scaleFactor,
        }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40 * scaleFactor,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          margin: { top: 10 * scaleFactor },
        }}
      >
        <Button
          id="video_control_share_screen_clear"
          value="<b>Clear Screen</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.White()}
          uiTransform={{ margin: { right: 8 * scaleFactor } }}
          onMouseDown={() => {
            state.videoControl.shareScreenUrl = undefined
          }}
        />
        <Button
          id="video_control_share_screen_share"
          value="<b>Share</b>"
          labelTransform={{ margin: '0 20' }}
          fontSize={16 * scaleFactor}
          onMouseDown={() => {
            handleShareScreenUrl(
              engine,
              state,
              state.videoControl.shareScreenUrl,
            )
          }}
          disabled={!selectedVideoPlayer}
        />
      </UiEntity>

      <Label
        value="Video Playback"
        fontSize={16 * scaleFactor}
        color={Color4.White()}
        uiTransform={{ margin: { bottom: 10 * scaleFactor } }}
      />

      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          width: '100%',
          margin: { bottom: 10 * scaleFactor },
        }}
      >
        {/* <Button
          id="video_control_previous"
          value="Previous"
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          icon={ICONS.PREVIOUS_BUTTON}
          onlyIcon={true}
          iconTransform={{
            width: 35 * scaleFactor,
            height: 35 * scaleFactor,
          }}
          onMouseDown={() => {
            controls.previous()
          }}
          disabled={true}
        /> */}
        <Button
          id="video_control_play"
          value="<b>Play</b>"
          fontSize={18 * scaleFactor}
          labelTransform={{ margin: { right: 20 } }}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          icon={ICONS.PLAY_BUTTON}
          iconTransform={{
            width: 35 * scaleFactor,
            height: 35 * scaleFactor,
          }}
          onMouseDown={() => {
            controls.play()
          }}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_pause"
          value="<b>Pause</b>"
          fontSize={18 * scaleFactor}
          labelTransform={{ margin: '0 20' }}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={() => {
            controls.pause()
          }}
          disabled={!selectedVideoPlayer}
        />
        <Button
          id="video_control_restart"
          value="<b>Restart</b>"
          labelTransform={{ margin: '0 20' }}
          fontSize={18 * scaleFactor}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={() => {
            controls.restart()
          }}
          disabled={!selectedVideoPlayer}
        />
        {/* <Button
          id="video_control_next"
          value="Next"
          fontSize={18 * scaleFactor}
          uiTransform={{
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            minWidth: 69 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          icon={ICONS.FORWARD_BUTTON}
          onlyIcon={true}
          iconTransform={{
            width: 35 * scaleFactor,
            height: 35 * scaleFactor,
          }}
          onMouseDown={() => {
            controls.next()
          }}
          disabled={true}
        /> */}
      </UiEntity>

      <VideoControlVolume engine={engine} state={state} />
    </UiEntity>
  )
}

function handleShareScreenUrl(engine: IEngine, state: State, url?: string) {
  if (!url) return

  const controls = createVideoPlayerControls(engine, state)
  controls.setSource(url)
  nextTickFunctions.push(() => {
    controls.play()
  })
}
