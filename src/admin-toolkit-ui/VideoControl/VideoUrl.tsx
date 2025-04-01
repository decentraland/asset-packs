import { Color4 } from '@dcl/sdk/math'
import { DeepReadonlyObject, IEngine, PBVideoPlayer, Entity } from '@dcl/ecs'
import ReactEcs, { UiEntity, Input, Label } from '@dcl/react-ecs'
import { COLORS, ICONS } from '.'
import { createVideoPlayerControls } from './utils'
import { VideoControlVolume } from './VolumeControl'
import { Button } from '../Button'
import { Header } from '../Header'
import { LIVEKIT_STREAM_SRC } from './LiveStream'

export function VideoControlURL({
  engine,
  scaleFactor,
  video,
  entity,
}: {
  engine: IEngine
  scaleFactor: number
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
}) {
  const [videoURL, setVideoURL] = ReactEcs.useState("")
  ReactEcs.useEffect(() => {
    const url = video?.src === LIVEKIT_STREAM_SRC ? '' : video?.src
    setVideoURL(url ?? "")
  }, [entity])
  const controls = createVideoPlayerControls(entity, engine)

  return (
    <UiEntity uiTransform={{ flexDirection: 'column', width: '100%' }}>
      <Header
        iconSrc={ICONS.VIDEO_SOURCE}
        title="Video Player"
        scaleFactor={scaleFactor}
      />
      <Label
        value="Play videos in any screen."
        color={Color4.fromHexString('#A09BA8')}
        fontSize={16 * scaleFactor}
      />
      <Label
        value="<b>Video URL<b>"
        color={Color4.White()}
        fontSize={16 * scaleFactor}
        uiTransform={{
          margin: { top: 16 * scaleFactor, bottom: 8 * scaleFactor },
        }}
      />

      <Input
        onChange={setVideoURL}
        value={videoURL}
        fontSize={16 * scaleFactor}
        placeholder="Paste your video URL"
        placeholderColor={Color4.create(160 / 255, 155 / 255, 168 / 255, 1)}
        color={Color4.Black()}
        uiBackground={{ color: Color4.White() }}
        uiTransform={{
          borderRadius: 12,
          borderColor: Color4.White(),
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
        {video?.src.startsWith('https://') && <Button
          id="video_control_share_screen_clear"
          value="<b>Deactivate</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.White()}
          uiTransform={{
            margin: { right: 8 * scaleFactor },
            padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
          }}
          onMouseDown={() => {
            controls.setSource('')
          }}
        />}
        {videoURL !== video?.src && videoURL && <Button
          id="video_control_share_screen_share"
          value={
            video?.src && videoURL !== video.src && video.src !== LIVEKIT_STREAM_SRC
              ? '<b>Update</b>'
              : '<b>Activate</b>'
          }
          labelTransform={{ margin: { left: 20 * scaleFactor, right: 20 * scaleFactor } }}
          fontSize={16 * scaleFactor}
          uiBackground={{ color: COLORS.SUCCESS }}
          color={Color4.Black()}
          onMouseDown={() => {
            controls.setSource(videoURL)
          }}
        />}
      </UiEntity>

      <Label
        value="<b>Video Playback</b>"
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
        />
        <Button
          id="video_control_pause"
          value="<b>Pause</b>"
          fontSize={18 * scaleFactor}
          labelTransform={{ margin: { left: 20 * scaleFactor, right: 20 * scaleFactor } }}
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
        />
        <Button
          id="video_control_restart"
          value="<b>Restart</b>"
          labelTransform={{ margin: { left: 20 * scaleFactor, right: 20 * scaleFactor } }}
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
        />
      </UiEntity>

      <VideoControlVolume
        engine={engine}
        entity={entity}
        video={video}
        label="<b>Video Volume</b>"
      />
    </UiEntity>
  )
}
