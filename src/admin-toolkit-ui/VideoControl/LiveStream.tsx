import { Color4 } from '@dcl/sdk/math'
import { IEngine } from '@dcl/ecs'
import ReactEcs, { UiEntity, Input, Label } from '@dcl/react-ecs'
import { COLORS, ICONS } from '.'
import { state } from '..'
import { createVideoPlayerControls } from './utils'
import { VideoControlVolume } from './VolumeControl'
import { Button } from '../Button'
import { Header } from '../Header'

function handleShareScreenUrl(...args: any[]) {

}
export function LiveStream({
  engine,
  scaleFactor,
}: {
  engine: IEngine
  scaleFactor: number
}) {
  const controls = createVideoPlayerControls(engine, state)

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
          value="<b>889903e2ue8adsa9u8dysa89d7sd</b>"
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
        {false ? <Button
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
            // TODO: handle this. change src
            // state.videoControl.shareScreenUrl = undefined
          }}
        />:
        <Button
          id="video_control_share_screen_share"
          value="<b>Activate</b>"
          labelTransform={{ margin: '0 20' }}
          fontSize={16 * scaleFactor}
          uiBackground={{ color: COLORS.SUCCESS }}
          color={Color4.Black()}
          onMouseDown={() => {
            handleShareScreenUrl(
              engine,
              state,
              state.videoControl.shareScreenUrl,
            )
          }}
          // disabled={!selectedVideoPlayer}
        />}
      </UiEntity>
      <VideoControlVolume engine={engine} state={state} />
    </UiEntity>
  )
}
