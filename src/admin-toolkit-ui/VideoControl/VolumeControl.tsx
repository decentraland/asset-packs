import { IEngine } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/ecs-math'
import { getScaleUIFactor } from '../../ui'
import { Button } from '../Button'
import { State } from '../types'
import {
  createVideoPlayerControls,
  getAdminToolkitVideoControl,
  useSelectedVideoPlayer,
} from './utils'
import { COLORS, DEFAULT_VOLUME, ICONS, VOLUME_STEP } from '.'

export function VideoControlVolume({
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

  // TODO gon
  return !isSoundDisabled || true ? (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
        margin: { top: 16 * scaleFactor}
      }}
    >
      <Label
        value="<b>Video Volume</b>"
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
            width: 49 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          icon={ICONS.VOLUME_MINUS_BUTTON}
          onlyIcon={true}
          iconTransform={{
            width: 25 * scaleFactor,
            height: 25 * scaleFactor,
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
            width: 25 * scaleFactor,
            height: 25 * scaleFactor,
          }}
          uiTransform={{
            margin: { top: 0, right: 16 * scaleFactor, bottom: 0, left: 0 },
            width: 49 * scaleFactor,
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
          variant="secondary"
          fontSize={18 * scaleFactor}
          labelTransform={{
            margin: { left: 20 * scaleFactor, right: 20 * scaleFactor },
          }}
          color={Color4.fromHexString('#FCFCFC')}
          uiTransform={{
            borderColor: Color4.fromHexString('#FCFCFC'),
            borderWidth: 2,
            height: 42 * scaleFactor,
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
