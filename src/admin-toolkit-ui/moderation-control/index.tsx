import { Entity, IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import { Header } from '../Header'
import { getScaleUIFactor } from '../../ui'
import { UsersDropdown } from './UsersDropdown'
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
  name: string
  isOwner?: boolean
  role?: 'You' | 'Owner'
  verified?: boolean
  isAdmin?: boolean
}

type State = {
  users: User[]
  selectedAdmin?: number
}
const state: State = {
  users: [
    { name: 'eziomenutti', role: 'You', verified: true, isAdmin: true },
    { name: 'pablo', isOwner: true, role: 'Owner', verified: true },
    { name: 'Unai', verified: true },
    { name: 'Maryana', verified: true, isAdmin: true },
    { name: 'superhero#0fg7', verified: false }
  ],
  selectedAdmin: undefined
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
        title="Moderation Tools"
        scaleFactor={scaleFactor}
      />
      <UsersDropdown
        scaleFactor={scaleFactor}
        options={state.users}
        selectedIndex={state.selectedAdmin}
        onSelect={(index) => {
          state.selectedAdmin = index
        }}
      />
      <CurrentAdmins scaleFactor={scaleFactor} />
    </UiEntity>
  )
}

type CurrentAdminProps = {
  scaleFactor: number
}

function CurrentAdmins({ scaleFactor }: CurrentAdminProps) {
  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
        margin: { bottom: 32 * scaleFactor },
      }}
    >
      <Label
        value="<b>Current Admins</b>"
        fontSize={18 * scaleFactor}
        color={Color4.White()}
        uiTransform={{
          margin: { bottom: 16 * scaleFactor },
        }}
      />
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {state.users.filter($ => $.isAdmin).map((admin, index) => {
          // Create the label content with formatting for role if present
          let labelContent = admin.name

          if (admin.role) {
            labelContent += ` <color=#888888>${admin.role}</color>`
          }

          return (
            <Button
              id={`admin-${admin.name}`}
              value={labelContent}
              variant="text"
              iconRight={admin.verified ? 'assets/verified-icon.png' : undefined}
              iconRightTransform={{
                width: 20 * scaleFactor,
                height: 20 * scaleFactor,
                position: { left: -10 * scaleFactor }
              }}
              uiTransform={{
                width: 'auto',
                height: 36 * scaleFactor,
                margin: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              labelTransform={{ margin: '0 10' }}
              fontSize={16 * scaleFactor}
              color={Color4.White()}
              onMouseDown={() => {
                state.selectedAdmin = state.users.findIndex($ => $.name === admin.name)
              }}
            />
          )
        })}
      </UiEntity>
    </UiEntity>
  )
}
