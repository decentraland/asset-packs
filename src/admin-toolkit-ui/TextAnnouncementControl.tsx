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
import { State } from './types'
import { Button } from './Button'

const ICONS = {
  TEXT_ANNOUNCEMENT_CONTROL:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFbSURBVHgB7ZnNUcMwEEbXHvmeEuggoQKgA+jAHaQESCUkHaQEOoASUkK4+pdvZwLjeOxFzsHaKPtmNIrWkq0XWT6siAzDuFmS/zq0bbuo6/qZlID5HLIs+xi6JspAYo3Bb/i5IEUkSXJI0/SJ67P42ICqqnJU76SUk9A96uNvLBU6r0kxeGPuyrLMuzEndF4NhPlf+KIwPPYDWJllt+3In71z7oUCwSuBPfxJwv5NyZOmaTYUEN4jENpJfbxl8Dk8UnjEOXjLXAMmoxWT0YrJaMVktGIyWjEZrZiMVkxGKyajFZMJBTI0S+n6lLzZGUVRrHDzWXLQ/ByUB6SaxAT+RTJIxr2eEuqzgecNxb677cmvWQgRgX23MUlGkwjmsemf00hHGv113aLkfwN7ZyNzwYdNqHbIe2+9B7HMWMHm97+RBqIRYaIRYaIRYaIRYaIRYaIRYaIRMQxjlB87NPZAi3F9FgAAAABJRU5ErkJggg==',
  CHECK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAxBAMAAACBslwvAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAeUExURQAAAP///////////////////////////////////yR8m5UAAAAKdFJOUwALFiJZhZCbp7LJq75KAAAAcElEQVQ4y2NgGAXUAm4COCRYZibikPGcORWXlpnNuLTMMBjiWhhxalF3wKGFuXIKDi3sM2c6YHcYc+fMKTgcZgHWhM0vEE1Y/QLShN37IE04vA/UhCPEgJpwhZgFzkBm7sShBaipGVfCZDYYzZwYAAAIAjaLSy76UQAAAABJRU5ErkJggg==',
} as const

const BTN_CLOSE_TEXT_ANNOUNCEMENT =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAxCAYAAABznEEcAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQRSURBVHgB7VlPU9NAFH+bpgye7DcwfgKYccDqKH/GD4Dc9GS5OYWZpuhJKwSpXnTaoJUr+AmEm56sXOzIpUdvlm9Qbw60Wd+mhZZmk91NUnrpb0YHkrfJ/ni77/fLW4AxxhijHwRihGlaqeTpqdEGmAZNM4CQ6+BACgg96b6srjlO493u2zrEiMgk2MS1s3aGAl3Cx00D0JR4FGngi6saoZ/fV4pViIjQJNzJn7ZylBBTbuK+U2gQClul3e19CIlQJPLZjRwuESva5D1TadBkYtG2rQYoQomE+dQySKK1hz8uwJCAWbFKu8UtlTEJ2cAOgfZ3YJt2mCCwcHdmDn4eH/2QHSJFokeAGnAVYERm5w0kcigTLiRx5QR6mJbNiCYKGBEBF5SAlV/deCKKCyRhZguboyLQg2NjOTeCInxJuMsI/xIgBGngf6EUmBByIBHG9KgcFOBLQku0N0E8Dbe206S+CIpEKCUrpcr2Mi4ZYTnFmIfP1woLfve5JFgW0EZkIBA9ccJ/TRUijIDdVWi7UrRkiDgO5Pzu8TOhtzIgAKrkQb+6yhLpJ3CBlo6/k2bgOCy7zOrw7mk+E1wCATBT5rq78XsQEeER6CvhIguDRvMsw7vhIcEeijOUUmVWAmWJCAgYIAVtint18EJCbynZChki8RBg2ed7No0TqOyNgojgveU4CHTfZPD2hZcEBQNCwI8IVp9LWhDZxuCX4+Al3sa+ASHBI9KPOHyYrmniTEQFI2JmX3CXpKa3y8OwMR4SaAWaEAGdTcxvBDh6YgVCWpQgcPYE/QshwRWyPqgqOw8tx/H8kTmZgAaEgF8ZfZYtXLILkYlMTDQGL3lJhHh4kA44BGxVZQ9AnY0dvOgh0db1KihARshUlD0IBAg31kOiy7QKElBR4jiIOIRyv7m5JZYCEX6gE6JtqSpxMBFhVfQI5zn4OpFM7AutMXVy/XogK2Q8IuhOyyIXi0vJ9yuQ2+2o1ar/0rfnrpHgJtkkasqj9My9b+lbDyaVlLivt7S++nIPM58RDcFsLeO8mvzH+YAZLXLW/iPh85udrIVSYrYXxIaTwE65UjT9bvvaDnetgvizEZGKYCUkHDN+Buu6FRQR2DyrHR/V7szev9lp2Y8GlOqL9sfgJrPQANJkkqUxdr8jA3QPWAEt4buluuKjaGUyAiXshEjFgiS6bf0vMOyuOLhNiLz96Y0tG698yJJfK9j4lhwMBbiJCV2xFY/ApM8nzlH7dfQ1PTN/ghrBMiIqv/LAMopa8Nj+8Po3KCLSwaOZfZXBtRup6YzjDxyAHTvCAWQsR8Am9knxmCqDT5sS96xQGAmto3k8ZPaGZ61VEes5NoPbUmm5vasUnllfLDdH05qg6/UwB4tjjDGGGv4DI3MOHJgAfIoAAAAASUVORK5CYII='
const CHAT_MESSAGE_ICON =
  'data:image/png;base64,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'

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
    CHAT_MESSAGE_ICON,
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
    BTN_CLOSE_TEXT_ANNOUNCEMENT,
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
