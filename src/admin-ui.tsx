import { engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, UiEntity, Input } from '@dcl/sdk/react-ecs'
import { ReactBasedUiSystem } from '@dcl/react-ecs'
import { Entity, IEngine } from '@dcl/ecs'
import { getComponents } from './definitions'
import { getExplorerComponents } from './components'

export function createAdminToolkitUI(
  engine: IEngine,
  reactBasedUiSystem: ReactBasedUiSystem,
) {
  console.log('setupUi')
  reactBasedUiSystem.setUiRenderer(() => uiComponent(engine))
}

const uiComponent = (engine: IEngine) => {
  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 500,
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'flex-end',
        margin: '16px 0 8px 470px',
        padding: 4,
        pointerFilter: 'block',
      }}
      uiBackground={{ color: Color4.create(0, 0, 0, 0.75) }}
    >
      {renderVideoControl(engine)}
    </UiEntity>
  )
}

function getPlayerPosition(engine: IEngine) {
  const { Transform } = getExplorerComponents(engine)
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (!playerPosition) return ' no data yet'
  const { x, y, z } = playerPosition.position
  return `{X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, z: ${z.toFixed(2)} }`
}

let screenUrl = ''

function getVideoPlayers(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    !adminToolkit ||
    !adminToolkit.videoControl.videoPlayers ||
    adminToolkit.videoControl.videoPlayers.length === 0
  )
    return []

  let videoPlayers = []

  if (adminToolkit.videoControl.linkAllVideoPlayers) {
    videoPlayers = Array.from(engine.getEntitiesWith(VideoPlayer)).map(
      (videoPlayer) => videoPlayer[0],
    )
  } else {
    videoPlayers = adminToolkit.videoControl.videoPlayers.map(
      (videoPlayer) => videoPlayer.entity,
    )
  }
  return videoPlayers
}

function renderVideoControl(engine: IEngine) {
  const videoPlayers = getVideoPlayers(engine)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Video Control"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />

      <Label
        value="Current Screen"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      {videoPlayers.length > 0
        ? videoPlayers.map((videoPlayer, idx) => (
            <Button key={videoPlayer} value={`#${idx + 1}`} />
          ))
        : null}

      <Input
        onSubmit={(value) => {
          shareScreen(engine, value)
        }}
        value={screenUrl}
        onChange={($) => (screenUrl = $)}
        fontSize={35}
        placeholder={'Screen URL something'}
        placeholderColor={Color4.White()}
        color={Color4.White()}
        uiTransform={{
          width: '400px',
          height: '80px',
        }}
      ></Input>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Clear"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            console.log('Clear clicked')
            screenUrl = ''
          }}
        />
        <Button
          value="Share"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40 }}
          onMouseDown={() => {
            console.log('Share clicked')
            shareScreen(engine, screenUrl)
          }}
        />
      </UiEntity>

      <Label
        value="Video Playback"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 80,
          flexDirection: 'row',
          flexWrap: 'wrap',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Previous"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePreviosTrack(engine)
          }}
          disabled={true}
        />
        <Button
          value="Play"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePlay(engine)
          }}
        />
        <Button
          value="Pause"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePause(engine)
          }}
        />
        <Button
          value="Restart"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handleRestart(engine)
          }}
        />
        <Button
          value="Next"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handleNextTrack(engine)
          }}
          disabled={true}
        />
      </UiEntity>

      <Label
        value="Video Volume"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
        }}
      >
        <Button
          value="Minus"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handleMinus(engine)}
        />
        <Button
          value="Plus"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handlePlus(engine)}
        />
        <Button
          value="Mute"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handleMute(engine)}
        />
      </UiEntity>
    </UiEntity>
  )
}

function shareScreen(engine: IEngine, screenUrl: string) {
  console.log('Share clicked', screenUrl)
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit = adminToolkitEntities[0][1]
  if (
    !adminToolkit.videoControl.videoPlayers ||
    adminToolkit.videoControl.videoPlayers.length === 0
  )
    return
  const { VideoPlayer } = getExplorerComponents(engine)

  console.log(
    'all screens linked?',
    adminToolkit.videoControl.linkAllVideoPlayers,
  )

  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.src = screenUrl
    }
  }
}

function handlePlay(engine: IEngine) {
  console.log('Play clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.playing = true
    }
  }
}

function handlePause(engine: IEngine) {
  console.log('Pause clicked')
  const { VideoPlayer } = getExplorerComponents(engine)

  let videoPlayers = getVideoPlayers(engine)

  console.log('videoPlayers', videoPlayers)

  for (const videoPlayer of videoPlayers) {
    console.log('videoPlayer', videoPlayer)
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.playing = false
    }
  }
}

function handleRestart(engine: IEngine) {
  console.log('Restart clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.position = 0
    }
  }
}

// TODO: Previous track in playlist
function handlePreviosTrack(engine: IEngine) {
  console.log('Previous Track clicked')
}

// TODO: Next track in playlist
function handleNextTrack(engine: IEngine) {
  console.log('Next Track clicked')
}

function handleMinus(engine: IEngine) {
  console.log('Minus clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = videoSource.volume ? videoSource.volume - 0.1 : 0
    }
  }
}

function handlePlus(engine: IEngine) {
  console.log('Plus clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = videoSource.volume ? videoSource.volume + 0.1 : 0
    }
  }
}

function handleMute(engine: IEngine) {
  console.log('Mute clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = 0
    }
  }
}
