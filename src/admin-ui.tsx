import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, UiEntity, Input } from '@dcl/sdk/react-ecs'
import { Dropdown, ReactBasedUiSystem } from '@dcl/react-ecs'
import {
  Entity,
  IEngine,
  TextAlignMode,
  YGFlexDirection,
  YGPositionType,
  BackgroundTextureMode,
  YGUnit,
  InputAction,
  PointerEventsSystem,
} from '@dcl/ecs'
import {
  Action,
  AdminTools,
  AlignMode,
  getComponents,
  getPayload,
} from './definitions'
import { getActionEvents } from './events'
import { PlayerHelper } from './admin-toolkit'
import { getExplorerComponents } from './components'
import {
  getUIBackground,
  getUIText,
  getUITransform,
  mapAlignToScreenAlign,
} from './ui'

// Tab enum for type safety
enum TabType {
  NONE = 'None',
  VIDEO_CONTROL = 'VideoControl',
  SMART_ITEMS = 'SmartItemsControl',
  TEXT_ANNOUNCEMENT = 'TextAnnouncementControl',
}

type SelectedSmartItem = { visible: boolean; selectedAction: string }

type State = {
  activeTab: TabType
  videoControl: {
    shareScreenUrl: string
    selectedVideoPlayer: Entity | undefined
  }
  smartItemActions: {
    selectedSmartItem: number | undefined
    smartItem: Map<Entity, SelectedSmartItem>
  }
  textAnnouncement: {
    entity: Entity | undefined
    text: string
    messageRateTracker: Map<string, number>
    announcements: {
      entity: Entity
      timestamp: number
    }[]
    maxAnnouncements: number
  }
}

let state: State = {
  activeTab: TabType.NONE,
  videoControl: {
    shareScreenUrl: '',
    selectedVideoPlayer: undefined,
  },
  smartItemActions: {
    selectedSmartItem: undefined,
    smartItem: new Map<Entity, SelectedSmartItem>(),
  },
  textAnnouncement: {
    entity: undefined,
    text: '',
    messageRateTracker: new Map<string, number>(),
    announcements: [],
    maxAnnouncements: 4,
  },
}

export function createAdminToolkitUI(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  players: PlayerHelper,
) {
  console.log('setupUi')

  reactBasedUiSystem.setUiRenderer(() =>
    uiComponent(engine, pointerEventsSystem, players),
  )
}

const uiComponent = (
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  players: PlayerHelper,
) => {
  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 500,
        flex: 1,
        alignSelf: 'center',
        margin: '16px 0 8px 470px',
        padding: 4,
        pointerFilter: 'block',
        flexDirection: 'column',
      }}
      uiBackground={{ color: Color4.create(0, 0, 0, 0.75) }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Video Control"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            state.activeTab = TabType.VIDEO_CONTROL
          }}
        />
        <Button
          value="Smart Items"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            state.activeTab = TabType.SMART_ITEMS
          }}
        />
        <Button
          value="Text Announcement"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            state.activeTab = TabType.TEXT_ANNOUNCEMENT
          }}
        />
      </UiEntity>
      <UiEntity>
        {state.activeTab === TabType.VIDEO_CONTROL &&
          renderVideoControl(engine)}
        {state.activeTab === TabType.SMART_ITEMS && renderSmartItems(engine)}
        {state.activeTab === TabType.TEXT_ANNOUNCEMENT &&
          renderTextAnnouncement(engine, pointerEventsSystem, players)}
      </UiEntity>
    </UiEntity>
  )
}

function getVideoPlayers(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    !adminToolkit ||
    !adminToolkit.videoControl.videoPlayers ||
    adminToolkit.videoControl.videoPlayers.length === 0
  )
    return []

  let videoPlayers = []

  if (adminToolkit.videoControl.linkAllVideoPlayers) {
    videoPlayers = Array.from(engine.getEntitiesWith(VideoPlayer)).map(
      (videoPlayer) => videoPlayer[0],
    )
  } else {
    videoPlayers = adminToolkit.videoControl.videoPlayers.map(
      (videoPlayer) => videoPlayer.entity,
    )
  }
  return videoPlayers
}

function renderVideoControl(engine: IEngine) {
  const videoPlayers = getVideoPlayers(engine)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Video Control"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />

      <Label
        value="Current Screen"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      {videoPlayers.length > 0
        ? videoPlayers.map((videoPlayer, idx) => (
            <Button key={videoPlayer} value={`#${idx + 1}`} />
          ))
        : null}

      <Input
        onSubmit={(value) => {
          state.videoControl.shareScreenUrl = value
        }}
        value={state.videoControl.shareScreenUrl}
        onChange={($) => (state.videoControl.shareScreenUrl = $)}
        fontSize={35}
        placeholder={'Screen URL something'}
        placeholderColor={Color4.White()}
        color={Color4.White()}
        uiTransform={{
          width: '400px',
          height: '80px',
        }}
      ></Input>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Clear"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            console.log('Clear clicked 4')
            state.videoControl.shareScreenUrl = ''
          }}
        />
        <Button
          value="Share"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40 }}
          onMouseDown={() => {
            console.log('Share clicked')
            shareScreen(engine, state.videoControl.shareScreenUrl)
          }}
        />
      </UiEntity>

      <Label
        value="Video Playback"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 80,
          flexDirection: 'row',
          flexWrap: 'wrap',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Previous"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePreviosTrack(engine)
          }}
          disabled={true}
        />
        <Button
          value="Play"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePlay(engine)
          }}
        />
        <Button
          value="Pause"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePause(engine)
          }}
        />
        <Button
          value="Restart"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handleRestart(engine)
          }}
        />
        <Button
          value="Next"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handleNextTrack(engine)
          }}
          disabled={true}
        />
      </UiEntity>

      <Label
        value="Video Volume"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
        }}
      >
        <Button
          value="Minus"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handleMinus(engine)}
        />
        <Button
          value="Plus"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handlePlus(engine)}
        />
        <Button
          value="Mute"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handleMute(engine)}
        />
      </UiEntity>
    </UiEntity>
  )
}

function shareScreen(engine: IEngine, screenUrl: string) {
  console.log('Share clicked', screenUrl)
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit = adminToolkitEntities[0][1]
  if (
    !adminToolkit.videoControl.videoPlayers ||
    adminToolkit.videoControl.videoPlayers.length === 0
  )
    return
  const { VideoPlayer } = getExplorerComponents(engine)

  console.log(
    'all screens linked?',
    adminToolkit.videoControl.linkAllVideoPlayers,
  )

  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.src = screenUrl
    }
  }
}

function handlePlay(engine: IEngine) {
  console.log('Play clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.playing = true
    }
  }
}

function handlePause(engine: IEngine) {
  console.log('Pause clicked')
  const { VideoPlayer } = getExplorerComponents(engine)

  let videoPlayers = getVideoPlayers(engine)

  console.log('videoPlayers', videoPlayers)

  for (const videoPlayer of videoPlayers) {
    console.log('videoPlayer', videoPlayer)
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.playing = false
    }
  }
}

function handleRestart(engine: IEngine) {
  console.log('Restart clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.position = 0
    }
  }
}

// TODO: Previous track in playlist
function handlePreviosTrack(engine: IEngine) {
  console.log('Previous Track clicked')
}

// TODO: Next track in playlist
function handleNextTrack(engine: IEngine) {
  console.log('Next Track clicked')
}

function handleMinus(engine: IEngine) {
  console.log('Minus clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = videoSource.volume ? videoSource.volume - 0.1 : 0
    }
  }
}

function handlePlus(engine: IEngine) {
  console.log('Plus clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = videoSource.volume ? videoSource.volume + 0.1 : 0
    }
  }
}

function handleMute(engine: IEngine) {
  console.log('Mute clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = 0
    }
  }
}

function getSmartItems(
  engine: IEngine,
): NonNullable<AdminTools['smartItemActions']['smartItems']> {
  const { AdminTools } = getComponents(engine)

  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    !adminToolkit ||
    !adminToolkit.smartItemActions ||
    !adminToolkit.smartItemActions.smartItems ||
    adminToolkit.smartItemActions.smartItems.length === 0
  )
    return []

  return Array.from(adminToolkit.smartItemActions.smartItems)
}

function getSmartItemActions(
  engine: IEngine,
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
) {
  const { Actions } = getComponents(engine)
  if (!smartItem || !Actions.has(smartItem.entity as Entity)) return []

  const actions = Array.from(Actions.get(smartItem.entity as Entity).value)
  return actions
}

function renderSmartItems(engine: IEngine) {
  const smartItems = getSmartItems(engine)
  const actions =
    state.smartItemActions.selectedSmartItem !== undefined
      ? getSmartItemActions(
          engine,
          smartItems[state.smartItemActions.selectedSmartItem],
        )
      : []

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Smart Item Actions"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />

      <Label
        value="Selected Smart Item"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <Dropdown
        options={[
          'Select Smart Item',
          ...smartItems.map((item) => item.customName),
        ]}
        selectedIndex={(state.smartItemActions.selectedSmartItem ?? -1) + 1}
        onChange={(idx) => handleSelectSmartItem(smartItems, idx)}
        uiTransform={{
          width: '100%',
          height: '40px',
        }}
        color={Color4.White()}
      />

      <Label
        value="Actions"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />
      <Dropdown
        options={actions.map((action) => action.name)}
        disabled={state.smartItemActions.selectedSmartItem === undefined}
        onChange={(idx) => {
          handleSelectAction(
            smartItems[state.smartItemActions.selectedSmartItem!],
            actions[idx],
          )
        }}
        selectedIndex={actions.findIndex(
          (action) =>
            (state.smartItemActions.selectedSmartItem !== undefined &&
              action.name ===
                state.smartItemActions.smartItem.get(
                  smartItems[state.smartItemActions.selectedSmartItem]
                    .entity as Entity,
                )?.selectedAction) ||
            action.name ===
              smartItems[state.smartItemActions.selectedSmartItem!]
                .defaultAction,
        )}
        uiTransform={{
          width: '100%',
          height: '40px',
        }}
        color={Color4.White()}
      />

      <UiEntity uiTransform={{ flexDirection: 'row', margin: '10px 0 0 0' }}>
        <Button
          value={`${
            state.smartItemActions.selectedSmartItem !== undefined &&
            state.smartItemActions.smartItem.get(
              smartItems[state.smartItemActions.selectedSmartItem]
                .entity as Entity,
            )?.visible
              ? 'Hide'
              : 'Show'
          } Entity`}
          onMouseDown={() => handleHideShowEntity(engine, smartItems)}
          disabled={state.smartItemActions.selectedSmartItem === undefined}
          uiTransform={{ margin: '0 8px 0 0' }}
        />
        <Button
          value="Restart Action"
          onMouseDown={() =>
            handleRestartAction(
              smartItems[state.smartItemActions.selectedSmartItem!],
              actions.find(
                (action) =>
                  action.name ===
                  state.smartItemActions.smartItem.get(
                    smartItems[state.smartItemActions.selectedSmartItem!]
                      .entity as Entity,
                  )?.selectedAction,
              )!,
            )
          }
          uiTransform={{ margin: '0 8px 0 0' }}
        />
        <Button
          value="Default"
          onMouseDown={() =>
            handleResetToDefaultAction(
              smartItems[state.smartItemActions.selectedSmartItem!],
              actions.find(
                (action) =>
                  action.name ===
                  smartItems[state.smartItemActions.selectedSmartItem!]
                    .defaultAction,
              )!,
            )
          }
        />
      </UiEntity>
    </UiEntity>
  )
}

function handleSelectSmartItem(
  smartItems: NonNullable<AdminTools['smartItemActions']['smartItems']>,
  idx: number,
) {
  if (idx === 0) return

  const selectedSmartItemIdx = idx - 1

  let smartItemActions = {
    ...state.smartItemActions,
    selectedSmartItem: selectedSmartItemIdx,
  }

  const smartItem = smartItems[selectedSmartItemIdx]

  if (!state.smartItemActions.smartItem.has(smartItem.entity as Entity)) {
    const stateSmartItems = new Map(state.smartItemActions.smartItem)
    stateSmartItems.set(smartItem.entity as Entity, {
      visible: true,
      selectedAction: smartItem.defaultAction,
    })
    smartItemActions = {
      ...smartItemActions,
      smartItem: stateSmartItems,
    }
  }

  state = {
    ...state,
    smartItemActions,
  }
}

function handleExecuteAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  const actionEvents = getActionEvents(smartItem.entity as Entity)
  actionEvents.emit(action.name, getPayload(action))
}

function handleSelectAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  console.log('Action selected', action, smartItem)

  const stateSmartItems = new Map(state.smartItemActions.smartItem)
  stateSmartItems.set(smartItem.entity as Entity, {
    ...stateSmartItems.get(smartItem.entity as Entity)!,
    selectedAction: action.name,
  })

  state = {
    ...state,
    smartItemActions: {
      ...state.smartItemActions,
      smartItem: stateSmartItems,
    },
  }

  handleExecuteAction(smartItem, action)
}

function handleHideShowEntity(
  engine: IEngine,
  smartItems: NonNullable<AdminTools['smartItemActions']['smartItems']>,
) {
  console.log('Hide/Show entity clicked')

  const { VisibilityComponent } = getExplorerComponents(engine)

  const smartItemEntity = smartItems[state.smartItemActions.selectedSmartItem!]
    .entity as Entity
  const smartItem = state.smartItemActions.smartItem.get(smartItemEntity)

  const toggleVisibility = !smartItem!.visible
  state.smartItemActions.smartItem.get(smartItemEntity)!.visible =
    toggleVisibility

  const visibility = VisibilityComponent.getOrCreateMutable(smartItemEntity)
  visibility.visible = toggleVisibility
}

function handleRestartAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  console.log('Restart Action clicked', action)

  handleExecuteAction(smartItem, action)
}

function handleResetToDefaultAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  console.log('Reset to default action', action, smartItem)

  const stateSmartItems = new Map(state.smartItemActions.smartItem)
  stateSmartItems.set(smartItem.entity as Entity, {
    ...stateSmartItems.get(smartItem.entity as Entity)!,
    selectedAction: action.name,
  })

  state = {
    ...state,
    smartItemActions: {
      ...state.smartItemActions,
      smartItem: stateSmartItems,
    },
  }

  handleExecuteAction(smartItem, action)
}

function renderTextAnnouncement(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  players: PlayerHelper,
) {
  if (state.textAnnouncement.entity === undefined) {
    initTextAnnouncementUiStack(engine)
  }

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Text Announcement"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />
      <Input
        onSubmit={(value) => {
          state.textAnnouncement.text = value
        }}
        value={state.textAnnouncement.text}
        onChange={($) => (state.textAnnouncement.text = $)}
        fontSize={35}
        placeholder={'Write your announcement here'}
        placeholderColor={Color4.White()}
        color={Color4.White()}
        uiTransform={{
          width: '400px',
          height: '80px',
        }}
      ></Input>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Clear"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            handleClearTextAnnouncement(engine)
          }}
        />
        <Button
          value="Share"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40 }}
          onMouseDown={() => {
            handleSendTextAnnouncement(
              engine,
              pointerEventsSystem,
              players,
              state.textAnnouncement.text,
            )
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

function initTextAnnouncementUiStack(engine: IEngine) {
  const { UiTransform } = getExplorerComponents(engine)

  const uiStack = engine.addEntity()
  state.textAnnouncement.entity = uiStack

  // Get a UI Stack entity with center alignment
  const screenAlign = mapAlignToScreenAlign(
    AlignMode.TAM_BOTTOM_CENTER,
    YGFlexDirection.YGFD_COLUMN,
  )

  // Configure UI stack transform
  const uiStackTransformComponent = getUITransform(UiTransform, uiStack)
  uiStackTransformComponent.alignItems = screenAlign.alignItems
  uiStackTransformComponent.justifyContent = screenAlign.justifyContent
  uiStackTransformComponent.positionType = YGPositionType.YGPT_ABSOLUTE
  uiStackTransformComponent.flexDirection = YGFlexDirection.YGFD_COLUMN

  console.log('Init Text Announcement UI Stack', uiStackTransformComponent)
}

function removeUiTransformEntities(engine: IEngine, parentEntity: Entity) {
  const { UiTransform } = getExplorerComponents(engine)
  const entitiesWithUiTransform = engine.getEntitiesWith(UiTransform)

  for (const [uiEntity, uiTransform] of entitiesWithUiTransform) {
    if (uiTransform.parent === parentEntity) {
      removeUiTransformEntities(engine, uiEntity) // Recursively remove children
      console.log('Removing entity', uiEntity)
      engine.removeEntity(uiEntity)
    }
  }
}

function handleClearTextAnnouncement(engine: IEngine) {
  const textAnnouncementEntity = state.textAnnouncement.entity

  if (!textAnnouncementEntity) {
    return
  }

  removeUiTransformEntities(engine, textAnnouncementEntity)
  state.textAnnouncement.text = ''
  state.textAnnouncement.announcements = []
}

function handleSendTextAnnouncement(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  players: PlayerHelper,
  text: string,
) {
  const { UiText, UiTransform, UiBackground } = getExplorerComponents(engine)
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    state.textAnnouncement.announcements.length >=
    state.textAnnouncement.maxAnnouncements
  ) {
    const announcement = state.textAnnouncement.announcements[0]
    removeUiTransformEntities(engine, announcement.entity)
    engine.removeEntity(announcement.entity)
    state.textAnnouncement.announcements =
      state.textAnnouncement.announcements.slice(1)
  }

  const uiStack = state.textAnnouncement.entity!

  // Create container for the announcement
  const containerEntity = engine.addEntity()

  // Add to announcements array
  state.textAnnouncement.announcements.push({
    entity: containerEntity,
    timestamp: Date.now(),
  })

  const containerTransform = getUITransform(
    UiTransform,
    containerEntity,
    150,
    400,
    YGUnit.YGU_POINT,
  )
  containerTransform.parent = uiStack
  containerTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
  containerTransform.marginBottom = 10
  containerTransform.marginBottomUnit = YGUnit.YGU_POINT
  containerTransform.paddingTop = 10
  containerTransform.paddingTopUnit = YGUnit.YGU_POINT
  containerTransform.paddingBottom = 10
  containerTransform.paddingBottomUnit = YGUnit.YGU_POINT
  containerTransform.paddingLeft = 10
  containerTransform.paddingLeftUnit = YGUnit.YGU_POINT
  containerTransform.paddingRight = 10
  containerTransform.paddingRightUnit = YGUnit.YGU_POINT

  // Add dark background with rounded corners
  UiBackground.createOrReplace(containerEntity, {
    color: {
      r: 0.15,
      g: 0.15,
      b: 0.15,
      a: 0.95,
    },
    textureMode: BackgroundTextureMode.NINE_SLICES,
    uvs: [0, 0, 1, 0, 1, 1, 0, 1],
  })

  // TODO: Add message icon image
  // Create image entity
  // const imageEntity = engine.addEntity()
  // const imageTransform = getUITransform(
  //   UiTransform,
  //   imageEntity,
  //   50,
  //   380,
  //   YGUnit.YGU_POINT,
  // )
  // imageTransform.parent = containerEntity

  // // Add image background
  // getUIBackground(
  //   UiBackground,
  //   imageEntity,
  //   './images/messageIcon.png',
  // )

  // Create text entity
  const textEntity = engine.addEntity()
  const textTransform = getUITransform(
    UiTransform,
    textEntity,
    200,
    380,
    YGUnit.YGU_POINT,
  )
  textTransform.parent = containerEntity

  // Add the text component
  getUIText(
    UiText,
    textEntity,
    text,
    18,
    380,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Add author text if enabled
  if (adminToolkit?.textAnnouncement.showAuthorOnEachAnnouncement) {
    const player = players.getPlayer()
    const authorEntity = engine.addEntity()
    const authorTransform = getUITransform(UiTransform, authorEntity)
    authorTransform.parent = containerEntity
    authorTransform.positionType = YGPositionType.YGPT_ABSOLUTE
    authorTransform.positionRight = 5
    authorTransform.positionRightUnit = YGUnit.YGU_POINT
    authorTransform.positionBottom = 5
    authorTransform.positionBottomUnit = YGUnit.YGU_POINT

    // Add the author text component
    getUIText(
      UiText,
      authorEntity,
      `- ${!player || player?.isGuest ? 'Guest' : player?.name}`,
      14,
      380,
      TextAlignMode.TAM_BOTTOM_RIGHT,
      { r: 0.7, g: 0.7, b: 0.7, a: 1 },
    )
  }

  // Create close button entity
  const closeButtonEntity = engine.addEntity()
  const closeButtonTransform = getUITransform(
    UiTransform,
    closeButtonEntity,
    24,
    24,
    YGUnit.YGU_POINT,
  )
  closeButtonTransform.parent = containerEntity
  closeButtonTransform.positionType = YGPositionType.YGPT_ABSOLUTE
  closeButtonTransform.positionRight = 5
  closeButtonTransform.positionRightUnit = YGUnit.YGU_POINT
  closeButtonTransform.positionTop = 5
  closeButtonTransform.positionTopUnit = YGUnit.YGU_POINT

  // Add circular background for close button
  UiBackground.createOrReplace(closeButtonEntity, {
    color: { r: 0.3, g: 0.3, b: 0.3, a: 0.8 },
    textureMode: BackgroundTextureMode.NINE_SLICES,
    uvs: [1, 0, 1, 0, 1, 0, 0, 1],
  })

  // Add X text to close button
  getUIText(
    UiText,
    closeButtonEntity,
    'X',
    16,
    24,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Close button click handler
  pointerEventsSystem.onPointerDown(
    {
      entity: closeButtonEntity,
      opts: {
        button: InputAction.IA_POINTER,
      },
    },
    () => {
      removeUiTransformEntities(engine, containerEntity)
      engine.removeEntity(containerEntity)
      state.textAnnouncement.announcements =
        state.textAnnouncement.announcements.filter(
          (a) => a.entity !== containerEntity,
        )
    },
  )
}
