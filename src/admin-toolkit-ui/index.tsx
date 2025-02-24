import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, UiEntity, ReactBasedUiSystem } from '@dcl/react-ecs'
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
// import { renderModerationControl } from './ModerationControl'
import { RewardsControl } from './RewardsControl'
import { SmartItemsControl } from './SmartItemsControl'
import { Button } from './Button'
import { TextAnnouncements } from './TextAnnouncements'
import { CONTENT_URL } from './constants'
import { getSceneDeployment, getSceneOwners } from './utils'
import { State, TabType, SelectedSmartItem } from './types'
import { getExplorerComponents } from '../components'

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
    // if (controlPlayer.position === -1) {
    //   videoPlayer.position = controlPlayer.position
    //   controlPlayer.position = undefined
    // }
    if (videoPlayer.loop !== controlPlayer.loop) {
      videoPlayer.loop = !!controlPlayer.loop
    }
  })
}

function initVideoControlSync(engine: IEngine, sdkHelpers?: ISDKHelpers) {
  const { VideoControlState } = getComponents(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  const adminToolkitEntity = getAdminToolkitEntity(engine)
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

  sdkHelpers?.syncEntity?.(
    state.adminToolkitUiEntity,
    [VideoControlState.componentId],
    adminToolkitEntity,
  )
}

function initTextAnnouncementSync(engine: IEngine, sdkHelpers?: ISDKHelpers) {
  const { TextAnnouncements } = getComponents(engine)
  const adminToolkitEntity = getAdminToolkitEntity(engine)

  TextAnnouncements.createOrReplace(state.adminToolkitUiEntity, {
    announcements: [],
  })

  // sdkHelpers?.syncEntity?.(
  //   state.adminToolkitUiEntity,
  //   [TextAnnouncements.componentId],
  //   adminToolkitEntity,
  // )
}

// Initialize admin data before UI rendering
let adminDataInitialized = false
export async function initializeAdminData(
  engine: IEngine,
  sdkHelpers?: ISDKHelpers,
) {
  if (!adminDataInitialized) {
    // Initialize scene data
    await Promise.all([initSceneDeployment(), initSceneOwners()])

    // Initialize AdminToolkitUiEntity
    state.adminToolkitUiEntity = engine.addEntity()

    // Initialize VideoControl sync component
    initVideoControlSync(engine, sdkHelpers)

    // Initialize TextAnnouncements sync component
    initTextAnnouncementSync(engine, sdkHelpers)

    adminDataInitialized = true
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

function getAdminToolkitEntity(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  return Array.from(engine.getEntitiesWith(AdminTools))[0][0]
}

function getAdminToolkitComponent(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  return Array.from(engine.getEntitiesWith(AdminTools))[0][1]
}

const uiComponent = (
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  sdkHelpers?: ISDKHelpers,
  playersHelper?: IPlayersHelper,
) => {
  // const { TextAnnouncements } = getComponents(engine)
  const adminToolkitEntitie = getAdminToolkitComponent(engine)
  const player = playersHelper?.getPlayer()
  const isPlayerAdmin = isAllowedAdmin(engine, adminToolkitEntitie, player)
  // const textAnnouncements = TextAnnouncements.getOrNull(
  //   state.adminToolkitUiEntity,
  // )
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
                {/* {state.activeTab === TabType.MODERATION &&
              renderModerationControl(engine)} */}
                {state.activeTab === TabType.TEXT_ANNOUNCEMENT_CONTROL && (
                  <TextAnnouncementsControl
                    engine={engine}
                    state={state}
                    player={player}
                  />
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
              height: 38 * scaleFactor,
              width: 38 * scaleFactor,
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
                margin: {
                  top: 4 * scaleFactor,
                  right: 4 * scaleFactor,
                  bottom: 4 * scaleFactor,
                  left: 4 * scaleFactor,
                },
              }}
              iconTransform={{
                height: 30 * scaleFactor,
                width: 30 * scaleFactor,
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
