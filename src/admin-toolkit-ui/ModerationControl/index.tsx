import { IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity } from '@dcl/react-ecs'

import { Header } from '../Header'
import { getScaleUIFactor } from '../../ui'
import { AddUserInput } from './AddUserInput'
import { Button } from '../Button'
import { GetPlayerDataRes } from '../../types'
import { Card } from '../Card'
import { CONTENT_URL } from '../constants'


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
}
export const moderationControlState: State = {
  showModalAdminList: false,
  adminToRemove: undefined
}

export function ModerationControl({ engine, player }: Props) {
  const scaleFactor = getScaleUIFactor(engine)

  return (
    <Card scaleFactor={scaleFactor}>
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <Header
          iconSrc={MODERATION_CONTROL_ICON}
          title="PERMISSIONS"
          scaleFactor={scaleFactor}
        />
        <AddUserInput scaleFactor={scaleFactor} onSubmit={console.log} />
        <Button
          variant="secondary"
          id="moderation_control_admin_list"
          value="<b>View Admin List</b>"
          fontSize={18 * scaleFactor}
          color={Color4.White()}
          uiTransform={{
            width: 220 * scaleFactor,
            height: 42 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          icon={VERIFIED_USER_ICON}
          iconTransform={{
            width: 25 * scaleFactor,
            height: 25 * scaleFactor,
            margin: { right: 10 * scaleFactor },
          }}
          onMouseDown={() => (moderationControlState.showModalAdminList = true)}
        />
      </UiEntity>
    </Card>
  )
}

