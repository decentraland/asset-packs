import ReactEcs, {
  UiEntity,
  Label,
  UiButtonProps,
  UiTransformProps,
  UiBackgroundProps,
} from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { CONTENT_URL } from './constants'

export const BTN_PRIMARY_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/button-primary.png`
export const BTN_SECONDARY_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/button-secondary.png`
export const BTN_TEXT_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/button-text.png`

export const BTN_BACKGROUND_COLOR = {
  primary: {
    active: Color4.create(252 / 255, 252 / 255, 252 / 255, 1),
    hover: Color4.create(207 / 255, 205 / 255, 212 / 255, 1),
    disabled: Color4.create(74 / 255, 74 / 255, 74 / 255, 1),
  },
  secondary: {
    active: Color4.create(252 / 255, 252 / 255, 252 / 255, 0),
    hover: Color4.create(207 / 255, 205 / 255, 212 / 255, 0),
    disabled: Color4.create(74 / 255, 74 / 255, 74 / 255, 0),
  },
  text: {
    active: Color4.create(0, 0, 0, 0),
    hover: Color4.create(24 / 255, 24 / 255, 24 / 255, 1),
    disabled: Color4.create(74 / 255, 74 / 255, 74 / 255, 1),
  },
}

export const BTN_BORDER_COLOR = {
  primary: {
    active: Color4.Clear(),
    hover: Color4.Clear(),
    disabled: Color4.Clear(),
  },
  secondary: {
    active: Color4.White(),
    hover: Color4.White(),
    disabled: Color4.fromHexString('#323232'),
  },
  text: {
    active: Color4.Clear(),
    hover: Color4.Clear(),
    disabled: Color4.Clear(),
  },
}

type ButtonVariant = 'primary' | 'secondary' | 'text'

interface ButtonStateProps {
  getColor: (variant: ButtonVariant) => Color4
  borderColor: (variant: ButtonVariant) => Color4
}

// Store button states and visual properties in a Map
const buttonStates = new Map<string, ButtonStateProps>()

// Pre-compute the visual states
const ACTIVE_STATE: ButtonStateProps = {
  getColor: (variant) => BTN_BACKGROUND_COLOR[variant].active,
  borderColor: (variant) => BTN_BORDER_COLOR[variant].active
}

const DISABLED_STATE: ButtonStateProps = {
  getColor: (variant) => BTN_BACKGROUND_COLOR[variant].disabled,
  borderColor: (variant) => BTN_BORDER_COLOR[variant].disabled,
}

const HOVER_STATE: ButtonStateProps = {
  getColor: (variant) => BTN_BACKGROUND_COLOR[variant].hover,
  borderColor: (variant) => BTN_BORDER_COLOR[variant].hover,
}

interface CompositeButtonProps
  extends Omit<UiButtonProps, 'value' | 'variant'> {
  id: string
  value?: string
  icon?: string
  iconRight?: string
  iconRightTransform?: UiTransformProps
  onlyIcon?: boolean
  iconTransform?: UiTransformProps
  iconBackground?: UiBackgroundProps
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
    iconBackground,
    iconRight,
    iconRightTransform,
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
      uiTransform={{
        borderColor: buttonState.borderColor(variant),
        borderWidth: 2,
        borderRadius: 24,
        ...uiTransform,
      }}
      uiBackground={{
        color: buttonState.getColor(variant),
        ...uiBackground,
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
            ...iconBackground,
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
      {iconRight && (
        <UiEntity
          uiTransform={iconRightTransform}
          uiBackground={{
            texture: {
              src: iconRight,
            },
            textureMode: 'stretch',
          }}
        />
      )}
    </UiEntity>
  )
}
