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

export const nextTickFunctions: (() => void)[] = []

let state: State = {
  adminToolkitUiEntity: 0 as Entity,
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

const containerBackgroundColor = Color4.create(0, 0, 0, 0.75)

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

function getVideoPlayers(engine: IEngine) {
  const adminToolkitComponent = getAdminToolkitComponent(engine)

  if (
    !adminToolkitComponent ||
    !adminToolkitComponent.videoControl ||
    !adminToolkitComponent.videoControl.videoPlayers ||
    adminToolkitComponent.videoControl.videoPlayers.length === 0
  )
    return []

  return Array.from(adminToolkitComponent.videoControl.videoPlayers)
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

function syncVideoPlayersState(engine: IEngine) {
  const { VideoControlState } = getComponents(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  const videoControlState = VideoControlState.getOrNull(
    state.adminToolkitUiEntity,
  )
  if (!videoControlState?.videoPlayers) return

  // Iterate through each player in the control state
  videoControlState.videoPlayers.forEach((controlPlayer) => {
    const videoPlayer = VideoPlayer.getMutableOrNull(
      controlPlayer.entity as Entity,
    )
    if (!videoPlayer) return

    // Check and sync each property
    if (
      controlPlayer.src !== undefined &&
      videoPlayer.src !== controlPlayer.src
    ) {
      videoPlayer.src = controlPlayer.src
    }
    if (videoPlayer.playing !== controlPlayer.playing) {
      videoPlayer.playing = !!controlPlayer.playing
    }
    if (videoPlayer.volume !== controlPlayer.volume) {
      videoPlayer.volume = controlPlayer.volume ?? 0
    }
    if (controlPlayer.position === -1 && videoPlayer.position === undefined) {
      videoPlayer.position = -1
    }
    if (videoPlayer.position === -1 && controlPlayer.position === undefined) {
      videoPlayer.position = undefined
    }
    if (videoPlayer.loop !== controlPlayer.loop) {
      videoPlayer.loop = !!controlPlayer.loop
    }
  })
}

function initVideoControlSync(engine: IEngine) {
  const { VideoControlState } = getComponents(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  const videoPlayers = getVideoPlayers(engine)

  let syncVideoPlayers: any = []

  videoPlayers.forEach((player) => {
    const vp = VideoPlayer.getOrNull(player.entity as Entity)
    if (vp) {
      syncVideoPlayers.push({
        entity: player.entity as Entity,
        src: vp.src,
        playing: vp.playing,
        volume: vp.volume,
        position: vp.position,
        loop: vp.loop,
      })
    }
  })

  VideoControlState.createOrReplace(state.adminToolkitUiEntity, {
    videoPlayers: syncVideoPlayers,
  })

  // Set up the sync system
  engine.addSystem(() => {
    syncVideoPlayersState(engine)
  })
}

function initTextAnnouncementSync(engine: IEngine) {
  const { TextAnnouncements } = getComponents(engine)

  TextAnnouncements.createOrReplace(state.adminToolkitUiEntity, {
    text: '',
    author: '',
    id: ''
  })
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
    const { VideoControlState, TextAnnouncements } = getComponents(engine)

    // Initialize scene data
    await Promise.all([initSceneDeployment(), initSceneOwners()])

    // Initialize AdminToolkitUiEntity
    state.adminToolkitUiEntity = engine.addEntity()

    // Initialize VideoControl sync component
    initVideoControlSync(engine)

    // Initialize TextAnnouncements sync component
    initTextAnnouncementSync(engine)

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

function isSceneDeployer(playerAddress: string) {
  return deploymentCache?.deployedBy === playerAddress.toLowerCase()
}

function isSceneOwner(playerAddress: string) {
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
  const adminToolkitEntitie = getAdminToolkitComponent(engine)
  const player = playersHelper?.getPlayer()
  const isPlayerAdmin = isAllowedAdmin(engine, adminToolkitEntitie, player)
  const scaleFactor = getScaleUIFactor(engine)

  return (
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
                  display: adminToolkitEntitie.smartItemsControl.isEnabled
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
                  display: adminToolkitEntitie.textAnnouncementControl.isEnabled
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
              {/* <Button
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
                  width: 49 * scaleFactor,
                  height: 42 * scaleFactor,
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
                    state.activeTab = TabType.NONE
                    nextTickFunctions.push(() => {
                      state.activeTab = TabType.REWARDS_CONTROL
                    })
                  } else {
                    state.activeTab = TabType.NONE
                  }
                }}
              /> */}
            </UiEntity>
            {state.activeTab !== TabType.NONE ? (
              <UiEntity
                uiTransform={{
                  width: '100%',
                  margin: {
                    top: 10 * scaleFactor,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  },
                  padding: {
                    top: 32 * scaleFactor,
                    right: 32 * scaleFactor,
                    bottom: 32 * scaleFactor,
                    left: 32 * scaleFactor,
                  },
                }}
                uiBackground={{ color: containerBackgroundColor }}
              >
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
                {/* {state.activeTab === TabType.REWARDS_CONTROL ? (
                  <RewardsControl engine={engine} state={state} />
                ) : null} */}
              </UiEntity>
            ) : null}
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
    </UiEntity>
  )
}
