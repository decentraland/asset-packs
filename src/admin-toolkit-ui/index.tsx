import { Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  Label,
  Button as DCLButton,
  UiEntity,
  ReactBasedUiSystem,
} from '@dcl/react-ecs'
import { Entity, IEngine, PointerEventsSystem } from '@dcl/ecs'

import {
  AdminPermissions,
  getComponents,
  GetPlayerDataRes,
  IPlayersHelper,
  ISDKHelpers,
} from '../definitions'
import { getScaleUIFactor } from '../ui'
import { VideoControl } from './VideoControl'
import { TextAnnouncementsControl } from './TextAnnouncementsControl'
// import { RewardsControl } from './RewardsControl'
import { SmartItemsControl } from './SmartItemsControl'
import { Button } from './Button'
import { TextAnnouncements } from './TextAnnouncements'
import { CONTENT_URL } from './constants'
import { getSceneDeployment, getSceneOwners } from './utils'
import { State, TabType, SelectedSmartItem } from './types'
import { getExplorerComponents } from '../components'
import { BTN_MODERATION_CONTROL, BTN_MODERATION_CONTROL_ACTIVE, ModerationControl, moderationControlState, SceneAdmin } from './ModerationControl'
import { getSceneAdmins } from './ModerationControl/api'
import { ModalAdminList } from './ModerationControl/AdminList'
import { getStreamKey } from './VideoControl/api'

export const nextTickFunctions: (() => void)[] = []
export let scaleFactor: number

export let state: State = {
  adminToolkitUiEntity: 0 as Entity,
  panelOpen: true,
  activeTab: TabType.VIDEO_CONTROL,
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

let sceneAdminsCache: SceneAdmin[]

// const BTN_REWARDS_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-rewards-control-button.png`
// const BTN_REWARDS_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-rewards-control-active-button.png`

const BTN_VIDEO_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-video-control-button.png`
const BTN_VIDEO_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-video-control-active-button.png`

const BTN_SMART_ITEM_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-smart-item-control-button.png`
const BTN_SMART_ITEM_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-smart-item-control-active-button.png`

const BTN_TEXT_ANNOUNCEMENT_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-text-announcement-control-button.png`
const BTN_TEXT_ANNOUNCEMENT_CONTROL_ACTIVE = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-text-announcement-control-active-button.png`

const BTN_ADMIN_TOOLKIT_CONTROL = `${CONTENT_URL}/admin_toolkit/assets/icons/admin-panel-control-button.png`
const BTN_ADMIN_TOOLKIT_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/admin-tool-background.png`

export const containerBackgroundColor = Color4.fromHexString('#000000BF')

// The editor starts using entities from [8001].
const ADMIN_TOOLS_ENTITY = 8000 as Entity

function getAdminToolkitEntity(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  return Array.from(engine.getEntitiesWith(AdminTools))[0][0]
}

function getAdminToolkitComponent(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  return Array.from(engine.getEntitiesWith(AdminTools))[0][1]
}

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

export async function fetchSceneAdmins() {
  const [error, response] = await getSceneAdmins()
  if (error) {
    // TODO show error;
    console.log(error)
    return
  }
  sceneAdminsCache = response?.map($ => ({
    name: $.admin,
    address: $.admin,
    role: 'admin',
    verified: false
  })) ?? []
}

function getSmartItems(engine: IEngine) {
  const adminToolkitComponent = getAdminToolkitComponent(engine)

  if (
    !adminToolkitComponent ||
    !adminToolkitComponent.smartItemsControl ||
    !adminToolkitComponent.smartItemsControl.smartItems ||
    adminToolkitComponent.smartItemsControl.smartItems.length === 0
  )
    return []

  return Array.from(adminToolkitComponent.smartItemsControl.smartItems)
}

function getRewards(engine: IEngine) {
  const adminToolkitComponent = getAdminToolkitComponent(engine)

  if (
    !adminToolkitComponent ||
    !adminToolkitComponent.rewardsControl ||
    !adminToolkitComponent.rewardsControl.rewardItems ||
    adminToolkitComponent.rewardsControl.rewardItems.length === 0
  )
    return []

  return Array.from(adminToolkitComponent.rewardsControl.rewardItems)
}

function initTextAnnouncementSync(engine: IEngine) {
  const { TextAnnouncements } = getComponents(engine)

  TextAnnouncements.createOrReplace(state.adminToolkitUiEntity, {
    text: '',
    author: '',
    id: ''
  })
}

// Helper function to sync entities components
function syncEntitiesComponents(
  engine: IEngine,
  entities: { entity: number | Entity }[],
  requiredComponentIds: number[],
  sdkHelpers?: ISDKHelpers,
  parentEntity: Entity = ADMIN_TOOLS_ENTITY,
) {
  const { SyncComponents } = getExplorerComponents(engine)
  const entitiesToSync: Entity[] = []

  entities.forEach((item) => {
    const entity = item.entity as Entity
    const syncComponents = SyncComponents.getMutableOrNull(entity)

    if (syncComponents) {
      const componentIds = new Set(syncComponents.componentIds)
      requiredComponentIds.forEach((id) => componentIds.add(id))
      syncComponents.componentIds = Array.from(componentIds)
    } else {
      entitiesToSync.push(entity)
    }
  })

  if (entitiesToSync.length > 0 && sdkHelpers?.syncEntity) {
    entitiesToSync.forEach((entity) => {
      sdkHelpers.syncEntity!(entity, requiredComponentIds, parentEntity)
    })
  }
}

function initSmartItemsSync(engine: IEngine, sdkHelpers?: ISDKHelpers) {
  const { Animator, Transform, Tween, VisibilityComponent } =
    getExplorerComponents(engine)

  const requiredComponentIds = [
    Animator.componentId,
    Transform.componentId,
    Tween.componentId,
    VisibilityComponent.componentId,
  ]

  const smartItems = getSmartItems(engine)
  syncEntitiesComponents(engine, smartItems, requiredComponentIds, sdkHelpers)
}

function initRewardsSync(engine: IEngine, sdkHelpers?: ISDKHelpers) {
  const { Animator, Transform, Tween, VisibilityComponent } =
    getExplorerComponents(engine)

  const requiredComponentIds = [
    Animator.componentId,
    Transform.componentId,
    Tween.componentId,
    VisibilityComponent.componentId,
  ]

  const rewards = getRewards(engine)
  syncEntitiesComponents(engine, rewards, requiredComponentIds, sdkHelpers)
}

// Initialize admin data before UI rendering
let adminDataInitialized = false
export async function initializeAdminData(
  engine: IEngine,
  sdkHelpers?: ISDKHelpers,
) {
  console.log('initializeAdminData')
  if (!adminDataInitialized) {
    console.log('initializeAdminData - not initialized')
    const { TextAnnouncements, VideoControlState } = getComponents(engine)
    // Initialize AdminToolkitUiEntity
    state.adminToolkitUiEntity = getAdminToolkitEntity(engine) ?? engine.addEntity()



    // Initialize TextAnnouncements sync component
    initTextAnnouncementSync(engine)

    // Initialize Smart Items sync
    initSmartItemsSync(engine, sdkHelpers)

    // Initialize Rewards sync
    initRewardsSync(engine, sdkHelpers)

    if (!VideoControlState.getOrNull(state.adminToolkitUiEntity)) {
      VideoControlState.create(state.adminToolkitUiEntity)
    }

    sdkHelpers?.syncEntity?.(
      state.adminToolkitUiEntity,
      [VideoControlState.componentId, TextAnnouncements.componentId],
      ADMIN_TOOLS_ENTITY,
    )


    engine.addSystem(() => {
      if (nextTickFunctions.length > 0) {
        const nextTick = nextTickFunctions.shift()
        if (nextTick) {
          nextTick()
        }
      }
    }, Number.POSITIVE_INFINITY)

    // Initialize scene data
    await Promise.all([
      initSceneDeployment(),
      initSceneOwners(),
      fetchSceneAdmins(),
    ])

    adminDataInitialized = true

    console.log('initializeAdminData - initialized')
  }
}

export function createAdminToolkitUI(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  sdkHelpers?: ISDKHelpers,
  playersHelper?: IPlayersHelper,
) {
  // Initialize admin data before setting up the UI
  initializeAdminData(engine, sdkHelpers).then(() => {
    console.log('createAdminToolkitUI - initialized')
    reactBasedUiSystem.setUiRenderer(() =>
      uiComponent(engine, pointerEventsSystem, sdkHelpers, playersHelper),
    )
  })
}

export function isSceneDeployer(playerAddress: string) {
  return deploymentCache?.deployedBy === playerAddress.toLowerCase()
}

export function isSceneOwner(playerAddress: string) {
  return (sceneOwnersCache || []).includes(playerAddress.toLowerCase())
}

function isAllowedAdmin(
  _engine: IEngine,
  adminToolkitEntitie: ReturnType<typeof getAdminToolkitComponent>,
  player?: GetPlayerDataRes | null,
) {
  const { adminPermissions, authorizedAdminUsers } = adminToolkitEntitie

  if (adminPermissions === AdminPermissions.PUBLIC) {
    return true
  }

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

const uiComponent = (
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  sdkHelpers?: ISDKHelpers,
  playersHelper?: IPlayersHelper,
) => {
  const adminToolkitEntity = getAdminToolkitComponent(engine)
  const player = playersHelper?.getPlayer()
  const isPlayerAdmin = isAllowedAdmin(engine, adminToolkitEntity, player)
  scaleFactor = getScaleUIFactor(engine)

  return [
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        height: '100%',
        width: '100%',
      }}
    >
      {isPlayerAdmin ? (
        <UiEntity
          uiTransform={{
            positionType: 'absolute',
            flexDirection: 'row',
            position: { top: 80 * scaleFactor, right: 10 * scaleFactor },
          }}
        >
          <UiEntity
            uiTransform={{
              display: state.panelOpen ? 'flex' : 'none',
              width: 500 * scaleFactor,
              pointerFilter: 'block',
              flexDirection: 'column',
              margin: { right: 8 * scaleFactor },
            }}
          >
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 50 * scaleFactor,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12 * scaleFactor,
                padding: {
                  left: 12 * scaleFactor,
                  right: 12 * scaleFactor,
                },
              }}
              uiBackground={{ color: containerBackgroundColor }}
            >
              <Label
                value="Admin Tools"
                fontSize={20 * scaleFactor}
                color={Color4.create(160, 155, 168, 1)}
                uiTransform={{ flexGrow: 1 }}
              />
              <Button
                id="admin_toolkit_moderation_control"
                variant="text"
                icon={
                  state.activeTab === TabType.MODERATION_CONTROL
                    ? BTN_MODERATION_CONTROL_ACTIVE
                    : BTN_MODERATION_CONTROL
                }
                onlyIcon
                uiTransform={{
                  display: adminToolkitEntity.moderationControl.isEnabled
                    ? 'flex'
                    : 'none',
                  width: 49 * scaleFactor,
                  height: 42 * scaleFactor,
                  margin: { right: 8 * scaleFactor },
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                iconTransform={{
                  height: '100%',
                  width: '100%',
                }}
                onMouseDown={() => {
                  if (state.activeTab !== TabType.MODERATION_CONTROL) {
                    state.activeTab = TabType.NONE
                    nextTickFunctions.push(() => {
                      state.activeTab = TabType.MODERATION_CONTROL
                    })
                  } else {
                    state.activeTab = TabType.NONE
                  }
                }}
              />
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
                  display: adminToolkitEntity.videoControl.isEnabled
                    ? 'flex'
                    : 'none',
                  width: 49 * scaleFactor,
                  height: 42 * scaleFactor,
                  margin: { right: 8 * scaleFactor },
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                iconTransform={{
                  height: '100%',
                  width: '100%',
                }}
                onMouseDown={() => {
                  if (state.activeTab !== TabType.VIDEO_CONTROL) {
                    state.activeTab = TabType.NONE
                    nextTickFunctions.push(() => {
                      state.activeTab = TabType.VIDEO_CONTROL
                    })
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
                  display: adminToolkitEntity.smartItemsControl.isEnabled
                    ? 'flex'
                    : 'none',
                  width: 49 * scaleFactor,
                  height: 42 * scaleFactor,
                  margin: { right: 8 * scaleFactor },
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                iconTransform={{
                  height: '100%',
                  width: '100%',
                }}
                onMouseDown={() => {
                  if (state.activeTab !== TabType.SMART_ITEMS_CONTROL) {
                    state.activeTab = TabType.NONE
                    nextTickFunctions.push(() => {
                      state.activeTab = TabType.SMART_ITEMS_CONTROL
                    })
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
                  display: adminToolkitEntity.textAnnouncementControl.isEnabled
                    ? 'flex'
                    : 'none',
                  width: 49 * scaleFactor,
                  height: 42 * scaleFactor,
                  margin: { right: 8 * scaleFactor },
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                iconTransform={{
                  height: '100%',
                  width: '100%',
                }}
                onMouseDown={() => {
                  if (state.activeTab !== TabType.TEXT_ANNOUNCEMENT_CONTROL) {
                    state.activeTab = TabType.NONE
                    nextTickFunctions.push(() => {
                      state.activeTab = TabType.TEXT_ANNOUNCEMENT_CONTROL
                    })
                  } else {
                    state.activeTab = TabType.NONE
                  }
                }}
              />
            </UiEntity>
            {state.activeTab === TabType.TEXT_ANNOUNCEMENT_CONTROL ? (
              <TextAnnouncementsControl
                engine={engine}
                state={state}
                player={player}
              />
            ) : null}
            {state.activeTab === TabType.VIDEO_CONTROL ? (
              <VideoControl engine={engine} state={state} />
            ) : null}
            {state.activeTab === TabType.SMART_ITEMS_CONTROL ? (
              <SmartItemsControl engine={engine} state={state} />
            ) : null}
            {state.activeTab === TabType.MODERATION_CONTROL && (
              <ModerationControl engine={engine} player={player} />
            )}
          </UiEntity>
          <UiEntity
            uiTransform={{
              display: 'flex',
              height: 42 * scaleFactor,
              width: 42 * scaleFactor,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              pointerFilter: 'block',
            }}
            uiBackground={{
              texture: {
                src: BTN_ADMIN_TOOLKIT_BACKGROUND,
              },
              textureMode: 'stretch',
              color: Color4.create(1, 1, 1, 1),
            }}
          >
            <DCLButton
              value=""
              uiTransform={{
                height: 40 * scaleFactor,
                width: 40 * scaleFactor,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}
              uiBackground={{
                texture: {
                  src: BTN_ADMIN_TOOLKIT_CONTROL,
                },
                textureMode: 'stretch',
                color: Color4.create(1, 1, 1, 1),
              }}
              onMouseDown={() => {
                state.panelOpen = !state.panelOpen
              }}
            />
          </UiEntity>
        </UiEntity>
      ) : null}
      <TextAnnouncements engine={engine} state={state} />
    </UiEntity>,
    moderationControlState.showModalAdminList && (
      <ModalAdminList
        scaleFactor={scaleFactor}
        sceneAdmins={sceneAdminsCache ?? []}
        engine={engine}
      />
    ),
  ]
}
