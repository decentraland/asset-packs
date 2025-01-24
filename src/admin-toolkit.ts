import {
  Entity,
  IEngine,
  InputAction,
  PointerFilterMode,
  YGAlign,
  YGFlexDirection,
  YGJustify,
  YGPositionType,
  YGUnit,
  pointerEventsSystem,
  BackgroundTextureMode,
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { getComponents } from './definitions'
import { getExplorerComponents } from './components'
import {
  getUIBackground,
  getUIText,
  getUITransform,
  mapAlignToScreenAlign,
} from './ui'
import { AlignMode } from './enums'
import { createAdminToolkitUI } from './admin-ui'
import { ReactBasedUiSystem } from '@dcl/react-ecs'

// Create a system to manage the AdminToolkit
export function createAdminToolkitSystem(
  engine: IEngine,
  reactBasedUiSystem: ReactBasedUiSystem,
) {
  let adminToolkitEntity: Entity | null = null
  const { AdminTools } = getComponents(engine)

  return function adminToolkitSystem(_dt: number) {
    const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
    const hasAdminToolkit = adminToolkitEntities.length > 0

    // Create admin toolkit UI if the smart item exists and UI hasn't been created
    if (hasAdminToolkit && !adminToolkitEntity) {
      createAdminToolkitUI(engine, reactBasedUiSystem)
      adminToolkitEntity = adminToolkitEntities[0][0]
      console.log('Admin toolkit created with ui')
    }
    // Remove admin toolkit UI if the smart item is removed
    else if (!hasAdminToolkit && adminToolkitEntity) {
      engine.removeEntity(adminToolkitEntity)
      adminToolkitEntity = null
    }
  }
}

function createAdminToolkit(engine: IEngine): Entity {
  const { UiTransform, UiText, UiBackground } = getExplorerComponents(engine)

  // Get/Create a UI transform for the root entity
  getUITransform(UiTransform, engine.RootEntity)

  // Create a UI Stack entity for the panel
  const uiStack = engine.addEntity()

  // Get screen alignment for top-right position with column direction
  const screenAlign = mapAlignToScreenAlign(
    AlignMode.TAM_TOP_RIGHT,
    YGFlexDirection.YGFD_COLUMN,
  )
  const uiStackTransform = getUITransform(
    UiTransform,
    uiStack,
    200,
    400,
    YGUnit.YGU_POINT,
  )
  uiStackTransform.alignItems = screenAlign.alignItems
  uiStackTransform.justifyContent = screenAlign.justifyContent
  uiStackTransform.positionType = YGPositionType.YGPT_ABSOLUTE
  uiStackTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
  uiStackTransform.positionRight = 10 // Add some padding from the right edge
  uiStackTransform.positionTop = 10 // Add some padding from the top

  // Create panel background with transparency
  UiBackground.createOrReplace(uiStack, {
    textureMode: BackgroundTextureMode.STRETCH,
    color: { r: 0, g: 0, b: 0, a: 0.75 }, // #000000BF
    uvs: [],
  })

  // Create title
  const titleEntity = engine.addEntity()
  const titleTransform = getUITransform(
    UiTransform,
    titleEntity,
    30,
    380,
    YGUnit.YGU_POINT,
  )
  titleTransform.parent = uiStack
  titleTransform.alignItems = YGAlign.YGA_CENTER
  titleTransform.justifyContent = YGJustify.YGJ_CENTER

  getUIText(
    UiText,
    titleEntity,
    'Admin Panel',
    20,
    380,
    AlignMode.TAM_MIDDLE_CENTER,
    { r: 1, g: 1, b: 1, a: 1 },
  )

  // Create textboxes container
  const textboxesContainer = engine.addEntity()
  const textboxesTransform = getUITransform(
    UiTransform,
    textboxesContainer,
    100,
    380,
    YGUnit.YGU_POINT,
  )
  textboxesTransform.parent = uiStack
  textboxesTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
  textboxesTransform.alignItems = YGAlign.YGA_CENTER
  textboxesTransform.justifyContent = YGJustify.YGJ_SPACE_AROUND

  // Create 4 textboxes
  for (let i = 0; i < 4; i++) {
    const textboxEntity = engine.addEntity()
    const textboxTransform = getUITransform(
      UiTransform,
      textboxEntity,
      20,
      360,
      YGUnit.YGU_POINT,
    )
    textboxTransform.parent = textboxesContainer
    textboxTransform.alignItems = YGAlign.YGA_CENTER

    // Create textbox background with transparency
    UiBackground.createOrReplace(textboxEntity, {
      textureMode: BackgroundTextureMode.STRETCH,
      color: { r: 0, g: 0, b: 0, a: 0.75 }, // #000000BF
      uvs: [],
    })

    getUIText(
      UiText,
      textboxEntity,
      `Textbox ${i + 1}`,
      14,
      360,
      AlignMode.TAM_MIDDLE_LEFT,
      { r: 1, g: 1, b: 1, a: 1 },
    )
  }

  // Create buttons container
  const buttonsContainer = engine.addEntity()
  const buttonsTransform = getUITransform(
    UiTransform,
    buttonsContainer,
    40,
    380,
    YGUnit.YGU_POINT,
  )
  buttonsTransform.parent = uiStack
  buttonsTransform.flexDirection = YGFlexDirection.YGFD_ROW
  buttonsTransform.alignItems = YGAlign.YGA_CENTER
  buttonsTransform.justifyContent = YGJustify.YGJ_SPACE_AROUND

  // Create Save and Cancel buttons
  const buttonLabels = ['Save', 'Cancel']
  for (let i = 0; i < buttonLabels.length; i++) {
    const buttonEntity = engine.addEntity()
    const buttonTransform = getUITransform(
      UiTransform,
      buttonEntity,
      30,
      150,
      YGUnit.YGU_POINT,
    )
    buttonTransform.parent = buttonsContainer
    buttonTransform.alignItems = YGAlign.YGA_CENTER
    buttonTransform.justifyContent = YGJustify.YGJ_CENTER
    buttonTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

    // Create button background with transparency
    UiBackground.createOrReplace(buttonEntity, {
      textureMode: BackgroundTextureMode.STRETCH,
      color: { r: 0, g: 0, b: 0, a: 0.75 }, // #000000BF
      uvs: [],
    })

    getUIText(
      UiText,
      buttonEntity,
      buttonLabels[i],
      16,
      150,
      AlignMode.TAM_MIDDLE_CENTER,
      { r: 1, g: 1, b: 1, a: 1 },
    )

    // Add click handler
    pointerEventsSystem.onPointerDown(
      {
        entity: buttonEntity,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: `${buttonLabels[i]} changes`,
        },
      },
      () => {
        console.log(`${buttonLabels[i]} button clicked`)
      },
    )
  }

  return uiStack
}
