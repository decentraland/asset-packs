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

const ADMINS_PER_PAGE = 5

export function ModalAdminList({
  scaleFactor,
  sceneAdmins,
  engine,
}: CurrentAdminProps) {
  const [page, setPage] = ReactEcs.useState(1)
  if (moderationControlState.adminToRemove) {
    return (
      <RemoveAdminConfirmation
        scaleFactor={scaleFactor}
        admin={moderationControlState.adminToRemove}
        engine={engine}
      />
    )
  }
  const startIndex = (page - 1) * ADMINS_PER_PAGE
  const endIndex = Math.min(startIndex + ADMINS_PER_PAGE, sceneAdmins.length)
  const currentPageAdmins = sceneAdmins.slice(startIndex, endIndex)
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
          minHeight: 479 * scaleFactor,
          padding: 20 * scaleFactor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 12 * scaleFactor,
        }}
        uiBackground={{ color: Color4.Black() }}
      >
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
              onlyIcon
              icon="assets/close.png"
              variant="secondary"
              fontSize={20 * scaleFactor}
              uiTransform={{
                position: { right: 0 },
                positionType: 'absolute',
                borderColor: Color4.Clear(),
              }}
              iconTransform={{
                width: 32 * scaleFactor,
                height: 32 * scaleFactor,
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
              margin: { top: 16 * scaleFactor },
            }}
          >
            {currentPageAdmins.map((user, index) => (
              <UiEntity
                key={user.address}
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
                      uiTransform={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      {user.name && (
                        <UiEntity
                          uiTransform={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Label
                            value={`<b>${user.name}</b>`}
                            fontSize={14 * scaleFactor}
                            color={Color4.White()}
                          />
                          {!user.name.includes('#') && (
                            <UiEntity
                              uiTransform={{
                                width: 14 * scaleFactor,
                                height: 14 * scaleFactor,
                              }}
                              uiBackground={{
                                textureMode: 'stretch',
                                texture: {
                                  src: 'assets/verified.png',
                                },
                                color: Color4.White(),
                              }}
                            />
                          )}
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
                                  left: 4 * scaleFactor,
                                },
                                margin: { left: 8 * scaleFactor },
                                borderRadius: 4 * scaleFactor,
                              }}
                              uiBackground={{
                                color: Color4.fromHexString('#A09BA8'),
                              }}
                            >
                              <Label
                                value={`<b>${
                                  (user.role ?? '')?.charAt(0).toUpperCase() +
                                  user.role?.slice(1)
                                }</b>`}
                                fontSize={12 * scaleFactor}
                                color={Color4.Black()}
                              />
                            </UiEntity>
                          )}
                        </UiEntity>
                      )}
                      <Label
                        fontSize={(user.name ? 12 : 14) * scaleFactor}
                        value={user.name ? user.address : `${user.address}`}
                        color={
                          user.name
                            ? Color4.fromHexString('#716B7C')
                            : Color4.White()
                        }
                      />
                    </UiEntity>
                  </UiEntity>
                  {user.canBeRemoved && (
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

        {sceneAdmins.length > ADMINS_PER_PAGE && (
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
              value="Prev"
              variant="secondary"
              disabled={page <= 1}
              fontSize={18 * scaleFactor}
              icon="assets/chevron-back.png"
              iconTransform={{
                width: 25 * scaleFactor,
                height: 25 * scaleFactor,
                margin: { left: 8 * scaleFactor },
              }}
              iconBackground={{
                color:
                  page <= 1 ? Color4.fromHexString('#323232') : Color4.White(),
              }}
              color={
                page <= 1 ? Color4.fromHexString('#323232') : Color4.White()
              }
              labelTransform={{
                margin: { right: 10 * scaleFactor },
              }}
              uiTransform={{
                height: 42 * scaleFactor,
                alignItems: 'center',
              }}
              onMouseDown={() => setPage(page - 1)}
            />
            <Label
              value={`${page} / ${Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE)}`}
              fontSize={14 * scaleFactor}
              color={Color4.White()}
            />
            <Button
              id="next"
              value="<b>Next</b>"
              variant="secondary"
              fontSize={18 * scaleFactor}
              iconRight="assets/chevron-forward.png"
              iconRightTransform={{
                width: 25 * scaleFactor,
                height: 25 * scaleFactor,
                margin: { right: 8 * scaleFactor },
              }}
              labelTransform={{
                margin: { left: 10 * scaleFactor },
              }}
              iconBackground={{
              color: page >= Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE)
                  ? Color4.fromHexString('#323232')
                  : Color4.White()
              }}
              color={
                page >= Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE)
                  ? Color4.fromHexString('#323232')
                  : Color4.White()
              }
              disabled={page >= Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE)}
              uiTransform={{
                alignItems: 'center',
                height: 42 * scaleFactor,
              }}
              onMouseDown={() => setPage(page + 1)}
            />
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}
