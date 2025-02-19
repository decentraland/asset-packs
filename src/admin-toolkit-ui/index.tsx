import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, UiEntity, ReactBasedUiSystem } from '@dcl/react-ecs'
import { Entity, IEngine, PointerEventsSystem } from '@dcl/ecs'

import { AdminPermissions, getComponents, IPlayersHelper } from '../definitions'
import { VideoControl } from './VideoControl'
import { renderTextAnnouncementControl } from './TextAnnouncementControl'
// import { renderModerationControl } from './ModerationControl'
import { RewardsControl } from './RewardsControl'
import { SmartItemsControl } from './SmartItemsControl'
import { Button } from './Button'
import { CONTENT_URL } from './constants'
import { State, TabType, SelectedSmartItem } from './types'
import { getSceneDeployment, getSceneOwners } from './utils'

let state: State = {
  panelOpen: false,
  activeTab: TabType.NONE,
  videoControl: {
    shareScreenUrl: undefined,
    selectedVideoPlayer: undefined,
    linkAllVideoPlayers: undefined,
  },
  smartItemsControl: {
    selectedSmartItem: undefined,
    smartItems: new Map<Entity, SelectedSmartItem>(),
  },
  textAnnouncementControl: {
    entity: undefined,
    text: undefined,
    messageRateTracker: new Map<string, number>(),
    announcements: [],
    maxAnnouncements: 4,
  },
  rewardsControl: {
    selectedRewardItem: undefined,
  },
}

// Add cache objects at the top level
let deploymentCache: {
  data: any
  deployedBy?: string
  sceneBasePosition?: string[]
} | null = null

let sceneOwnersCache: string[] | null = null

const BTN_MODERATION_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-moderation-control-button.png`
const BTN_MODERATION_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-moderation-control-active-button.png`

const BTN_REWARDS_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-rewards-control-button.png`
const BTN_REWARDS_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-rewards-control-active-button.png`

const BTN_VIDEO_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-video-control-button.png`
const BTN_VIDEO_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-video-control-active-button.png`

const BTN_SMART_ITEM_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-smart-item-control-button.png`
const BTN_SMART_ITEM_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-smart-item-control-active-button.png`

const BTN_TEXT_ANNOUNCEMENT_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-text-announcement-control-button.png`
const BTN_TEXT_ANNOUNCEMENT_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-text-announcement-control-active-button.png`

const BTN_ADMIN_TOOLKIT_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-control-button.png`

const containerBackgroundColor = Color4.create(0, 0, 0, 0.75)

async function initSceneDeployment() {
  if (deploymentCache !== null) return

  const deployment = await getSceneDeployment()

  if (deployment) {
    deploymentCache = {
      data: deployment,
      deployedBy: deployment.deployedBy.toLowerCase(),
      sceneBasePosition: deployment.metadata.scene.base.split(','),
    }
  }
}

async function initSceneOwners() {
  if (sceneOwnersCache !== null) return

  const owners = await getSceneOwners()

  if (owners.length > 0) {
    sceneOwnersCache = owners
  }
}

// Initialize admin data before UI rendering
let adminDataInitialized = false
export async function initializeAdminData() {
  if (!adminDataInitialized) {
    await Promise.all([initSceneDeployment(), initSceneOwners()])
    adminDataInitialized = true
  }
}

export function createAdminToolkitUI(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  playersHelper?: IPlayersHelper,
) {
  // Initialize admin data before setting up the UI
  initializeAdminData().then(() => {
    reactBasedUiSystem.setUiRenderer(() =>
      uiComponent(engine, pointerEventsSystem, playersHelper),
    )
  })
}

function isSceneDeployer(playerAddress: string) {
  return deploymentCache?.deployedBy === playerAddress.toLowerCase()
}

function isSceneOwner(playerAddress: string) {
  return (sceneOwnersCache || []).includes(playerAddress.toLowerCase())
}

function isAllowedAdmin(
  _engine: IEngine,
  adminToolkitEntitie: ReturnType<typeof getAdminToolkitComponent>,
  playersHelper?: IPlayersHelper,
) {
  const { adminPermissions, authorizedAdminUsers } = adminToolkitEntitie

  if (adminPermissions === AdminPermissions.PUBLIC) {
    return true
  }

  const player = playersHelper?.getPlayer()
  if (!player) return false

  const playerAddress = player.userId.toLowerCase()

  // Check if player is the deployer
  if (authorizedAdminUsers.me && isSceneDeployer(playerAddress)) {
    return true
  }

  // Check if player is a scene owner
  if (authorizedAdminUsers.sceneOwners && isSceneOwner(playerAddress)) {
    return true
  }

  // Check if player is in the allow list
  if (
    authorizedAdminUsers.allowList &&
    authorizedAdminUsers.adminAllowList.some(
      (wallet) => wallet.toLowerCase() === playerAddress,
    )
  ) {
    return true
  }

  return false
}

function getAdminToolkitComponent(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  return Array.from(engine.getEntitiesWith(AdminTools))[0][1]
}

const uiComponent = (
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  playersHelper?: IPlayersHelper,
) => {
  const adminToolkitEntitie = getAdminToolkitComponent(engine)
  if (!isAllowedAdmin(engine, adminToolkitEntitie, playersHelper)) {
    return null
  }

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        flexDirection: 'row',
        position: { top: 80, right: 10 },
      }}
    >
      <UiEntity
        uiTransform={{
          display: state.panelOpen ? 'flex' : 'none',
          width: 500,
          pointerFilter: 'block',
          flexDirection: 'column',
          margin: { right: 8 },
        }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            padding: {
              left: 12,
              right: 12,
            },
          }}
          uiBackground={{ color: containerBackgroundColor }}
        >
          <Label
            value="Admin Tools"
            fontSize={20}
            color={Color4.create(160, 155, 168, 1)}
            uiTransform={{ flexGrow: 1 }}
          />
          {/* <Button
          value=""
          fontSize={25}
          uiTransform={{
            width: 49,
            height: 42,
            margin: '0 8px 0 0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          uiBackground={{
            color: Color4.White(),
            textureMode: 'stretch',
            texture: {
              src:
                state.activeTab === TabType.MODERATION_CONTROL
                  ? BTN_MODERATION_CONTROL_ACTIVE
                  : BTN_MODERATION_CONTROL,
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.MODERATION_CONTROL
          }}
        /> */}
          <Button
            id="admin_toolkit_panel_video_control"
            variant="text"
            icon={
              state.activeTab === TabType.VIDEO_CONTROL
                ? BTN_VIDEO_CONTROL_ACTIVE
                : BTN_VIDEO_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.videoControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: { right: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.VIDEO_CONTROL) {
                state.activeTab = TabType.VIDEO_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
          <Button
            id="admin_toolkit_panel_smart_items_control"
            variant="text"
            icon={
              state.activeTab === TabType.SMART_ITEMS_CONTROL
                ? BTN_SMART_ITEM_CONTROL_ACTIVE
                : BTN_SMART_ITEM_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.smartItemsControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: { right: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.SMART_ITEMS_CONTROL) {
                state.activeTab = TabType.SMART_ITEMS_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
          <Button
            id="admin_toolkit_panel_text_announcement_control"
            variant="text"
            icon={
              state.activeTab === TabType.TEXT_ANNOUNCEMENT_CONTROL
                ? BTN_TEXT_ANNOUNCEMENT_CONTROL_ACTIVE
                : BTN_TEXT_ANNOUNCEMENT_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.textAnnouncementControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: { right: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.TEXT_ANNOUNCEMENT_CONTROL) {
                state.activeTab = TabType.TEXT_ANNOUNCEMENT_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
          <Button
            id="admin_toolkit_panel_rewards_control"
            variant="text"
            icon={
              state.activeTab === TabType.REWARDS_CONTROL
                ? BTN_REWARDS_CONTROL_ACTIVE
                : BTN_REWARDS_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.rewardsControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: '0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.REWARDS_CONTROL) {
                state.activeTab = TabType.REWARDS_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
        </UiEntity>
        {state.activeTab !== TabType.NONE ? (
          <UiEntity
            uiTransform={{
              width: '100%',
              margin: '10px 0 0 0',
              padding: '32px',
            }}
            uiBackground={{ color: containerBackgroundColor }}
          >
            {/* {state.activeTab === TabType.MODERATION &&
            renderModerationControl(engine)} */}
            {state.activeTab === TabType.TEXT_ANNOUNCEMENT_CONTROL &&
              renderTextAnnouncementControl(
                engine,
                state,
                pointerEventsSystem,
                playersHelper,
              )}
            {state.activeTab === TabType.VIDEO_CONTROL && (
              <VideoControl engine={engine} state={state} />
            )}
            {state.activeTab === TabType.SMART_ITEMS_CONTROL && (
              <SmartItemsControl engine={engine} state={state} />
            )}
            {state.activeTab === TabType.REWARDS_CONTROL && (
              <RewardsControl engine={engine} state={state} />
            )}
          </UiEntity>
        ) : null}
      </UiEntity>
      <UiEntity
        uiTransform={{
          height: 38,
          width: 38,
          pointerFilter: 'block',
        }}
        uiBackground={{ color: containerBackgroundColor }}
      >
        <Button
          id="admin_toolkit_panel"
          variant="text"
          icon={BTN_ADMIN_TOOLKIT_CONTROL}
          onlyIcon
          uiTransform={{
            height: 'auto',
            width: 'auto',
            margin: 4,
          }}
          iconTransform={{
            height: 30,
            width: 30,
          }}
          onMouseDown={() => {
            state.panelOpen = !state.panelOpen
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}
