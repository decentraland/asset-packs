import { IEngine } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity, Dropdown } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { getScaleUIFactor } from '../../ui'
import { nextTickFunctions } from '../index'
import { Button } from '../Button'
import { CONTENT_URL } from '../constants'
import { State } from '../types'
import { Header } from '../Header'
import { createVideoPlayerControls, getVideoPlayers, useSelectedVideoPlayer } from './utils'
import { Card } from '../Card'
import { VideoControlURL } from './VideoUrl'
import { LiveStream } from './LiveStream'

// Constants
export const ICONS = {
  VIDEO_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control.png`,
  PREVIOUS_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-previous-button.png`,
  FORWARD_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-forward-button.png`,
  PLAY_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-play-button.png`,
  VOLUME_MINUS_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-volume-minus-button.png`,
  VOLUME_PLUS_BUTTON: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control-volume-plus-button.png`,
  VIDEO_SOURCE: `assets/video.png`,
  LIVE_SOURCE: `assets/live.png`
} as const


export const VOLUME_STEP = 0.1
export const DEFAULT_VOLUME = 1

export const COLORS = {
  WHITE: Color4.White(),
  GRAY: Color4.create(160 / 255, 155 / 255, 168 / 255, 1),
  SUCCESS: Color4.fromHexString('#34CE77'),
} as const

type VideoState = {
  selected?: 'video-url' | 'live'
}

const videoState: VideoState = { selected: 'live' }
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
  const videoPlayers = getVideoPlayers(engine)

  return (
    <UiEntity
      uiTransform={{ flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <Card scaleFactor={scaleFactor}>
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Header
            iconSrc={ICONS.VIDEO_CONTROL}
            title="<b>VIDEO SCREENS</b>"
            scaleFactor={scaleFactor}
          />
          <Label
            value="<b>Current Screen</b>"
            fontSize={16 * scaleFactor}
            color={Color4.White()}
            uiTransform={{ margin: { bottom: 16 * scaleFactor } }}
          />

          <UiEntity
            uiTransform={{
              flexDirection: 'column',
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
                width: '100%',
                borderColor: Color4.White(),
                borderWidth: 4,
                borderRadius: 12,
              }}
              uiBackground={{ color: Color4.White() }}
            />
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 2,
                margin: { top: 16 * scaleFactor, bottom: 16 * scaleFactor },
              }}
              uiBackground={{ color: Color4.fromHexString('#716B7C') }}
            />
            <UiEntity
              uiTransform={{
                margin: { top: 10 * scaleFactor },
                justifyContent: 'space-between',
                flexDirection: 'row',
                width: '100%',
              }}
            >
              <CustomButton
                id="video_control_url"
                value="<b>VIDEO</b>"
                icon={ICONS.VIDEO_SOURCE}
                onClick={() => (videoState.selected = 'video-url')}
                scaleFactor={scaleFactor}
                selected={videoState.selected === 'video-url'}
              />
              <CustomButton
                id="video_control_live"
                value="<b>LIVE</b>"
                icon={ICONS.LIVE_SOURCE}
                onClick={() => (videoState.selected = 'live')}
                scaleFactor={scaleFactor}
                selected={videoState.selected === 'live'}
              />
            </UiEntity>
          </UiEntity>
        </UiEntity>
      </Card>
      {videoState.selected && <Card scaleFactor={scaleFactor}>
        {videoState.selected === 'video-url' && <VideoControlURL engine={engine} scaleFactor={scaleFactor} />}
        {videoState.selected === 'live' && <LiveStream engine={engine} scaleFactor={scaleFactor} />}
      </Card>}
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

interface Props {
  id: string
  value: string
  onClick(): void
  selected: boolean
  scaleFactor: number
  icon: string
}

function CustomButton({ scaleFactor, value, id, onClick, icon, selected }: Props) {
  return (
    <Button
      id={id}
      onMouseDown={onClick}
      value={value}
      fontSize={14 * scaleFactor}
      icon={icon}
      iconTransform={{
        width: 24 * scaleFactor,
        height: 24 * scaleFactor,
        margin: { right: 8 * scaleFactor },
      }}
      color={selected ? Color4.Black() : Color4.fromHexString('#FCFCFC')}
      iconBackground={{ color: selected ? Color4.Black() : Color4.fromHexString('#FCFCFC') }}
      uiBackground={{ color: selected ? Color4.White() : Color4.fromHexString('#43404A') }}
      uiTransform={{
        padding: {
          top: 6 * scaleFactor,
          right: 6 * scaleFactor,
          bottom: 6 * scaleFactor,
          left: 6 * scaleFactor,
        },
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
      }}
    />
  )
}