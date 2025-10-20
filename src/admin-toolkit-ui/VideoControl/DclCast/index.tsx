import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { Button } from '../../Button'
import { getScaleUIFactor } from '../../../ui'
import { IEngine } from '@dcl/ecs'
import { getRoomId, RoomIdResponse } from '../api'
import { CONTENT_URL } from '../../constants'

const ICONS = {
  VIDEO_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control.png`,
  HELP_ICON: `${CONTENT_URL}/admin_toolkit/assets/icons/help.png`,
} as const

const DclCast = ({ engine }: { engine: IEngine }) => {
  const scaleFactor = getScaleUIFactor(engine)
  const [roomId, setRoomId] = ReactEcs.useState<RoomIdResponse | undefined>({
    streamLink: '',
    watcherLink: '',
    streamingKey: '',
    placeId: '',
    placeName: '',
    expiresAt: 0,
    expiresInDays: 0,
  })

  ReactEcs.useEffect(() => {
    async function getRoomIdFn() {
      const [error, data] = await getRoomId()
      if (error) {
        console.error(error)
      } else {
        console.log('Room ID Data:', data)
        data &&
          Object.keys(data).forEach((key) => {
            console.log(
              `ALE - Key: ${key}, Value:`,
              data?.[key as keyof typeof data],
            )
          })
      }
    }
    getRoomIdFn()
  }, [])

  return (
    <UiEntity
      uiTransform={{ flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: { bottom: 12 * scaleFactor },
          }}
        >
          <UiEntity
            uiTransform={{ width: 30 * scaleFactor, height: 30 * scaleFactor }}
            uiBackground={{
              textureMode: 'stretch',
              texture: {
                src: ICONS.VIDEO_CONTROL,
              },
              color: Color4.White(),
            }}
          />
          <Label
            value={`<b>DCL Cast</b>`}
            uiTransform={{
              margin: { bottom: 2 * scaleFactor, left: 10 * scaleFactor },
            }}
            fontSize={24 * scaleFactor}
            color={Color4.White()}
          />
        </UiEntity>
        <UiEntity
          uiTransform={{
            width: 24 * scaleFactor,
            height: 24 * scaleFactor,
          }}
          uiBackground={{
            texture: {
              src: ICONS.HELP_ICON,
            },
            textureMode: 'stretch',
            color: Color4.White(),
          }}
        />
      </UiEntity>
      <UiEntity
        uiTransform={{
          width: '100%',
          margin: { bottom: 24 * scaleFactor },
        }}
      >
        <UiEntity
          uiText={{
            value:
              'Generate your room ID and use <u>DCL Cast</u> to let others join your cast or watch live.',
            fontSize: 16 * scaleFactor,
            color: Color4.fromHexString('#A09BA8'),

            textAlign: 'top-left',
            textWrap: 'wrap',
          }}
          uiTransform={{
            margin: { bottom: 8 * scaleFactor },
          }}
        />
      </UiEntity>
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
            bottom: 16 * scaleFactor,
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
              value={'Room ID'}
              fontSize={24 * scaleFactor}
              color={Color4.White()}
            />
            <Label
              value={'Expires in 4 days'}
              fontSize={14 * scaleFactor}
              color={Color4.fromHexString('#716B7C')}
            />
          </UiEntity>
          <Button
            id="dcl_cast_get_room_id"
            value="<b>Activate</b>"
            variant="text"
            fontSize={16 * scaleFactor}
            color={Color4.White()}
            // TODO: remove from here
            onMouseDown={async () => {
              const [error, data] = await getRoomId()
              if (error) {
                console.error(error)
              } else {
                console.log('Room ID Data:', data)
                data &&
                  Object.keys(data).forEach((key) => {
                    console.log(
                      `ALE - Key: ${key}, Value:`,
                      data?.[key as keyof typeof data],
                    )
                  })
              }
            }}
            uiBackground={{ color: Color4.fromHexString('#34CE77') }}
            uiTransform={{
              padding: {
                top: 6 * scaleFactor,
                bottom: 6 * scaleFactor,
                left: 4 * scaleFactor,
                right: 4 * scaleFactor,
              },
              borderRadius: 6 * scaleFactor,
              width: 'auto',
              height: 36 * scaleFactor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
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
            <Label
              value={'<b>Cast speakers</b>'}
              fontSize={18 * scaleFactor}
              color={Color4.White()}
            />
            <Label
              value={'<b>Open Link</b>'}
              fontSize={18 * scaleFactor}
              color={Color4.White()}
            />
          </UiEntity>
          <UiEntity
            uiTransform={{
              margin: { top: 18 * scaleFactor, bottom: 18 * scaleFactor },
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
            <Label
              value={'<b>Viewers</b>'}
              fontSize={18 * scaleFactor}
              color={Color4.White()}
            />
            <Label
              value={'<b>Open Link</b>'}
              fontSize={18 * scaleFactor}
              color={Color4.White()}
            />
          </UiEntity>
        </UiEntity>
      </UiEntity>
      <UiEntity
        uiTransform={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          margin: { top: 8 * scaleFactor },
        }}
      >
        <Button
          id="dcl_rese_room"
          value="<b>Reset Room ID</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.Red()}
          uiTransform={{
            padding: {
              top: 6 * scaleFactor,
              bottom: 6 * scaleFactor,
              left: 4 * scaleFactor,
              right: 4 * scaleFactor,
            },
            width: 'auto',
            height: 36 * scaleFactor,
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

export default DclCast
