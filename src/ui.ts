import {
  BackgroundTextureMode,
  Entity,
  TextAlignMode,
  TextureWrapMode,
  UiBackground,
  UiText,
  UiTransform,
  YGAlign,
  YGFlexDirection,
  YGJustify,
  YGPositionType,
  YGUnit,
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
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
  entiy: Entity,
  height = 100,
  width = 100,
  unit: YGUnit = YGUnit.YGU_PERCENT,
) {
  let uiTransformComponent = UiTransform.getMutableOrNull(entiy)

  if (!uiTransformComponent) {
    uiTransformComponent = UiTransform.create(entiy)
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
  entity: Entity,
  src: string,
  textureMode = BackgroundTextureMode.NINE_SLICES,
  wrapMode = TextureWrapMode.TWM_CLAMP,
) {
  return UiBackground.createOrReplace(entity, {
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
  entity: Entity,
  text: string,
  fontSize = 10,
  containerWidth: number,
  align: AlignMode = AlignMode.TAM_MIDDLE_CENTER,
  color: Color4 = Color4.Black(),
) {
  const lineLength = Math.floor(containerWidth / (fontSize / 1.7))

  return UiText.createOrReplace(entity, {
    value: breakLines(text, lineLength),
    fontSize,
    font: Font.F_MONOSPACE as any,
    textAlign: align as unknown as TextAlignMode,
    color,
  })
}
