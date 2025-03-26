import ReactEcs, {
  UiEntity,
  Label,
  UiButtonProps,
  UiTransformProps,
} from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { CONTENT_URL } from './constants'

export const BTN_PRIMARY_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/button-primary.png`
export const BTN_SECONDARY_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/button-secondary.png`
export const BTN_TEXT_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/button-text.png`

export const BTN_BACKGROUND = {
  primary: BTN_PRIMARY_BACKGROUND,
  secondary: BTN_SECONDARY_BACKGROUND,
  text: BTN_TEXT_BACKGROUND,
}

export const BTN_BACKGROUND_COLOR = {
  primary: {
    active: Color4.create(252 / 255, 252 / 255, 252 / 255, 1),
    hover: Color4.create(207 / 255, 205 / 255, 212 / 255, 1),
    disabled: Color4.create(74 / 255, 74 / 255, 74 / 255, 1),
  },
  secondary: {
    active: Color4.create(252 / 255, 252 / 255, 252 / 255, 1),
    hover: Color4.create(207 / 255, 205 / 255, 212 / 255, 1),
    disabled: Color4.create(74 / 255, 74 / 255, 74 / 255, 1),
  },
  text: {
    active: Color4.create(0, 0, 0, 0),
    hover: Color4.create(24 / 255, 24 / 255, 24 / 255, 1),
    disabled: Color4.create(74 / 255, 74 / 255, 74 / 255, 1),
  },
}

type ButtonVariant = 'primary' | 'secondary' | 'text'

interface ButtonStateProps {
  getColor: (variant: ButtonVariant) => Color4
  backgroundImg: (variant: ButtonVariant) => string
}

// Store button states and visual properties in a Map
const buttonStates = new Map<string, ButtonStateProps>()

// Pre-compute the visual states
const ACTIVE_STATE: ButtonStateProps = {
  getColor: (variant) => BTN_BACKGROUND_COLOR[variant].active,
  backgroundImg: (variant: ButtonVariant) => BTN_BACKGROUND[variant],
}

const DISABLED_STATE: ButtonStateProps = {
  getColor: (variant) => BTN_BACKGROUND_COLOR[variant].disabled,
  backgroundImg: (variant: ButtonVariant) => BTN_BACKGROUND[variant],
}

const HOVER_STATE: ButtonStateProps = {
  getColor: (variant) => BTN_BACKGROUND_COLOR[variant].hover,
  backgroundImg: (variant: ButtonVariant) => BTN_BACKGROUND[variant],
}

interface CompositeButtonProps
  extends Omit<UiButtonProps, 'value' | 'variant'> {
  id: string
  value?: string
  icon?: string
  onlyIcon?: boolean
  iconTransform?: UiTransformProps
  variant?: ButtonVariant
  labelTransform?: UiTransformProps
}

export const Button = (props: CompositeButtonProps) => {
  const {
    id,
    value,
    onMouseDown,
    icon,
    onlyIcon,
    iconTransform,
    fontSize = 14,
    color = Color4.Black(),
    disabled,
    uiBackground,
    uiTransform,
    labelTransform,
    variant = 'primary',
  } = props

  const buttonId = `button_${id}`

  // Get or set initial state
  if (!buttonStates.has(buttonId)) {
    buttonStates.set(buttonId, disabled ? DISABLED_STATE : ACTIVE_STATE)
  }

  const buttonState = buttonStates.get(buttonId)!

  return (
    <UiEntity
      uiTransform={uiTransform}
      uiBackground={{
        ...uiBackground,
        ...(buttonState.backgroundImg
          ? {
              texture: {
                src: buttonState.backgroundImg(variant),
              },
              textureMode: 'stretch',
              color: buttonState.getColor(variant),
            }
          : {}),
      }}
      onMouseDown={() => {
        if (disabled) {
          return
        }
        onMouseDown?.()
      }}
      onMouseEnter={() => {
        if (!disabled) {
          buttonStates.set(buttonId, HOVER_STATE)
        }
      }}
      onMouseLeave={() => {
        buttonStates.set(buttonId, disabled ? DISABLED_STATE : ACTIVE_STATE)
      }}
    >
      {icon && (
        <UiEntity
          uiTransform={iconTransform}
          uiBackground={{
            texture: {
              src: icon,
            },
            textureMode: 'stretch',
          }}
        />
      )}
      {!onlyIcon && !!value ? (
        <Label
          value={value}
          color={color}
          fontSize={fontSize}
          uiTransform={labelTransform}
        />
      ) : null}
    </UiEntity>
  )
}
