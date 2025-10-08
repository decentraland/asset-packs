import { IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity } from '@dcl/react-ecs'

import { Header } from '../Header'
import { getScaleUIFactor } from '../../ui'
import { AddUserInput, PermissionType } from './AddUserInput'
import { Button } from '../Button'
import { GetPlayerDataRes } from '../../types'
import { Card } from '../Card'
import { CONTENT_URL } from '../constants'
import {
  getModerationControlStyles,
  getModerationControlColors,
} from './styles/ModerationControlStyles'

type Props = {
  engine: IEngine
  player: GetPlayerDataRes | null | undefined
}

// TODO: upload this to the content
export const BTN_MODERATION_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-moderation-control-button.png`
export const MODERATION_CONTROL_ICON = `${CONTENT_URL}/admin_toolkit/assets/icons/moderation-control-icon.png`
const VERIFIED_USER_ICON = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-verified-user.png`

export type SceneAdmin = {
  name?: string
  address: string
  role?: 'owner' | 'operator' | 'admin'
  verified?: boolean
  canBeRemoved: boolean
}

type State = {
  showModalAdminList?: boolean
  adminToRemove?: SceneAdmin
  showModalBanList?: boolean
}
export const moderationControlState: State = {
  showModalAdminList: false,
  showModalBanList: false,
  adminToRemove: undefined,
}

export function ModerationControl({ engine, player }: Props) {
  const scaleFactor = getScaleUIFactor(engine)
  const styles = getModerationControlStyles(scaleFactor)
  const colors = getModerationControlColors()

  return (
    <Card scaleFactor={scaleFactor}>
      <UiEntity uiTransform={styles.container}>
        <Header
          iconSrc={MODERATION_CONTROL_ICON}
          title="PERMISSIONS & MODERATION"
          scaleFactor={scaleFactor}
        />
        <AddUserInput
          scaleFactor={scaleFactor}
          onSubmit={console.log}
          type={PermissionType.ADMIN}
        />
        <Button
          variant="secondary"
          id="moderation_control_admin_list"
          value="<b>View Admin List</b>"
          fontSize={18 * scaleFactor}
          color={colors.white}
          uiTransform={styles.adminListButton}
          icon={VERIFIED_USER_ICON}
          iconTransform={styles.adminListIcon}
          onMouseDown={() => (moderationControlState.showModalAdminList = true)}
        />
        <UiEntity uiTransform={styles.divider} />
        <AddUserInput
          scaleFactor={scaleFactor}
          onSubmit={console.log}
          type={PermissionType.BAN}
        />
        <Button
          variant="secondary"
          id="moderation_control_ban_list"
          value="<b>View Ban List</b>"
          fontSize={18 * scaleFactor}
          color={colors.white}
          uiTransform={styles.banListButton}
          icon={VERIFIED_USER_ICON}
          iconTransform={styles.banListIcon}
          onMouseDown={() => (moderationControlState.showModalBanList = true)}
        />
      </UiEntity>
    </Card>
  )
}
