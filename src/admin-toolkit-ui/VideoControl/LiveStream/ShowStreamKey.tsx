import { Color4 } from '@dcl/sdk/math'
import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import { COLORS } from '..'
import {
  createVideoPlayerControls,
} from '../utils'
import { VideoControlVolume } from '../VolumeControl'
import { Button } from '../../Button'
import { LIVEKIT_STREAM_SRC } from '.'

export function ShowStreamKey({
  scaleFactor,
  engine,
  video,
  entity,
  onReset,
  streamKey,
  endsAt,
}: {
  streamKey: string
  endsAt: number,
  scaleFactor: number
  engine: IEngine
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
  onReset(): void
}) {
  const controls = createVideoPlayerControls(entity, engine)

  return (
    <UiEntity uiTransform={{ flexDirection: 'column' }}>
      <Label
        value="<b>RMTP Server<b>"
        color={Color4.White()}
        fontSize={16 * scaleFactor}
        uiTransform={{
          margin: { top: 16 * scaleFactor, bottom: 8 * scaleFactor },
        }}
      />
      <UiEntity
        uiTransform={{
          width: '100%',
          margin: { bottom: 8 * scaleFactor, top: 8 * scaleFactor },
          height: 42 * scaleFactor,
          borderRadius: 12 * scaleFactor,
        }}
        uiBackground={{ color: Color4.White() }}
      >
        <Label
          uiTransform={{ margin: { left: 16 * scaleFactor } }}
          fontSize={16 * scaleFactor}
          value="<b>rtmps://dcl.rtmp.livekit.cloud/x</b>"
          color={Color4.fromHexString('#A09BA8')}
        />
      </UiEntity>
      <Label
        value="<b>Stream Key<b>"
        color={Color4.White()}
        fontSize={16 * scaleFactor}
        uiTransform={{
          margin: { top: 16 * scaleFactor, bottom: 8 * scaleFactor },
        }}
      />
      <UiEntity
        uiTransform={{
          width: '100%',
          margin: { bottom: 8 * scaleFactor, top: 8 * scaleFactor },
          height: 42 * scaleFactor,
          borderRadius: 12 * scaleFactor,
        }}
        uiBackground={{ color: Color4.White() }}
      >
        <Label
          uiTransform={{ margin: { left: 16 * scaleFactor } }}
          fontSize={16 * scaleFactor}
          value={`<b>${streamKey}</b>`}
          color={Color4.fromHexString('#A09BA8')}
        />
      </UiEntity>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40 * scaleFactor,
          flexDirection: 'row',
          justifyContent: 'space-between',
          margin: { top: 10 * scaleFactor, bottom: 16 * scaleFactor },
        }}
      >
        <UiEntity uiTransform={{ flexDirection: 'column' }}>
          <Label
            value="Stream expires in:"
            color={Color4.fromHexString('#FFFFFFB2')}
            fontSize={14 * scaleFactor}
          />
          <Label
            value={formatTimeRemaining(endsAt)}
            color={Color4.fromHexString('#FFFFFFB2')}
            fontSize={14 * scaleFactor}
          />
        </UiEntity>
        {video?.src === LIVEKIT_STREAM_SRC ? (
          <Button
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
          />
        ) : (
          <Button
            id="video_control_share_screen_share"
            value="<b>Activate</b>"
            labelTransform={{
              margin: { left: 20 * scaleFactor, right: 20 * scaleFactor },
            }}
            fontSize={16 * scaleFactor}
            uiBackground={{ color: COLORS.SUCCESS }}
            color={Color4.Black()}
            onMouseDown={() => {
              controls.setSource(LIVEKIT_STREAM_SRC)
            }}
          />
        )}
      </UiEntity>
      <VideoControlVolume
        engine={engine}
        label="<b>Stream Volume</b>"
        entity={entity}
        video={video}
      />
      <UiEntity>
        <Button
          id="video_control_reset_stream_key"
          value="<b>Reset Stream Key</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.fromHexString('#FB3B3B')}
          uiTransform={{
            margin: { right: 8 * scaleFactor, top: 20 * scaleFactor },
            padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
          }}
          onMouseDown={() => onReset()}
        />
      </UiEntity>
    </UiEntity>
  )
}

// Helper function to format time remaining in hh:mm:ss
function formatTimeRemaining(endsAt: number): string {
  const now = Date.now()
  const timeRemaining = Math.max(0, endsAt - now)

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
