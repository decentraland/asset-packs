import { Entity, IEngine, RealmInfo } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import { Header } from '../Header'
import { getScaleUIFactor } from '../../ui'
import { AddUserInput } from './AddUserInput'
import { Button } from '../Button'


type Props = {
  engine: IEngine
  // state: State
}
// TODO: upload this to the content
export const BTN_MODERATION_CONTROL = `assets/moderation-control.png`
export const BTN_MODERATION_CONTROL_ACTIVE = `assets/moderation-control-active.png`
const MODERATION_CONTROL_ICON = `assets/moderation-control-icon.png`

export type User = {
  name?: string
  address: string
  role?: 'owner' | 'operator' | 'admin'
  verified?: boolean
}

type State = {
  admins: User[]
  showModalAdminList?: boolean
}
const state: State = {
  admins: [
    { name: 'eziomenutti', verified: true, role: 'owner', address: '0x1buuasbd123jsdhvg126dsagd' },
    { name: 'pablo', verified: true, role: 'operator', address: '0x1buuasbd123jsdhvg126dsagd' },
    { name: 'Unai', verified: true, role: 'admin', address: '0x1buuasbd123jsdhvg126dsagd' },
    { name: 'Maryana', verified: true, role: 'admin', address: '0x1buuasbd123jsdhvg126dsagd' },
    { name: 'superhero#0fg7', verified: false, role: 'admin', address: '0x1buuasbd123jsdhvg126dsagd' }
  ]
}

export function ModerationControl({ engine }: Props) {
  const scaleFactor = getScaleUIFactor(engine)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <Header
        iconSrc={MODERATION_CONTROL_ICON}
        title="MODERATION TOOLS"
        scaleFactor={scaleFactor}
      />
      <AddUserInput scaleFactor={scaleFactor} onSubmit={console.log} />
      <Button
        variant="secondary"
        id="moderation_control_admin_list"
        value="<b>Admin List</b>"
        fontSize={18 * scaleFactor}
        color={Color4.White()}
        uiTransform={{
          width: 165 * scaleFactor,
          height: 42 * scaleFactor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        icon="assets/verified_user.png"
        iconTransform={{
          width: 25 * scaleFactor,
          height: 25 * scaleFactor,
          margin: { left: 10 * scaleFactor },
        }}
        onMouseDown={() => state.showModalAdminList = true}
      />
    </UiEntity>
  )
}

type CurrentAdminProps = {
  scaleFactor: number
}

export function ModalAdminList({ scaleFactor }: CurrentAdminProps) {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <UiEntity
        uiTransform={{
          width: 675 * scaleFactor,
          maxHeight: 679 * scaleFactor,
          padding: 20 * scaleFactor,
          display: 'flex',
          flexDirection: 'column',
        }}
        uiBackground={{ color: Color4.Black() }}
      >
        {/* Header */}
        <UiEntity
          uiTransform={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            margin: { bottom: 24 * scaleFactor },
          }}
        >
          <UiEntity
            uiTransform={{
              width: 30 * scaleFactor,
              height: 30 * scaleFactor,
              margin: { right: 10 * scaleFactor },
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: {
                src: 'assets/verified_user.png',
              },
            }}
          />
          <Label
            value="<b>ADMIN LIST</b>"
            fontSize={24 * scaleFactor}
            color={Color4.White()}
          />
          <Label
            value={`(${state.admins.length} admins)`}
            fontSize={16 * scaleFactor}
            color={Color4.Gray()}
            uiTransform={{ margin: { left: 8 * scaleFactor } }}
          />
          <Button
            id="close-modal"
            value="✕"
            variant="text"
            fontSize={20 * scaleFactor}
            color={Color4.White()}
            uiTransform={{
              position: { right: 0 },
              positionType: 'absolute',
            }}
            onMouseDown={() => (state.showModalAdminList = false)}
          />
        </UiEntity>

        {/* Admin List */}
        <UiEntity
          uiTransform={{
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {state.admins.map((user, index) => (
            <UiEntity
              uiTransform={{ display: 'flex', flexDirection: 'column' }}
            >
              <UiEntity
                key={`admin-${user.name}`}
                uiTransform={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: 48 * scaleFactor,
                  padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
                  margin: { bottom: 10 * scaleFactor },
                }}
              >
                <UiEntity
                  uiTransform={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <UiEntity
                    uiTransform={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: { right: 10 * scaleFactor },
                    }}
                  >
                    <UiEntity
                      uiTransform={{
                        width: 30 * scaleFactor,
                        height: 30 * scaleFactor,
                      }}
                      uiBackground={{
                        textureMode: 'stretch',
                        texture: {
                          src: 'assets/person_outline.png',
                        },
                      }}
                    />
                  </UiEntity>

                  <UiEntity
                    uiTransform={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <UiEntity
                      uiTransform={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: { bottom: -6 * scaleFactor },
                      }}
                    >
                      <Label
                        value={`<b>${user.name ?? 'NAME'}</b>`}
                        fontSize={14 * scaleFactor}
                        color={Color4.White()}
                      />
                      {(user.role === 'owner' || user.role === 'operator') && (
                        <UiEntity
                          uiTransform={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 'auto',
                            height: 20 * scaleFactor,
                            padding: {
                              left: 2 * scaleFactor,
                            },
                            margin: { left: 8 * scaleFactor },
                          }}
                          uiBackground={{
                            color: Color4.fromHexString('#A09BA8'),
                          }}
                        >
                          <Label
                            value={`<b>${
                              user.role?.charAt(0).toUpperCase() +
                              user.role?.slice(1)
                            }</b>`}
                            fontSize={12 * scaleFactor}
                            color={Color4.Black()}
                          />
                        </UiEntity>
                      )}
                    </UiEntity>
                    <Label
                      fontSize={12 * scaleFactor}
                      value={user.address}
                      color={Color4.fromHexString('#716B7C')}
                    />
                  </UiEntity>
                </UiEntity>
                {/* // TODO: this should be based on the current user roles */}
                {user.role === 'admin' && (
                  <Button
                    id={`remove-${index}`}
                    value="<b>Remove</b>"
                    variant="text"
                    fontSize={14 * scaleFactor}
                    color={Color4.fromHexString('#FF2D55FF')}
                    labelTransform={{
                      margin: {
                        left: 10 * scaleFactor,
                        right: 10 * scaleFactor,
                      },
                    }}
                  />
                )}
              </UiEntity>
              <UiEntity
                uiTransform={{ width: '100%', height: 1, margin: { top: -4 * scaleFactor, bottom: 4 * scaleFactor } }}
                uiBackground={{ color: Color4.fromHexString('#43404A') }}
              />
            </UiEntity>
          ))}
        </UiEntity>

        {/* Pagination */}
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: { top: 20 * scaleFactor },
            padding: { left: 10 * scaleFactor, right: 10 * scaleFactor },
          }}
        >
          <Button
            id="prev"
            value="< Prev"
            variant="secondary"
            disabled
            fontSize={14 * scaleFactor}
            color={true ? Color4.fromHexString('#FCFCFC') : Color4.White()}
            labelTransform={{
              margin: { left: 10 * scaleFactor, right: 10 * scaleFactor },
            }}
            uiTransform={{
              // padding: { left: 12 * scaleFactor, right: 12 * scaleFactor },
              height: 32 * scaleFactor,
            }}
          />
          <Label
            value="1 / 2"
            fontSize={14 * scaleFactor}
            color={Color4.White()}
          />
          <Button
            id="next"
            value="<b>Next ></b>"
            variant="secondary"
            fontSize={14 * scaleFactor}
            color={Color4.White()}
            labelTransform={{
              margin: { left: 10 * scaleFactor, right: 10 * scaleFactor },
            }}
            uiTransform={{
              // padding: { left: 12 * scaleFactor, right: 12 * scaleFactor },
              height: 32 * scaleFactor,
            }}
          />
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}
