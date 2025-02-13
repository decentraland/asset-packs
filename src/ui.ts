import {
  IEngine,
  BackgroundTextureMode,
  Entity,
  InputAction,
  PointerEventsSystem,
  TextAlignMode,
  TextureWrapMode,
  YGAlign,
  YGFlexDirection,
  YGJustify,
  YGPositionType,
  YGUnit,
  YGDisplay,
  PointerFilterMode,
} from '@dcl/ecs'
import { Color4 } from '@dcl/sdk/math'
import { EngineComponents } from './definitions'
import { AlignMode, Font, ScreenAlignMode } from './enums'
import { CONTENT_SERVER } from './admin-toolkit-ui/constants'

function getAlignMode(align: AlignMode, isColumn: boolean) {
  switch (align) {
    case AlignMode.TAM_TOP_LEFT: {
      return {
        alignItems: YGAlign.YGA_FLEX_START,
        justifyContent: YGJustify.YGJ_FLEX_START,
      }
    }
    case AlignMode.TAM_TOP_CENTER: {
      return isColumn
        ? {
            alignItems: YGAlign.YGA_CENTER,
            justifyContent: YGJustify.YGJ_FLEX_START,
          }
        : {
            alignItems: YGAlign.YGA_FLEX_START,
            justifyContent: YGJustify.YGJ_CENTER,
          }
    }
    case AlignMode.TAM_TOP_RIGHT: {
      return isColumn
        ? {
            alignItems: YGAlign.YGA_FLEX_END,
            justifyContent: YGJustify.YGJ_FLEX_START,
          }
        : {
            alignItems: YGAlign.YGA_FLEX_START,
            justifyContent: YGJustify.YGJ_FLEX_END,
          }
    }
    case AlignMode.TAM_MIDDLE_LEFT: {
      return isColumn
        ? {
            alignItems: YGAlign.YGA_FLEX_START,
            justifyContent: YGJustify.YGJ_CENTER,
          }
        : {
            alignItems: YGAlign.YGA_CENTER,
            justifyContent: YGJustify.YGJ_FLEX_START,
          }
    }
    case AlignMode.TAM_MIDDLE_CENTER: {
      return {
        alignItems: YGAlign.YGA_CENTER,
        justifyContent: YGJustify.YGJ_CENTER,
      }
    }
    case AlignMode.TAM_MIDDLE_RIGHT: {
      return isColumn
        ? {
            alignItems: YGAlign.YGA_FLEX_END,
            justifyContent: YGJustify.YGJ_CENTER,
          }
        : {
            alignItems: YGAlign.YGA_CENTER,
            justifyContent: YGJustify.YGJ_FLEX_END,
          }
    }
    case AlignMode.TAM_BOTTOM_LEFT: {
      return isColumn
        ? {
            alignItems: YGAlign.YGA_FLEX_START,
            justifyContent: YGJustify.YGJ_FLEX_END,
          }
        : {
            alignItems: YGJustify.YGJ_FLEX_END,
            justifyContent: YGAlign.YGA_FLEX_START,
          }
    }
    case AlignMode.TAM_BOTTOM_CENTER: {
      return isColumn
        ? {
            alignItems: YGAlign.YGA_CENTER,
            justifyContent: YGJustify.YGJ_FLEX_END,
          }
        : {
            alignItems: YGAlign.YGA_FLEX_END,
            justifyContent: YGJustify.YGJ_CENTER,
          }
    }
    case AlignMode.TAM_BOTTOM_RIGHT: {
      return {
        alignItems: YGAlign.YGA_FLEX_END,
        justifyContent: YGJustify.YGJ_FLEX_END,
      }
    }
  }
}

export function mapAlignToScreenAlign(
  align: AlignMode,
  flexDirection = YGFlexDirection.YGFD_ROW,
): ScreenAlignMode {
  const isColumn = flexDirection === YGFlexDirection.YGFD_COLUMN

  switch (align) {
    case AlignMode.TAM_TOP_LEFT:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_TOP_CENTER:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_TOP_RIGHT:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_MIDDLE_LEFT:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_MIDDLE_CENTER:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_MIDDLE_RIGHT:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_BOTTOM_LEFT:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_BOTTOM_CENTER:
      return getAlignMode(align, isColumn) as any
    case AlignMode.TAM_BOTTOM_RIGHT:
      return getAlignMode(align, isColumn) as any
    default:
      // Handle default case or throw an error if needed
      throw new Error(`Unsupported AlignMode: ${align}`)
  }
}

export function getUITransform(
  component: EngineComponents['UiTransform'],
  entiy: Entity,
  height = 100,
  width = 100,
  unit: YGUnit = YGUnit.YGU_PERCENT,
) {
  let uiTransformComponent = component.getMutableOrNull(entiy)

  if (!uiTransformComponent) {
    uiTransformComponent = component.create(entiy)
    uiTransformComponent.heightUnit = unit
    uiTransformComponent.widthUnit = unit
    uiTransformComponent.height = height
    uiTransformComponent.width = width
    uiTransformComponent.maxHeightUnit = unit
    uiTransformComponent.maxWidthUnit = unit
    uiTransformComponent.maxHeight = height
    uiTransformComponent.maxWidth = width
  }

  if (entiy === 0) {
    uiTransformComponent.positionType = YGPositionType.YGPT_ABSOLUTE
  }

  return uiTransformComponent
}

export function getUIBackground(
  component: EngineComponents['UiBackground'],
  entity: Entity,
  src: string,
  textureMode = BackgroundTextureMode.NINE_SLICES,
  wrapMode = TextureWrapMode.TWM_CLAMP,
) {
  return component.createOrReplace(entity, {
    textureMode,
    texture: {
      tex: {
        $case: 'texture',
        texture: {
          src,
          wrapMode,
        },
      },
    },
    uvs: [],
  })
}

function breakLines(text: string, linelength: number) {
  const lineBreak = '\n'
  let counter = 0
  let line = ''
  let returnText = ''
  let bMatchFound = false
  const lineLen = linelength ? linelength : 50

  if (!text) return ''
  if (text.length < lineLen + 1) {
    return text
  }

  while (counter < text.length) {
    line = text.substring(counter, counter + lineLen)
    bMatchFound = false
    if (line.length == lineLen) {
      for (let i = line.length; i > -1; i--) {
        if (line.substring(i, i + 1) == ' ') {
          counter += line.substring(0, i).length
          line = line.substring(0, i) + lineBreak
          returnText += line
          bMatchFound = true
          break
        }
      }

      if (!bMatchFound) {
        counter += line.length
        line = line + lineBreak
        returnText += line
      }
    } else {
      returnText += line
      break // We're breaking out of the the while(), not the for()
    }
  }

  return returnText
}

export function getUIText(
  component: EngineComponents['UiText'],
  entity: Entity,
  text: string,
  fontSize = 10,
  containerWidth: number,
  align: TextAlignMode = TextAlignMode.TAM_MIDDLE_CENTER,
  color: Color4 = Color4.White(),
) {
  const lineLength = Math.floor(containerWidth / (fontSize / 1.7))

  return component.createOrReplace(entity, {
    value: breakLines(text, lineLength),
    fontSize,
    font: Font.F_MONOSPACE as any,
    textAlign: align as unknown as TextAlignMode,
    color,
  })
}

export function removeUiTransformEntities(
  engine: IEngine,
  UiTransform: EngineComponents['UiTransform'],
  parentEntity: Entity,
) {
  const entitiesWithUiTransform = engine.getEntitiesWith(UiTransform)

  for (const [uiEntity, uiTransform] of entitiesWithUiTransform) {
    if (uiTransform.parent === parentEntity) {
      // Recursively remove children
      removeUiTransformEntities(engine, UiTransform, uiEntity)
      engine.removeEntity(uiEntity)
    }
  }
}

const BTN_CLOSE_TEXT_ANNOUNCEMENT = `${CONTENT_SERVER}/admin_toolkit/assets/icons/text-announcement-close-button.png`

interface PromptAction {
  label: string
  onClick: () => void
}

interface PromptOptions {
  title: string
  width?: number
  height?: number
  onClose?: () => void
}

export function showPrompt(
  engine: IEngine,
  components: {
    UiTransform: EngineComponents['UiTransform']
    UiBackground: EngineComponents['UiBackground']
    UiText: EngineComponents['UiText']
    pointerEventsSystem: PointerEventsSystem
  },
  options: PromptOptions,
  renderBody: (containerEntity: Entity) => void,
  actions: PromptAction[],
) {
  const { UiTransform, UiBackground, UiText, pointerEventsSystem } = components
  const { title, width = 250, height = 250, onClose } = options

  // Create UI stack for centering
  const uiStack = engine.addEntity()
  const uiStackTransform = getUITransform(UiTransform, uiStack)
  uiStackTransform.display = YGDisplay.YGD_FLEX
  uiStackTransform.alignItems = YGAlign.YGA_CENTER
  uiStackTransform.justifyContent = YGJustify.YGJ_CENTER

  // Create container
  const containerEntity = engine.addEntity()
  const containerTransform = getUITransform(
    UiTransform,
    containerEntity,
    height,
    width,
    YGUnit.YGU_POINT,
  )
  containerTransform.parent = uiStack
  uiStackTransform.display = YGDisplay.YGD_FLEX
  containerTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
  containerTransform.alignItems = YGAlign.YGA_CENTER
  containerTransform.paddingTop = 20
  containerTransform.paddingTopUnit = YGUnit.YGU_POINT
  containerTransform.paddingBottom = 20
  containerTransform.paddingBottomUnit = YGUnit.YGU_POINT
  containerTransform.paddingLeft = 20
  containerTransform.paddingLeftUnit = YGUnit.YGU_POINT
  containerTransform.paddingRight = 20
  containerTransform.paddingRightUnit = YGUnit.YGU_POINT
  containerTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

  // Add dark background
  UiBackground.createOrReplace(containerEntity, {
    color: Color4.create(0.15, 0.15, 0.15, 0.95),
    textureMode: BackgroundTextureMode.NINE_SLICES,
    uvs: [],
  })

  // Create close button
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
  closeButtonTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

  getUIBackground(
    UiBackground,
    closeButtonEntity,
    BTN_CLOSE_TEXT_ANNOUNCEMENT,
    BackgroundTextureMode.STRETCH,
  )

  const handleClose = () => {
    removeUiTransformEntities(engine, UiTransform, uiStack)
    engine.removeEntity(uiStack)
    onClose?.()
  }

  pointerEventsSystem.onPointerDown(
    {
      entity: closeButtonEntity,
      opts: { button: InputAction.IA_POINTER },
    },
    handleClose,
  )

  // Add title
  const titleEntity = engine.addEntity()
  const titleTransform = getUITransform(
    UiTransform,
    titleEntity,
    20,
    200,
    YGUnit.YGU_POINT,
  )
  titleTransform.parent = containerEntity
  titleTransform.marginBottom = 10
  titleTransform.marginBottomUnit = YGUnit.YGU_POINT

  getUIText(
    UiText,
    titleEntity,
    title,
    20,
    200,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Render custom body content
  renderBody(containerEntity)

  // Add action buttons
  const actionsContainer = engine.addEntity()
  const actionsTransform = getUITransform(
    UiTransform,
    actionsContainer,
    30,
    width - 40,
    YGUnit.YGU_POINT,
  )
  actionsTransform.parent = containerEntity
  actionsTransform.display = YGDisplay.YGD_FLEX
  actionsTransform.flexDirection = YGFlexDirection.YGFD_ROW
  actionsTransform.justifyContent = YGJustify.YGJ_SPACE_AROUND
  actionsTransform.marginTop = 10
  actionsTransform.marginTopUnit = YGUnit.YGU_POINT

  actions.forEach((action) => {
    const buttonEntity = engine.addEntity()
    const buttonTransform = getUITransform(
      UiTransform,
      buttonEntity,
      30,
      100,
      YGUnit.YGU_POINT,
    )
    buttonTransform.parent = actionsContainer
    buttonTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

    UiBackground.createOrReplace(buttonEntity, {
      color: Color4.create(0.3, 0.3, 0.3, 1),
      textureMode: BackgroundTextureMode.NINE_SLICES,
      uvs: [],
    })

    getUIText(
      UiText,
      buttonEntity,
      action.label,
      16,
      100,
      TextAlignMode.TAM_MIDDLE_CENTER,
      Color4.White(),
    )

    pointerEventsSystem.onPointerDown(
      {
        entity: buttonEntity,
        opts: { button: InputAction.IA_POINTER },
      },
      () => {
        action.onClick()
        handleClose()
      },
    )
  })

  return uiStack
}

export function showCaptchaPrompt(
  engine: IEngine,
  components: {
    UiTransform: EngineComponents['UiTransform']
    UiBackground: EngineComponents['UiBackground']
    UiText: EngineComponents['UiText']
    UiInput: EngineComponents['UiInput']
    UiInputResult: EngineComponents['UiInputResult']
    pointerEventsSystem: PointerEventsSystem
  },
  data: { campaignId: string; dispenserKey: string; captcha: any },
  onSubmit: (inputText: string) => void,
) {
  let inputEntity: Entity

  return showPrompt(
    engine,
    components,
    {
      title: 'Enter the captcha',
      width: 250,
      height: 250,
    },
    (containerEntity) => {
      // Add captcha image
      const imageEntity = engine.addEntity()
      const imageTransform = getUITransform(
        components.UiTransform,
        imageEntity,
        80,
        200,
        YGUnit.YGU_POINT,
      )
      imageTransform.parent = containerEntity
      imageTransform.marginBottom = 10
      imageTransform.marginBottomUnit = YGUnit.YGU_POINT

      getUIBackground(
        components.UiBackground,
        imageEntity,
        data.captcha.image,
        BackgroundTextureMode.STRETCH,
      )

      // Add input field
      inputEntity = engine.addEntity()
      const inputTransform = getUITransform(
        components.UiTransform,
        inputEntity,
        50,
        200,
        YGUnit.YGU_POINT,
      )
      inputTransform.parent = containerEntity
      inputTransform.marginBottom = 10
      inputTransform.marginBottomUnit = YGUnit.YGU_POINT

      components.UiInput.createOrReplace(inputEntity, {
        placeholder: 'Enter the captcha',
        color: Color4.White(),
        placeholderColor: Color4.create(0.3, 0.3, 0.3, 1),
        disabled: false,
        textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
        font: Font.F_MONOSPACE as any,
        fontSize: 10,
      })

      components.UiInputResult.createOrReplace(inputEntity, {
        value: '',
        isSubmit: false,
      })

      // Store reference to input value
      components.UiInputResult.get(inputEntity)
    },
    [
      {
        label: 'Submit',
        onClick: () => {
          const inputValue = inputEntity
            ? components.UiInputResult.getOrNull(inputEntity)?.value ?? ''
            : ''
          return onSubmit(inputValue)
        },
      },
    ],
  )
}

// export function showCaptchaPrompt(
//   engine: IEngine,
//   UiTransform: EngineComponents['UiTransform'],
//   UiBackground: EngineComponents['UiBackground'],
//   UiText: EngineComponents['UiText'],
//   UiInput: EngineComponents['UiInput'],
//   UiInputResult: EngineComponents['UiInputResult'],
//   pointerEventsSystem: PointerEventsSystem,
//   data: { campaignId: string; dispenserKey: string; captcha: any },
//   onSubmit: (inputText: string) => void,
// ) {
//   // Create UI stack for centering
//   const uiStack = engine.addEntity()
//   const uiStackTransform = getUITransform(UiTransform, uiStack)
//   uiStackTransform.display = YGDisplay.YGD_FLEX
//   uiStackTransform.alignItems = YGAlign.YGA_CENTER
//   uiStackTransform.justifyContent = YGJustify.YGJ_CENTER

//   // Create container
//   const containerEntity = engine.addEntity()
//   const containerTransform = getUITransform(
//     UiTransform,
//     containerEntity,
//     250,
//     250,
//     YGUnit.YGU_POINT,
//   )
//   containerTransform.parent = uiStack
//   uiStackTransform.display = YGDisplay.YGD_FLEX
//   containerTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
//   containerTransform.alignItems = YGAlign.YGA_CENTER
//   containerTransform.paddingTop = 20
//   containerTransform.paddingTopUnit = YGUnit.YGU_POINT
//   containerTransform.paddingBottom = 20
//   containerTransform.paddingBottomUnit = YGUnit.YGU_POINT
//   containerTransform.paddingLeft = 20
//   containerTransform.paddingLeftUnit = YGUnit.YGU_POINT
//   containerTransform.paddingRight = 20
//   containerTransform.paddingRightUnit = YGUnit.YGU_POINT
//   containerTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

//   // Add dark background
//   UiBackground.createOrReplace(containerEntity, {
//     color: Color4.create(0.15, 0.15, 0.15, 0.95),
//     textureMode: BackgroundTextureMode.NINE_SLICES,
//     uvs: [],
//   })

//   // Create close button entity
//   const closeButtonEntity = engine.addEntity()
//   const closeButtonTransform = getUITransform(
//     UiTransform,
//     closeButtonEntity,
//     24,
//     24,
//     YGUnit.YGU_POINT,
//   )
//   closeButtonTransform.parent = containerEntity
//   closeButtonTransform.positionType = YGPositionType.YGPT_ABSOLUTE
//   closeButtonTransform.positionRight = 5
//   closeButtonTransform.positionRightUnit = YGUnit.YGU_POINT
//   closeButtonTransform.positionTop = 5
//   closeButtonTransform.positionTopUnit = YGUnit.YGU_POINT
//   closeButtonTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

//   getUIBackground(
//     UiBackground,
//     closeButtonEntity,
//     BTN_CLOSE_TEXT_ANNOUNCEMENT,
//     BackgroundTextureMode.STRETCH,
//   )

//   // Close button click handler
//   pointerEventsSystem.onPointerDown(
//     {
//       entity: closeButtonEntity,
//       opts: {
//         button: InputAction.IA_POINTER,
//       },
//     },
//     () => {
//       console.log('close button clicked')
//       removeUiTransformEntities(engine, UiTransform, uiStack)
//       engine.removeEntity(uiStack)
//     },
//   )

//   // Add title text
//   const titleEntity = engine.addEntity()
//   const titleTransform = getUITransform(
//     UiTransform,
//     titleEntity,
//     20,
//     200,
//     YGUnit.YGU_POINT,
//   )
//   titleTransform.parent = containerEntity
//   titleTransform.marginBottom = 10
//   titleTransform.marginBottomUnit = YGUnit.YGU_POINT

//   getUIText(
//     UiText,
//     titleEntity,
//     'Enter the captcha',
//     20,
//     200,
//     TextAlignMode.TAM_MIDDLE_CENTER,
//     Color4.White(),
//   )

//   // Add captcha image
//   const imageEntity = engine.addEntity()
//   const imageTransform = getUITransform(
//     UiTransform,
//     imageEntity,
//     80,
//     200,
//     YGUnit.YGU_POINT,
//   )
//   imageTransform.parent = containerEntity
//   imageTransform.marginBottom = 10
//   imageTransform.marginBottomUnit = YGUnit.YGU_POINT

//   getUIBackground(
//     UiBackground,
//     imageEntity,
//     data.captcha.image,
//     BackgroundTextureMode.STRETCH,
//   )

//   // Add input field
//   const inputEntity = engine.addEntity()
//   const inputTransform = getUITransform(
//     UiTransform,
//     inputEntity,
//     50,
//     200,
//     YGUnit.YGU_POINT,
//   )
//   inputTransform.parent = containerEntity
//   inputTransform.marginBottom = 10
//   inputTransform.marginBottomUnit = YGUnit.YGU_POINT

//   UiInput.createOrReplace(inputEntity, {
//     placeholder: 'Enter the captcha',
//     color: Color4.White(),
//     placeholderColor: Color4.create(0.3, 0.3, 0.3, 1),
//     disabled: false,
//     textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
//     font: Font.F_MONOSPACE as any,
//     fontSize: 10,
//   })

//   UiInputResult.createOrReplace(inputEntity, {
//     value: '',
//     isSubmit: false,
//   })

//   // Add submit button
//   const buttonEntity = engine.addEntity()
//   const buttonTransform = getUITransform(
//     UiTransform,
//     buttonEntity,
//     30,
//     100,
//     YGUnit.YGU_POINT,
//   )
//   buttonTransform.parent = containerEntity
//   buttonTransform.pointerFilter = PointerFilterMode.PFM_BLOCK

//   UiBackground.createOrReplace(buttonEntity, {
//     color: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
//     textureMode: BackgroundTextureMode.NINE_SLICES,
//     uvs: [],
//   })

//   getUIText(
//     UiText,
//     buttonEntity,
//     'Submit',
//     16,
//     100,
//     TextAlignMode.TAM_MIDDLE_CENTER,
//     Color4.White(),
//   )

//   // Add click handler for submit button
//   pointerEventsSystem.onPointerDown(
//     {
//       entity: buttonEntity,
//       opts: {
//         button: InputAction.IA_POINTER,
//       },
//     },
//     () => {
//       // Get input text value and call onSubmit callback
//       const inputText = UiInputResult.get(inputEntity)?.value || ''
//       onSubmit(inputText)

//       // Remove UI
//       removeUiTransformEntities(engine, UiTransform, uiStack)
//       engine.removeEntity(uiStack)
//     },
//   )

//   return uiStack
// }
