import { Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity, Input, Dropdown } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { getComponents } from '../definitions'
import { getExplorerComponents } from '../components'
import { Button } from './Button'
import { State } from './types'

// Constants
const ICONS = {
  VIDEO_CONTROL:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIYSURBVHgB7ZrtcYJAEIYXRH9bAh1EOyAlpAM7SFJBkgqcVBBTQexAS7CD2EHIX7/IuzM4AwwYDvY+Eu+ZcQ5OEV92b/duTyKPx6NCQALsdrtJGIYT0k96Op22o9FoU/dmLzFZlsXH4/ENhwkZJAiCLR7eLbelfuoIC8FTWnFLFsgFTdGm576QOgKLJLaEMHzv/X4/K/Z1FgOrJGQZWOamdE7/CC/GVUyK2WLQvpBGGsUgUiSHw+ELUesTSfGBBBgOh88IHNNqfpCiUQwiBSfDMYdAHM/RjkkAzt6c8HC4JGEaxdTkEBExDFsmiqI7abezGgCk3c56NJN0OydCs5TbOZVn+rqdc0nz7HYQtFG91skZAFsG+e2dFInIQThhQ9ATKeKcZWCROYSsqENec8Yy5yU42oQ64oQYdisI+aCeswzrbtbHrapYs4yEW1WxIkbKraoYdzNJt6pi0jJjLPZWkm5VxaRl2BIJacQXNFzlT4vB+PsunncWg4i0IMvgN6yL553FYCG1xkJKeZouBazyitVpaandy82wkJrxUldXHawOvhffEw+zfS0POSErvmxuX7TlOqMZrBOT47QWA1+9lyrR6qJxT5PHSU13WtxD1EiaR6uFykWXxPDMNiGLcA2taZu8jkuFc617KW1A/SxW+nzTG3lSfDSZQ4rkJVul+vOv/wPgQQ+Xm+DLYzLIYDBYGhqfHs/V8gMFOf2fQ9gfZwAAAABJRU5ErkJggg==',
  PREVIOUS_BUTTON:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFESURBVHgB7djBTUMxEATQAVEAHWA6gA4+HUAHUAHQQVIBUAGhAugAOoASXAIlsKslUnJIFPt71z7Mk0biao138Q9ARERERDSQW8nnRhZoK0muUegYdZJk2sgZ2tFDfEsuUKj2MB5OJU+S9/+/i51gDJPkFdZ4tRGa0TZ07hJm6tlMgl2p4tnYpVcz96gc8n2im9HB1tkoXruHiGxmgrXhchAVcZj1ym0y5Pt4XzOdCR3yhACezayHPCGIRzN6rbSNCcE8mvmVLCUZwbyu2ZfkSvKGQJ4zk2GfCnewttxFrOaV5FLyA2dR/zQz7EBLOIp+my0k53BaDj0emhnW0gsa6/Vq1oXwAFsOGY30/jhbwVb4BxoY4UszS24kj5hppB80njFzOYx0GJVhB6pa4Ueok7D9Gs5ov271wRryciAiIiKi9v4AivcsSBHk+/wAAAAASUVORK5CYII=',
  FORWARD_BUTTON:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE/SURBVHgB7dbRUcNADATQhaEASrgSQgfQQejAdBAqIFTAUAElkA5wB9ABLoESkEa5mfAD2JZ097FvZn/jWcu6HEBERERE1JGtpMDXTvJ2kgEznWOZzdIH/vGb1ycpmGlpGRwf9nLMJTqwpkw1SN5hb7YpjzKqwAo9oCGvMtVe8gn/w+FfvMuoApvSDskiyig9EJ5gh0NBkqgy1QA7wrdIEF1GFckrbFKhMspUukOhh0NmGVVghUKO8Owy1R62S643h1ZlJsmj5AuOWpQ5SK4kI5xlltEp3Etu4TyR6gI5Rskd7PMKkzEZncYNgouoyMlMsE/qA0miJvMMW/K0Isp7MrrYuhsHNOA5mRE2jSZFlEeZeuSmLPlv1n5muhO65BM6sGYydckndOIMy+gF0ftffIOfF88JHb0oIiIiIprnGyrkMBevIFSEAAAAAElFTkSuQmCC',
  PLAY_BUTTON:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEnSURBVHgB7djhScRAEMXxP2IBlhA70A5SytiBHYgViBXYgh2YEuzAdKAd6CwhGE7wdpLdvckxP3gf82F4uccRCCGEEEIIqtcIZ0I035oXTcfOCdMxKR/svCXh95g5bzRu6YJ6eqaWHtgZ4W8zy6SjOiqr2cxSx3TQk+YK54T/mzlsSXBMyD9mjtsZF+zHuG1JWHdM0RlvNQDH9DiacWFbM0Vm3EszSx0nnnGhXDOHLd2QyWMzsy/Ns+Y994FLfBo0d5rR8Iy7Y1Ib6YhXVvD0mqVX6pqVhyQemhmZ2hjY6NTNPGpuKXBISYL970v25LYm5B3xqbmnkpa/mYEVc2vR4phNc2tRewA2z61FrWZGCs2tRY1mXM6theB8bi3cfz4KIYQQwrn6AeTDp/o9pKijAAAAAElFTkSuQmCC',
  VOLUME_MINUS_BUTTON:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABRSURBVHgB7dJRCYBAAETBVQxiFJtqFKMYQRPogQUU9D6OGXgBFjYBAAAAgE90eWcqjalrK635wVI6KzfnoT4NaWrMkHf23B+u6QgAAAAA1HUBn3Qh7hutr4QAAAAASUVORK5CYII=',
  VOLUME_PLUS_BUTTON:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACgSURBVHgB7dfBDcJADETRAVEAJWwpUAE1UBl0AqVsCVABmGvIIZZwNCT/SXNY3+ZgySsBAAD8tY1qtchtMDtGugrsVK9pJlstCGVcUcYVZVxRxtWiymTPmYNy58l+ZHaKPDVdj9xV4Bp5zZyLJmJnXGV35qH8X6QN3l05mf0q1fS9A01F2BlXlHFFGVeUcUUZV6s+NLM+h+l5ZAYAAPAjb8RpLRFkEsQIAAAAAElFTkSuQmCC',
} as const

const UI_STYLES = {
  BUTTON_TRANSFORM: {
    margin: '0 16px 0 0',
    minWidth: 49,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  ICON_TRANSFORM: {
    width: 35,
    height: 35,
  } as const,
} as const

const DROPDOWN_BACKGROUND =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA1wAAABUCAYAAACWXjY0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASNSURBVHgB7d3vURtHGMDhvRN8Jx3IFYArCO6AVOCkAuwKDB2ECkIqwB0EV2BcAbiC6LvupOyr6BhFgP6g25kYnmdGc9JpPebrb969VZV6MJ1OD9q2Pamq6jC/H+brUdzLXx0kAACA/7ncMHe5Ye7y9SZfvw0Gg+u4l3ZUpWeKoJpMJqf5epw/HicAAIAXZB5fF7vE19bBtRBaH5IJFgAA8Dpc5vA63za8tgqutm0/CS0AAOC1ysF1FuG18fpNFsVzWXmqdZWvRwkAAOAViylXXdfvNpl21esW5Mh6nydbX8UWAADAvwOpaKSmaU7WrV0ZXLGFML8uky2EAAAAi6KRrqKZVi16ckvh/HmtswQAAMCTVj3X9WhwzUdjVwkAAIC1cnD9msPrz+X7D4Kr24+YbCMEAADY1ChH19vlgzQeBFeOrduIrgQAAMDG4oeSI7oW7/3n0Iz5c1vDBAAAwFbiZPfxeHy2eK9a+DK2Et4mAAAAniu2Fr7J065RfLifcK07zhAAAIC1Dpqm+dB9mE24TLcAAAB6cz/lmk24cmwdJwAAAPpwP+WaBVcur9MEAABAL3Jj/Ty72k4IAADQv8Fg8FNtOyEAAED/cmud1HFWfAIAAKBX0Vp1VVWHCQAAgL4NI7iGCQAAgF7FcKtqmmaaAAAA6NtIcAEAABRSJwAAAIoQXAAAAIUILgAAgEIEFwAAQCGCCwAAoBDBBQAAUIjgAgAAKERwAQAAFCK4AAAAChFcAAAAhQguAACAQgQXAABAIYILAACgEMEFAABQiOACAAAoRHABAAAUIrgAAAAKEVwAAACFCC4AAIBCBBcAAEAhggsAAKAQwQUAAFCI4AIAAChEcAEAABQiuAAAAAoRXAAAAIUILgAAgEIEFwAAQCGCCwAAoBDBBQAAUIjgAgAAKERwAQAAFCK4AAAAChFcAAAAhQguAACAQgQXAABAIYILAACgkAiuUQIAAKB3dVVVggsAAKB/d/V0Or1JAAAA9G0WXN8TAAAAvcqt9S22FJpwAQAA9Cxaq8rVddC27d8JAACA3gwGgzfdoRnXCQAAgF7MpltVdTf7Ha485fqSAAAA6EVurIu4VvMPsa3wNr89SAAAAOwkthPeT7hiW2FXYAAAAOzkMmIr3lTdHVMuAACA3XXTrXhfdzdNuQAAAHaTm+q8i61QLS/IU66vedFRAgAAYGMRWjHdWrxXLy+q6/qXfBklAAAANjXKLfVu+eaD4JqPvz4mAAAANvXb4lbCTv3Yyr29vcvYe5gAAABYKdopN9Tnx76rVv3D8Xh8livtUwIAAOCBiK39/f2zp75fGVyhaZqTfPkjOS4eAACgE+defIzdgasWrQ2ukKttOJlM/oprAgAAeMWqqrqJwwYfe2ZrWZ020B1v6LkuAADgFYvfLj7PbfR2k9gKG024FsWUK57tykX3PgEAALx8EVoXe3t7v+fQ2uontLYOrk6EV9u2x/k/PPVDyQAAwAt0nVvny3NCq/Ps4FrUxVeEV/5DDvNr6HkvAADgBzGKoMoNc5Nf3+MZrcFg8Pm5kbXoH25Pgk5xFc/5AAAAAElFTkSuQmCC'

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
    setVolume: (volume) =>
      updateVideoPlayerProps(engine, state, 'volume', volume),
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
          value={`<b>#${idx + 1}</b>`}
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

  const volumePercentage = `${Math.round((selectedVideoPlayer?.volume ?? DEFAULT_VOLUME) * 100)}%`

  return (
    <UiEntity uiTransform={VOLUME_STYLES.CONTAINER}>
      <Label
        value="Video Volume"
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
  )
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
            color: Color4.White(),
            textureMode: 'stretch',
            texture: { src: ICONS.VIDEO_CONTROL },
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
