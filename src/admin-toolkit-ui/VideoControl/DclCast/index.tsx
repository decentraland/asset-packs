import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { Button } from '../../Button'
import { getScaleUIFactor } from '../../../ui'
import { IEngine } from '@dcl/ecs'
import { getRoomId } from '../api'
import { CONTENT_URL } from '../../constants'
import { Header } from '../../Header'

const ICONS = {
  VIDEO_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control.png`,
  HELP_ICON: `${CONTENT_URL}/admin_toolkit/assets/icons/help.png`,
} as const

const DclCast = ({ engine }: { engine: IEngine }) => {
  const scaleFactor = getScaleUIFactor(engine)

  return (
    <UiEntity
      uiTransform={{ flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            alignItems: 'center',
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
          height: '100%',
          margin: { bottom: 6 * scaleFactor },
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
            bottom: 24 * scaleFactor,
          },
        }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              alignItems: 'flex-start',
            }}
          >
            <Label
              value={'Room ID'}
              uiTransform={{
                margin: { bottom: 16 * scaleFactor },
              }}
              fontSize={24 * scaleFactor}
              color={Color4.White()}
            />
            <Label
              value={'Expires in 4 days'}
              uiTransform={{
                margin: { top: 12 * scaleFactor },
              }}
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
            uiBackground={{ color: Color4.fromHexString('#34CE77') }}
            uiTransform={{
              padding: {
                top: 6 * scaleFactor,
                bottom: 6 * scaleFactor,
                left: 4 * scaleFactor,
                right: 4 * scaleFactor,
              },
              borderRadius: 6 * scaleFactor,
              width: '100%',
              height: 36 * scaleFactor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </UiEntity>

        {/* <Button
          id="dcl_cast_get_room_id"
          value="<b>Get Room ID</b>"
          variant="text"
          fontSize={16 * scaleFactor}
          color={Color4.White()}
          uiTransform={{
            minWidth: 120 * scaleFactor,
            margin: { right: 8 * scaleFactor },
            padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
          }}
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
        /> */}
      </UiEntity>
    </UiEntity>
  )
}

export default DclCast
