import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/ecs-math'
import { getScaleUIFactor } from '../../ui'
import { Button } from '../Button'
import { createVideoPlayerControls, getAdminToolkitVideoControl } from './utils'
import { COLORS, DEFAULT_VOLUME, ICONS, VOLUME_STEP } from '.'

export function VideoControlVolume({
  engine,
  label,
  entity, video
}: {
  engine: IEngine
  label: string
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
}) {
  const scaleFactor = getScaleUIFactor(engine)
  const controls = createVideoPlayerControls(entity, engine)
  const videoControl = getAdminToolkitVideoControl(engine)
  const isSoundDisabled = videoControl?.disableVideoPlayersSound
  const volumePercentage = `${Math.round((video?.volume ?? DEFAULT_VOLUME) * 100)}%`

  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
        margin: { top: 16 * scaleFactor },
      }}
    >
      <Label
        value={label}
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
          disabled={isSoundDisabled}
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
          disabled={isSoundDisabled}
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
          disabled={isSoundDisabled}
        />
      </UiEntity>
    </UiEntity>
  )
}
