import { IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'

import { Button } from '../Button'
import { RemoveAdminConfirmation } from './RemoveAdminConfirmation'
import { moderationControlState, SceneAdmin } from '.'


type CurrentAdminProps = {
  scaleFactor: number
  sceneAdmins: SceneAdmin[]
  engine: IEngine
}

export function ModalAdminList({
  scaleFactor,
  sceneAdmins,
  engine,
}: CurrentAdminProps) {
  if (moderationControlState.adminToRemove) {
    return (
      <RemoveAdminConfirmation
        scaleFactor={scaleFactor}
        admin={moderationControlState.adminToRemove}
        engine={engine}
      />
    )
  }
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
          minHeight: 279 * scaleFactor,
          padding: 20 * scaleFactor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        uiBackground={{ color: Color4.Black() }}
      >
        {/* Header and Admin List container */}
        <UiEntity
          uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
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
              value={`(${sceneAdmins.length} admins)`}
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
              onMouseDown={() =>
                (moderationControlState.showModalAdminList = false)
              }
            />
          </UiEntity>

          {/* Admin List */}
          <UiEntity
            uiTransform={{
              flexDirection: 'column',
              width: '100%',
            }}
          >
            {sceneAdmins.map((user, index) => (
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
                        {(user.role === 'owner' ||
                          user.role === 'operator') && (
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
                              borderRadius: 8,
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
                        uiTransform={{ margin: { top: 10 } }}
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
                      onMouseDown={() => {
                        moderationControlState.adminToRemove = user
                      }}
                    />
                  )}
                </UiEntity>
                <UiEntity
                  uiTransform={{
                    width: '100%',
                    height: 1,
                    margin: { top: -4 * scaleFactor, bottom: 4 * scaleFactor },
                  }}
                  uiBackground={{ color: Color4.fromHexString('#43404A') }}
                />
              </UiEntity>
            ))}
          </UiEntity>
        </UiEntity>

        {/* Pagination - now will stay at bottom */}
        {sceneAdmins.length > 6 && (
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
              color={true ? Color4.fromHexString('#323232') : Color4.White()}
              labelTransform={{
                margin: { left: 10 * scaleFactor, right: 10 * scaleFactor },
              }}
              uiTransform={{
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
              value="<b>Next</b>"
              variant="secondary"
              fontSize={14 * scaleFactor}
              color={Color4.White()}
              labelTransform={{
                margin: { left: 10 * scaleFactor, right: 10 * scaleFactor },
              }}
              uiTransform={{
                height: 32 * scaleFactor,
              }}
            />
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}
