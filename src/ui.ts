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
} from '@dcl/ecs'
import { Color4 } from '@dcl/sdk/math'
import { EngineComponents } from './definitions'
import { AlignMode, Font, ScreenAlignMode } from './enums'

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

export function showCaptchaPrompt(
  engine: IEngine,
  UiTransform: EngineComponents['UiTransform'],
  UiBackground: EngineComponents['UiBackground'],
  UiText: EngineComponents['UiText'],
  pointerEventsSystem: PointerEventsSystem,
  data: { campaignId: string; dispenserKey: string; captcha: any },
  onSubmit: (inputText: string) => void,
) {
  // Create UI stack for centering
  const uiStack = engine.addEntity()
  const uiStackTransform = getUITransform(UiTransform, uiStack)
  uiStackTransform.positionType = YGPositionType.YGPT_ABSOLUTE
  uiStackTransform.alignItems = YGAlign.YGA_CENTER
  uiStackTransform.alignContent = YGAlign.YGA_CENTER
  uiStackTransform.width = 400
  uiStackTransform.height = 300

  // Create container
  const containerEntity = engine.addEntity()
  const containerTransform = getUITransform(UiTransform, containerEntity)
  containerTransform.parent = uiStack
  containerTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
  containerTransform.alignItems = YGAlign.YGA_CENTER
  containerTransform.width = 400
  containerTransform.height = 300
  containerTransform.paddingTop = 20
  containerTransform.paddingTopUnit = YGUnit.YGU_POINT
  containerTransform.paddingBottom = 20
  containerTransform.paddingBottomUnit = YGUnit.YGU_POINT
  containerTransform.paddingLeft = 20
  containerTransform.paddingLeftUnit = YGUnit.YGU_POINT
  containerTransform.paddingRight = 20
  containerTransform.paddingRightUnit = YGUnit.YGU_POINT

  // Add dark background
  UiBackground.createOrReplace(containerEntity, {
    color: Color4.create(0.15, 0.15, 0.15, 0.95),
    textureMode: BackgroundTextureMode.NINE_SLICES,
    uvs: [0, 0, 1, 0, 1, 1, 0, 1],
  })

  // Add title text
  const titleEntity = engine.addEntity()
  const titleTransform = getUITransform(UiTransform, titleEntity)
  titleTransform.parent = containerEntity
  titleTransform.marginBottom = 20
  titleTransform.marginBottomUnit = YGUnit.YGU_POINT

  getUIText(
    UiText,
    titleEntity,
    'Enter the captcha',
    20,
    200,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Add captcha image
  const imageEntity = engine.addEntity()
  const imageTransform = getUITransform(UiTransform, imageEntity)
  imageTransform.parent = containerEntity
  imageTransform.width = 200
  imageTransform.height = 80
  imageTransform.marginBottom = 20
  imageTransform.marginBottomUnit = YGUnit.YGU_POINT

  getUIBackground(
    UiBackground,
    imageEntity,
    data.captcha.image,
    BackgroundTextureMode.STRETCH,
  )

  // Add input field
  const inputEntity = engine.addEntity()
  const inputTransform = getUITransform(UiTransform, inputEntity)
  inputTransform.parent = containerEntity
  inputTransform.width = 200
  inputTransform.height = 30
  inputTransform.marginBottom = 20
  inputTransform.marginBottomUnit = YGUnit.YGU_POINT

  // Add submit button
  const buttonEntity = engine.addEntity()
  const buttonTransform = getUITransform(UiTransform, buttonEntity)
  buttonTransform.parent = containerEntity
  buttonTransform.width = 100
  buttonTransform.height = 30
  buttonTransform.alignItems = YGAlign.YGA_CENTER
  buttonTransform.alignContent = YGAlign.YGA_CENTER

  UiBackground.createOrReplace(buttonEntity, {
    color: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
    textureMode: BackgroundTextureMode.NINE_SLICES,
    uvs: [0, 0, 1, 0, 1, 1, 0, 1],
  })

  getUIText(
    UiText,
    buttonEntity,
    'Submit',
    16,
    100,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Add click handler for submit button
  pointerEventsSystem.onPointerDown(
    {
      entity: buttonEntity,
      opts: {
        button: InputAction.IA_POINTER,
      },
    },
    () => {
      // Get input text value and call onSubmit callback
      const inputText = UiText.get(inputEntity)?.value || ''
      onSubmit(inputText)

      // Remove UI
      engine.removeEntity(uiStack)
    },
  )

  return uiStack
}
