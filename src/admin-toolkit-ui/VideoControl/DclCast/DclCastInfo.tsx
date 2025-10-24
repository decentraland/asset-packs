import { Entity, IEngine } from '@dcl/ecs'
import { DeepReadonlyObject, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { Button } from '../../Button'
import { State } from '../../types'
import { openExternalUrl } from '~system/RestrictedActions'
import { VideoControlVolume } from '../VolumeControl'
import { DCL_CAST_TYPE } from '../../../definitions'
import { createVideoPlayerControls } from '../utils'

const ICONS = {
  LINK_ICON:
    'https://builder-items.decentraland.zone/admin_toolkit/assets/icons/open-link.png',
}

const DclCastInfo = ({
  scaleFactor,
  state,
  engine,
  onResetRoomId,
  entity,
  video,
}: {
  scaleFactor: number
  state: State
  engine: IEngine
  onResetRoomId: () => Promise<void>
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
}) => {
  const controls = createVideoPlayerControls(entity, engine)
  return (
    <UiEntity
      uiTransform={{ flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          borderWidth: 2 * scaleFactor,
          borderColor: Color4.fromHexString('#716B7C'),
          flexDirection: 'column',
          borderRadius: 12 * scaleFactor,
          padding: {
            left: 16 * scaleFactor,
            right: 16 * scaleFactor,
            top: 24 * scaleFactor,
            bottom: 8 * scaleFactor,
          },
        }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            margin: { bottom: 18 * scaleFactor },
          }}
        >
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: 'auto',
            }}
          >
            <Label
              value={'<b>Room ID</b>'}
              fontSize={24 * scaleFactor}
              color={Color4.White()}
            />
            <Label
              value={`Expires in ${state.videoControl.dclCast?.expiresInDays} days`}
              fontSize={14 * scaleFactor}
              color={Color4.fromHexString('#716B7C')}
              uiTransform={{
                margin: { top: -4 * scaleFactor },
              }}
            />
          </UiEntity>
          {/* TODO: ADD IS_DCL_CAST TO UTILS */}
          {video?.src.startsWith(DCL_CAST_TYPE) ? (
            <Button
              id="dcl_cast_deactivate"
              value="<b>Deactivate</b>"
              variant="text"
              fontSize={16 * scaleFactor}
              color={Color4.White()}
              uiTransform={{
                minWidth: 120 * scaleFactor,
                margin: { right: 8 * scaleFactor },
                padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
              }}
              onMouseDown={() => {
                controls.setSource('')
              }}
            />
          ) : (
            <Button
              id="dcl_cast_activate"
              value="<b>Activate</b>"
              labelTransform={{
                margin: { left: 20 * scaleFactor, right: 20 * scaleFactor },
              }}
              uiTransform={{
                minWidth: 120 * scaleFactor,
              }}
              fontSize={16 * scaleFactor}
              uiBackground={{ color: Color4.fromHexString('#34CE77') }}
              color={Color4.Black()}
              onMouseDown={() => {
                controls.setSource(state.videoControl.dclCast?.streamLink || '')
              }}
            />
          )}
        </UiEntity>
        <UiEntity
          uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'flex-start',
          }}
        >
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              margin: { bottom: 8 * scaleFactor },
            }}
          >
            <UiEntity
              uiTransform={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Label
                value={'<b>Cast speakers</b>'}
                fontSize={18 * scaleFactor}
                color={Color4.White()}
              />
              <UiEntity
                uiText={{
                  value: 'This link grants streaming access.',
                  fontSize: 14 * scaleFactor,
                  color: Color4.fromHexString('#716B7C'),
                  textAlign: 'top-left',
                }}
              />
            </UiEntity>
            <UiEntity
              uiTransform={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onMouseDown={() => {
                state.videoControl.dclCast?.streamLink &&
                  openExternalUrl({
                    url: state.videoControl.dclCast?.streamLink,
                  })
              }}
            >
              <UiEntity
                uiTransform={{
                  width: 20 * scaleFactor,
                  height: 20 * scaleFactor,
                }}
                uiBackground={{
                  texture: {
                    src: ICONS.LINK_ICON,
                  },
                  textureMode: 'stretch',
                }}
              />
              <Label
                value={'<b>Open Link</b>'}
                fontSize={18 * scaleFactor}
                color={Color4.White()}
                uiTransform={{ margin: { left: 4 * scaleFactor } }}
              />
            </UiEntity>
          </UiEntity>
          <UiEntity
            uiTransform={{
              margin: { top: 16 * scaleFactor, bottom: 16 * scaleFactor },
              width: '100%',
              height: 1,
              borderWidth: 1,
              borderColor: Color4.fromHexString('#43404A'),
            }}
          />
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <UiEntity
              uiTransform={{
                display: 'flex',
                flexDirection: 'column',
                margin: { bottom: 4 * scaleFactor },
              }}
            >
              <Label
                value={'<b>Viewers</b>'}
                fontSize={18 * scaleFactor}
                color={Color4.White()}
              />
              <UiEntity
                uiText={{
                  value: 'This link grants viewing access.',
                  fontSize: 14 * scaleFactor,
                  color: Color4.fromHexString('#716B7C'),
                  textAlign: 'top-left',
                }}
              />
            </UiEntity>
            <UiEntity
              uiTransform={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onMouseDown={() => {
                state.videoControl.dclCast?.watcherLink &&
                  openExternalUrl({
                    url: state.videoControl.dclCast?.watcherLink,
                  })
              }}
            >
              <UiEntity
                uiTransform={{
                  width: 20 * scaleFactor,
                  height: 20 * scaleFactor,
                }}
                uiBackground={{
                  texture: {
                    src: ICONS.LINK_ICON,
                  },
                  textureMode: 'stretch',
                }}
              />
              <Label
                value={'<b>Open Link</b>'}
                fontSize={18 * scaleFactor}
                color={Color4.White()}
                uiTransform={{ margin: { left: 4 * scaleFactor } }}
              />
            </UiEntity>
          </UiEntity>
        </UiEntity>
      </UiEntity>
      <UiEntity
        uiTransform={{
          display: 'flex',
          flexDirection: 'column',
          margin: { top: 8 * scaleFactor },
        }}
      >
        <VideoControlVolume
          engine={engine}
          entity={entity}
          video={video}
          label="<b>Cast volume</b>"
        />
        <Button
          id="dcl_rese_room"
          value="<b>Reset Room ID</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.Red()}
          onMouseDown={onResetRoomId}
          uiTransform={{
            padding: {
              top: 6 * scaleFactor,
              bottom: 6 * scaleFactor,
              left: 4 * scaleFactor,
              right: 4 * scaleFactor,
            },
            width: 'auto',
            height: 36 * scaleFactor,
            margin: { top: 12 * scaleFactor },
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

export default DclCastInfo
