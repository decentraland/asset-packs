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
export function VideoControlURL({
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
        iconSrc={ICONS.VIDEO_SOURCE}
        title="Video Player"
        scaleFactor={scaleFactor}
      />
      <Label
        value="Play videos in any screen."
        color={Color4.fromHexString('#A09BA8')}
        fontSize={16 * scaleFactor}
      />
      <Label value='<b>Video URL<b>' color={Color4.White()} fontSize={16 * scaleFactor} uiTransform={{ margin: { top: 16 * scaleFactor, bottom: 8 * scaleFactor }}} />

      <Input
        onSubmit={(value) => {
          state.videoControl.shareScreenUrl = value
          handleShareScreenUrl(engine, state, value)
        }}
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
        <Button
          id="video_control_share_screen_clear"
          value="<b>Deactivate</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.White()}
          uiTransform={{ margin: { right: 8 * scaleFactor }, padding: { left: 8 * scaleFactor, right: 8 * scaleFactor } }}
          onMouseDown={() => {
            // TODO: handle this. change src
            // state.videoControl.shareScreenUrl = undefined
          }}
        />
        <Button
          id="video_control_share_screen_share"
          value={state.videoControl.shareScreenUrl ? "<b>Update</b>" : "<b>Activate</b>"}
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
        />
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
          // disabled={!selectedVideoPlayer}
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
          // disabled={!selectedVideoPlayer}
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
          // disabled={!selectedVideoPlayer}
        />
      </UiEntity>

      <VideoControlVolume engine={engine} state={state} />
    </UiEntity>
  )
}
