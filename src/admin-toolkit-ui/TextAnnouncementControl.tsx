import {
  BackgroundTextureMode,
  IEngine,
  InputAction,
  PointerEventsSystem,
  TextAlignMode,
  YGAlign,
  YGFlexDirection,
  YGPositionType,
  YGUnit,
} from '@dcl/ecs'
import ReactEcs, { Label, UiEntity, Input } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { AlignMode, getComponents } from '../definitions'
import { getExplorerComponents } from '../components'
import {
  getUIBackground,
  getUIText,
  getUITransform,
  removeUiTransformEntities,
  mapAlignToScreenAlign,
} from '../ui'
import { IPlayersHelper } from '../types'
import { Button } from './Button'
import { CONTENT_URL } from './constants'
import { State } from './types'

const ICONS = {
  TEXT_ANNOUNCEMENT_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/text-announcement-control.png`,
  CHECK: `${CONTENT_URL}/admin_toolkit/assets/icons/text-announcement-check.png`,
  BTN_CLOSE_TEXT_ANNOUNCEMENT: `${CONTENT_URL}/admin_toolkit/assets/icons/text-announcement-close-button.png`,
  CHAT_MESSAGE_ICON: `${CONTENT_URL}/admin_toolkit/assets/icons/text-announcement-chat-message.png`,
} as const

let ANNOUNCEMENT_STATE: 'sent' | 'cleared'

export function renderTextAnnouncementControl(
  engine: IEngine,
  state: State,
  pointerEventsSystem: PointerEventsSystem,
  playersHelper?: IPlayersHelper,
) {
  if (state.textAnnouncementControl.entity === undefined) {
    initTextAnnouncementUiStack(engine, state)
  }

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
          margin: { bottom: 10 },
          height: 30,
        }}
      >
        <UiEntity
          uiTransform={{ width: 30, height: 30 }}
          uiBackground={{
            color: Color4.White(),
            textureMode: 'stretch',
            texture: { src: ICONS.TEXT_ANNOUNCEMENT_CONTROL },
          }}
        />
        <Label
          value="<b>Text Announcement</b>"
          fontSize={24}
          color={Color4.White()}
        />
      </UiEntity>
      <UiEntity uiTransform={{ flexDirection: 'column' }}>
        <Label
          value="<b>Message window</b>"
          fontSize={16}
          color={Color4.White()}
          uiTransform={{ margin: { bottom: 16 } }}
        />

        <Input
          onSubmit={(value) => {
            state.textAnnouncementControl.text = value
          }}
          value={state.textAnnouncementControl.text}
          onChange={($) => {
            if ($.length <= 150) {
              state.textAnnouncementControl.text = $
            }
          }}
          fontSize={16}
          placeholder={'Write your announcement here'}
          placeholderColor={Color4.create(160 / 255, 155 / 255, 168 / 255, 1)}
          color={Color4.Black()}
          uiBackground={{ color: Color4.White() }}
          uiTransform={{
            width: '100%',
            height: '80px',
            margin: { bottom: 16 },
          }}
        />

        <UiEntity
          uiTransform={{
            width: '100%',
            height: 40,
            flexDirection: 'row',
            margin: '0 0 10px 0',
          }}
        >
          <Label
            value={`${state.textAnnouncementControl.text?.length ?? 0}/150`}
            fontSize={14}
            color={Color4.create(187 / 255, 187 / 255, 187 / 255, 1)}
            uiTransform={{ flexGrow: 1 }}
            textAlign="top-left"
          />
          <Button
            id="text_announcement_control_clear"
            value="<b>Clear</b>"
            variant="text"
            fontSize={16}
            color={Color4.White()}
            uiTransform={{ height: 40, margin: { right: 8 } }}
            onMouseDown={() => {
              handleClearTextAnnouncement(engine, state)
            }}
          />
          <Button
            id="text_announcement_control_share"
            value="<b>Share</b>"
            variant="primary"
            fontSize={16}
            uiTransform={{ height: 40 }}
            onMouseDown={() => {
              handleSendTextAnnouncement(
                engine,
                state,
                pointerEventsSystem,
                state.textAnnouncementControl.text,
                playersHelper,
              )
            }}
          />
        </UiEntity>
      </UiEntity>
      {ANNOUNCEMENT_STATE !== undefined ? (
        <UiEntity>
          <UiEntity
            uiBackground={{
              texture: { src: ICONS.CHECK },
              textureMode: 'stretch',
            }}
            uiTransform={{ width: 30, height: 30 }}
          />
          <Label
            value={`Message ${ANNOUNCEMENT_STATE === 'sent' ? 'sent' : 'cleared'}!`}
            fontSize={14}
            color={Color4.create(187 / 255, 187 / 255, 187 / 255, 1)}
          />
        </UiEntity>
      ) : null}
    </UiEntity>
  )
}

function initTextAnnouncementUiStack(engine: IEngine, state: State) {
  const { UiTransform } = getExplorerComponents(engine)

  const uiStack = engine.addEntity()
  state.textAnnouncementControl.entity = uiStack

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
}

function handleClearTextAnnouncement(engine: IEngine, state: State) {
  const { UiTransform } = getExplorerComponents(engine)
  const textAnnouncementEntity = state.textAnnouncementControl.entity

  if (!textAnnouncementEntity) {
    return
  }

  removeUiTransformEntities(engine, UiTransform, textAnnouncementEntity)
  state.textAnnouncementControl.text = ''
  state.textAnnouncementControl.announcements = []
  ANNOUNCEMENT_STATE = 'cleared'
}

function handleSendTextAnnouncement(
  engine: IEngine,
  state: State,
  pointerEventsSystem: PointerEventsSystem,
  text: string | undefined,
  playersHelper?: IPlayersHelper,
) {
  if (!text) {
    return
  }

  const { UiText, UiTransform, UiBackground } = getExplorerComponents(engine)
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    state.textAnnouncementControl.announcements.length >=
    state.textAnnouncementControl.maxAnnouncements
  ) {
    const announcement = state.textAnnouncementControl.announcements[0]
    removeUiTransformEntities(engine, UiTransform, announcement.entity)
    engine.removeEntity(announcement.entity)
    state.textAnnouncementControl.announcements =
      state.textAnnouncementControl.announcements.slice(1)
  }

  const uiStack = state.textAnnouncementControl.entity!

  // Create container for the announcement
  const containerEntity = engine.addEntity()

  // Add to announcements array
  state.textAnnouncementControl.announcements.push({
    entity: containerEntity,
    timestamp: Date.now(),
  })
  ANNOUNCEMENT_STATE = 'sent'

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

  // Create image entity
  const imageEntity = engine.addEntity()
  const imageTransform = getUITransform(
    UiTransform,
    imageEntity,
    80,
    50,
    YGUnit.YGU_POINT,
  )
  imageTransform.parent = containerEntity
  imageTransform.alignSelf = YGAlign.YGA_CENTER
  imageTransform.positionTop = 20
  imageTransform.positionTopUnit = YGUnit.YGU_POINT

  // Add image background
  getUIBackground(
    UiBackground,
    imageEntity,
    ICONS.CHAT_MESSAGE_ICON,
    BackgroundTextureMode.STRETCH,
  )

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
  if (adminToolkit?.textAnnouncementControl.showAuthorOnEachAnnouncement) {
    const player = playersHelper?.getPlayer()
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

  getUIBackground(
    UiBackground,
    closeButtonEntity,
    ICONS.BTN_CLOSE_TEXT_ANNOUNCEMENT,
    BackgroundTextureMode.STRETCH,
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
      removeUiTransformEntities(engine, UiTransform, containerEntity)
      engine.removeEntity(containerEntity)
      state.textAnnouncementControl.announcements =
        state.textAnnouncementControl.announcements.filter(
          (a) => a.entity !== containerEntity,
        )
    },
  )
}
