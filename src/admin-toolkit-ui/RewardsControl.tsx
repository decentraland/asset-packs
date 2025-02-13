import { Entity, IEngine } from '@dcl/ecs'
import ReactEcs, { UiEntity, Label, Dropdown } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { State } from './types'
import { Button } from './Button'
import {
  AdminTools,
  getActionEvents,
  getComponents,
  getPayload,
} from '../definitions'

const ICONS = {
  REWARDS_CONTROL:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKmSURBVHgB7VrbddswDIVs2d8awdnAnaDaoCPUI7QT1Jmg6QRJJ3A2iDaIM0HSCaJvP3vhA+YwNB9SHgyT8J6jI5sEKFwCBElRRBkZGZ8WBT0D+/2+Wq/Xs6IoKlx3w+Gw4XtXfejWuNUHQ4piWZblJb0Fttvt781mszcvlP8K6aITJpC9sujech3FBBusGXGOHp7jvlBlq9Xqh0uXvclGi+w9dM9YXy+LRkh6VRk91euE1KFOQugIyiPihcqoW4juGcUAHjaTB1rjWyN01MMqNF3hxJ0jurcUA8pYX+/BqAvTaC00702P6lCepRhQnuFwccnIuLgWQteaDl8zlx6HptKhGGBDuXdDmYs9og1qNY7mXeR9CcSHJ80z0rvnhwYwr8CQO2vjRTHRxkaLa+mQqyA3ld9LzFdf6AnoRIbdPxgMvunZBw+tXymFcmJpbRW73e5mNBpduiZmLxmJ/QXJLJ0KQGYO750elfuUZJDXlCDgpZ/j8fhRRnWS0cdFomjhnRN46SEkS4/wV1dFn8XkS0DGamUUc1blpNGoAh+Zia3Q5t4Y4LlHZTwFzpb6/wH1BKdOegOASBuS6U0mZXwoMmVPecLkySvfoMtfAdOQQG8y5iBMCb3JcDbzJQH2HBN2yYXqQ+36ZHqTYQOwPmpc9SoEXXKh+lC7PjgTAHrhhhKHuVp3ksFrnzlC4S8lChA5NT3rJMNrHsz0M9KWC4mhMQvypJkqMplUkcmkikwmVWQyqSKTSRWZTKoI7jSxp/mHLevDfz4NwPlJi72EdeeHl3WHu3Gc0bneBuwyJyLvlQseafDBD++/KSHINwcnZnkwzOCBi9jvlkNw7YA7HTZxOKCBq+gfHNht+YMOth4Tdj4GlDPHGj+/my+sYwDPXwqRhjLeGf4Do8hiXTHNwhkAAAAASUVORK5CYII=',
  SEND: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAzCAYAAADVY1sUAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGJSURBVHgB7ZnBTcMwFIb/qgzQDfAGMAKjMApsABMAE8AG6RjcmiM9wZEb+KmOklqO4yT2s1/lT3pKa1WVP/tP4jhApVKpSGLraLszxx8Ip9H1retFl4JgDrr+BvWOfpZEYYt0Re33unYQwpjIUEhE7KZExMRujkjRsVsiUmTs1ogUFbtYItljF1skW+xSibDHjkOEJXacIkljl0Nkdew2jjaa5lvreDP4zkWr61HXBwIeKTaYj08yRdZbXXucpNqxHy0R8ZF6Nml2nnESOyO2yBSxZrOFFbstePkynfg0dTRFbb8Iv2rtTB3N/ySdEYV+tOnzNfqRV1iOM15rRLpRGXZUoe9szBOf4kOdf8LIFWxKRCHNqIay1/WGwEuwDd1h6aZIOymiboo2ByBL52ngHhAxktwiDRItHLlEki/lU4pEjw+3SIMMj7sxRbJuQKwVYY2Pj6UiDQrbpJsrUuy2aYhIMfHx4RMpLj4+XCIiX/Z0IiLi03HlaKNlMy2ZX3EBL0QrlUqlkpR/O2Agp3mek0UAAAAASUVORK5CYII=',
} as const

// Helper Functions
function getAdminToolkitRewardsControl(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  return adminToolkitEntities.length > 0
    ? adminToolkitEntities[0][1].rewardsControl
    : null
}

function getRewardItems(
  engine: IEngine,
): NonNullable<AdminTools['rewardsControl']['rewardItems']> {
  const adminToolkitRewardsControl = getAdminToolkitRewardsControl(engine)

  if (
    !adminToolkitRewardsControl ||
    !adminToolkitRewardsControl.rewardItems ||
    adminToolkitRewardsControl.rewardItems.length === 0
  )
    return []

  return Array.from(adminToolkitRewardsControl.rewardItems)
}

export function RewardsControl({
  engine,
  state,
}: {
  engine: IEngine
  state: State
}) {
  const rewardItems = getRewardItems(engine)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          margin: { bottom: 32 },
          height: 30,
        }}
      >
        <UiEntity
          uiTransform={{ width: 30, height: 30 }}
          uiBackground={{
            color: Color4.White(),
            textureMode: 'stretch',
            texture: { src: ICONS.REWARDS_CONTROL },
          }}
        />
        <Label value="<b>AIRDROPS</b>" fontSize={24} color={Color4.White()} />
      </UiEntity>

      <UiEntity
        uiTransform={{ flexDirection: 'column', margin: { bottom: 32 } }}
      >
        <Label
          value="<b>Selected Airdrop</b>"
          fontSize={16}
          color={Color4.White()}
          uiTransform={{ margin: { bottom: 16 } }}
        />

        <Dropdown
          acceptEmpty
          emptyLabel="Select your airdrop"
          options={[...rewardItems.map((item) => item.customName)]}
          selectedIndex={state.rewardsControl.selectedRewardItem ?? -1}
          onChange={(idx) => (state.rewardsControl.selectedRewardItem = idx)}
          textAlign="middle-left"
          uiTransform={{
            width: '100%',
            height: '40px',
          }}
          uiBackground={{ color: Color4.White() }}
          color={Color4.Black()}
        />
      </UiEntity>

      <UiEntity uiTransform={{ flexDirection: 'column' }}>
        <Label
          value="<b>Actions</b>"
          fontSize={16}
          color={Color4.White()}
          uiTransform={{ margin: { bottom: 16 } }}
        />

        <UiEntity uiTransform={{ flexDirection: 'row' }}>
          <Button
            id="rewards_control_release"
            value="<b>Release</b>"
            fontSize={16}
            uiTransform={{
              margin: { right: 16 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            icon={ICONS.SEND}
            iconTransform={{ height: 25, width: 25 }}
            onMouseDown={() => handleRelease(engine, state)}
            disabled={state.rewardsControl.selectedRewardItem === undefined}
          />
          <Button
            id="rewards_control_clear"
            value="<b>Clear</b>"
            fontSize={16}
            onMouseDown={() => handleClear(engine, state)}
            disabled={state.rewardsControl.selectedRewardItem === undefined}
          />
        </UiEntity>

        {/* TODO: Get supply values from rewards-server, it required a signedFetch but the one sent by the explorer is rejected */}
        {/* <Label
          value={`Redeemed: ${state.rewardsControl.redeemedCount}/`}
          fontSize={14}
          color={Color4.create(187 / 255, 187 / 255, 187 / 255, 1)}
        /> */}
      </UiEntity>
    </UiEntity>
  )
}

function handleRelease(engine: IEngine, state: State) {
  const { Actions, Rewards } = getComponents(engine)
  const rewardItems = getRewardItems(engine)
  const selectedRewardItem =
    rewardItems[state.rewardsControl.selectedRewardItem!]
  const rewardItem = Rewards.getOrNull(selectedRewardItem.entity as Entity)

  if (!rewardItem) return

  const action = Actions.getOrNull(
    selectedRewardItem.entity as Entity,
  )?.value.find(($) => $.name === 'Airdrop')
  if (action) {
    const actionEvents = getActionEvents(selectedRewardItem.entity as Entity)
    actionEvents.emit(action.name, getPayload(action))
  }
}

function handleClear(engine: IEngine, state: State) {
  const { Actions, Rewards } = getComponents(engine)
  const rewardItems = getRewardItems(engine)
  const selectedRewardItem =
    rewardItems[state.rewardsControl.selectedRewardItem!]
  const rewardItem = Rewards.getOrNull(selectedRewardItem.entity as Entity)
  if (!rewardItem) return

  const action = Actions.getOrNull(
    selectedRewardItem.entity as Entity,
  )?.value.find(($) => $.name === 'Invisible')

  if (action) {
    const actionEvents = getActionEvents(selectedRewardItem.entity as Entity)
    actionEvents.emit(action.name, getPayload(action))
  }
}
