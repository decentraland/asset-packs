import { Color4 } from '@dcl/sdk/math'
import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { UiEntity, Input, Label } from '@dcl/react-ecs'
import { COLORS, ICONS } from '.'
import { createVideoPlayerControls, getAdminToolkitVideoControl } from './utils'
import { VideoControlVolume } from './VolumeControl'
import { Button } from '../Button'
import { Header } from '../Header'
import { Error } from '../Error'
import { getStreamKey } from './api'
import { LoadingDots } from '../Loading'

export const LIVEKIT_STREAM_SRC = 'livekit-video://current-stream'

export function LiveStream({
  engine,
  scaleFactor,
  entity,
  video
}: {
  engine: IEngine
  scaleFactor: number
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
}) {
  const controls = createVideoPlayerControls(entity, engine)
  const adminVideoControl = getAdminToolkitVideoControl(engine)

  return (
    <UiEntity uiTransform={{ flexDirection: 'column', width: '100%' }}>
      <Header
        iconSrc={ICONS.LIVE_SOURCE}
        title="Live Stream"
        scaleFactor={scaleFactor}
      />
      <Label
        value="Stream an existing feed providing using an RMTP server."
        color={Color4.fromHexString('#A09BA8')}
        fontSize={16 * scaleFactor}
      />
      {adminVideoControl?.streamKey ?
        <UiEntity>
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
              value={`<b>${adminVideoControl?.streamKey}</b>`}
              color={Color4.fromHexString('#A09BA8')}
            />
          </UiEntity>

          <UiEntity
            uiTransform={{
              width: '100%',
              height: 40 * scaleFactor,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              margin: { top: 10 * scaleFactor },
            }}
          >
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
                labelTransform={{ margin: { left: 20 * scaleFactor, right: 20 * scaleFactor } }}
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
          </UiEntity>
        : <GenerateStreamKey scaleFactor={scaleFactor} engine={engine} />}
    </UiEntity>
  )
}


function GenerateStreamKey({ scaleFactor, engine }: { scaleFactor: number; engine: IEngine}) {
  const [loading, setLoading] = ReactEcs.useState<boolean>(false)
  const [error, setError] = ReactEcs.useState<string>("")

  return (
    <UiEntity uiTransform={{ width: '100%', height: 460 * scaleFactor, justifyContent: 'center', alignItems: 'center' }}>
      {loading
        ? (
          <UiEntity uiTransform={{ flexDirection: 'column' }}>
            <LoadingDots scaleFactor={scaleFactor} engine={engine} />
            <Label
              value='Generating your Stream Key'
              color={Color4.fromHexString('#A09BA8')}
              fontSize={16 * scaleFactor}
              uiTransform={{ margin: { top: 16 * scaleFactor }}}
            />
          </UiEntity>
        )
        : (<UiEntity uiTransform={{ flexDirection: 'column' }}>
            <Button
              id="video_control_live_generate_key"
              value="<b>Get Stream Key</b>"
              fontSize={18 * scaleFactor}
              uiTransform={{ height: 42 * scaleFactor, padding: 16 * scaleFactor }}
              onMouseDown={async () => {
                console.log('on mouse down')
                setLoading(true)
                const [error, data] = await getStreamKey()
                if (error) {
                  setError(error)
                } else {
                  console.log(data?.id)
                }
                setLoading(false)
              }}
            />
            {error && <Error scaleFactor={scaleFactor} text={error} uiTransform={{ margin: { top: 16 * scaleFactor }}} />}
          </UiEntity>
        )
      }
    </UiEntity>
  )
}
