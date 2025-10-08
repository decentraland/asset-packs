import { IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'

import { Button } from '../Button'
import { RemoveAdminConfirmation } from './RemoveAdminConfirmation'
import { moderationControlState, SceneAdmin } from '.'
import { CONTENT_URL } from '../constants'
import {
  getModalStyles,
  getModalBackgrounds,
  getModalColors,
  getPaginationColor,
} from './styles/AdminList'

type CurrentAdminProps = {
  scaleFactor: number
  sceneAdmins: SceneAdmin[]
  engine: IEngine
}

const ADMINS_PER_PAGE = 5

const ICONS = {
  BACK: `${CONTENT_URL}/admin_toolkit/assets/icons/chevron-back.png`,
  NEXT: `${CONTENT_URL}/admin_toolkit/assets/icons/chevron-forward.png`,
  CLOSE: `${CONTENT_URL}/admin_toolkit/assets/icons/close.png`,
}

export function ModalAdminList({
  scaleFactor,
  sceneAdmins,
  engine,
}: CurrentAdminProps) {
  const [page, setPage] = ReactEcs.useState(1)
  const styles = getModalStyles(scaleFactor)
  const backgrounds = getModalBackgrounds()
  const colors = getModalColors()

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
    <UiEntity uiTransform={styles.overlay}>
      <UiEntity
        uiTransform={styles.container}
        uiBackground={backgrounds.container}
      >
        <UiEntity uiTransform={styles.content}>
          <UiEntity uiTransform={styles.header}>
            <UiEntity
              uiTransform={styles.headerIcon}
              uiBackground={backgrounds.headerIcon}
            />
            <Label
              value="<b>ADMIN LIST</b>"
              fontSize={24 * scaleFactor}
              color={colors.white}
            />
            <Label
              value={`(${sceneAdmins.length} admins)`}
              fontSize={16 * scaleFactor}
              color={colors.gray}
              uiTransform={styles.adminCount}
            />
            <Button
              id="close-modal"
              onlyIcon
              icon={ICONS.CLOSE}
              variant="secondary"
              fontSize={20 * scaleFactor}
              uiTransform={styles.closeButton}
              iconTransform={styles.closeIcon}
              onMouseDown={() =>
                (moderationControlState.showModalAdminList = false)
              }
            />
          </UiEntity>

          <UiEntity uiTransform={styles.listContainer}>
            {currentPageAdmins.map((user, index) => (
              <UiEntity key={user.address} uiTransform={styles.adminItem}>
                <UiEntity
                  key={`admin-${user.name}`}
                  uiTransform={styles.adminRow}
                >
                  <UiEntity uiTransform={styles.adminInfo}>
                    <UiEntity uiTransform={styles.personIconContainer}>
                      <UiEntity
                        uiTransform={styles.personIcon}
                        uiBackground={backgrounds.personIcon}
                      />
                    </UiEntity>

                    <UiEntity uiTransform={styles.adminDetails}>
                      {user.name && (
                        <UiEntity uiTransform={styles.nameContainer}>
                          <Label
                            value={`<b>${user.name}</b>`}
                            fontSize={14 * scaleFactor}
                            color={colors.white}
                          />
                          {!user.name.includes('#') && (
                            <UiEntity
                              uiTransform={styles.verifiedIcon}
                              uiBackground={backgrounds.verifiedIcon}
                            />
                          )}
                          {(user.role === 'owner' ||
                            user.role === 'operator') && (
                            <UiEntity
                              uiTransform={styles.roleBadge}
                              uiBackground={backgrounds.roleBadge}
                            >
                              <Label
                                value={`<b>${
                                  (user.role ?? '')?.charAt(0).toUpperCase() +
                                  user.role?.slice(1)
                                }</b>`}
                                fontSize={12 * scaleFactor}
                                color={colors.black}
                              />
                            </UiEntity>
                          )}
                        </UiEntity>
                      )}
                      <Label
                        fontSize={(user.name ? 12 : 14) * scaleFactor}
                        value={user.name ? user.address : `${user.address}`}
                        color={user.name ? colors.addressGray : colors.white}
                      />
                    </UiEntity>
                  </UiEntity>
                  {user.canBeRemoved && (
                    <Button
                      id={`remove-${index}`}
                      value="<b>Remove</b>"
                      variant="text"
                      fontSize={14 * scaleFactor}
                      color={colors.removeRed}
                      labelTransform={styles.removeButton}
                      onMouseDown={() => {
                        moderationControlState.adminToRemove = user
                      }}
                    />
                  )}
                </UiEntity>
                <UiEntity
                  uiTransform={styles.divider}
                  uiBackground={backgrounds.divider}
                />
              </UiEntity>
            ))}
          </UiEntity>
        </UiEntity>

        {sceneAdmins.length > ADMINS_PER_PAGE && (
          <UiEntity uiTransform={styles.pagination}>
            <Button
              id="prev"
              value="Prev"
              variant="secondary"
              disabled={page <= 1}
              fontSize={18 * scaleFactor}
              icon={ICONS.BACK}
              iconTransform={styles.prevIcon}
              iconBackground={{ color: getPaginationColor(page <= 1) }}
              color={getPaginationColor(page <= 1)}
              labelTransform={styles.prevLabel}
              uiTransform={styles.paginationButton}
              onMouseDown={() => setPage(page - 1)}
            />
            <Label
              value={`${page} / ${Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE)}`}
              fontSize={14 * scaleFactor}
              color={colors.white}
            />
            <Button
              id="next"
              value="<b>Next</b>"
              variant="secondary"
              fontSize={18 * scaleFactor}
              iconRight={ICONS.NEXT}
              iconRightTransform={styles.nextIcon}
              labelTransform={styles.nextLabel}
              iconRightBackground={{
                color: getPaginationColor(
                  page >= Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE),
                ),
              }}
              color={getPaginationColor(
                page >= Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE),
              )}
              disabled={page >= Math.ceil(sceneAdmins.length / ADMINS_PER_PAGE)}
              uiTransform={styles.paginationButton}
              onMouseDown={() => setPage(page + 1)}
            />
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}
