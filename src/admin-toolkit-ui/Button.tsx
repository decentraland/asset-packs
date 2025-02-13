import ReactEcs, {
  UiEntity,
  Label,
  UiButtonProps,
  UiTransformProps,
} from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'

export const BTN_PRIMARY_BACKGROUND =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKYAAABUCAYAAAAI0kxlAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAN0SURBVHgB7d3tTdtgFIbhYwf+pxuECYAJGjagE9BOAExA2KBM0HQC2KB0AmAC0gma//nqeSw7cpOQD5PER+19SZUTx1Urceu8dhKLxLZgMpk0R6PReZIkx/645dsT7fOXmoZ/mv+se/6z7vn22bcvjUbjUfvsnRKrSOGNx+NL37b9aduAXB7p3Xsi3TjMUpBXxkTEal0P9HbTQDcK05frG4JEFR5mR4Guffw6B+m80afkvW9PDKhIUzNN07N1pme66gCP8cIn5RNR4r004NTScDg8X3Xs0jC1dPufrrF0Y3vU0r3aWnbQm0t5fj7ZMWBHlp13LgwzH7X3BuyYh/nZA/0+u38uzOI8wFi+sR99j/N09oJoLkyP8lVxGrAnekNecZb3/XXxk59XtgzYI73jMxgMOuV9SelFLeGvBtRDS/qRT8++nkwn5qrLd2DHmn7RfVU8ySYm0xJBTKdmNjE9yrYB9ZtOzSxML/TSgAC8xY/ZlmUc0fhy/iFlGUc0uhsi5VtDiEZNprpPx4BYWgqzZUAgGpaJX55PDIilT5gIaeWtFUAdCBMhESZCIkyERJgIiTAREmEiJMJESISJkAgTIREmQiJMhESYCIkwERJhIiTCREiEiZAIEyERJkIiTIREmAiJMBESYSIkwkRIhImQCBMhESZCIkyERJgIiTAREmEiJMJESISJkAgTIREmQiJMhESYCElh9g0IRr+AijARTU+/S/LZgFiyMH8ZEIg3+aKlnImJUNRk4nU2R6PRbwOCaDQaR8XFz6MBAWTTMkl62fuYPjV/GhCAt3inbZI/0XL+6g+bBtRIy/h0Ymo5L0oFatRVlHqQFHuYmqhbMS31ePpZOVMTdfL2bosoJZk9wKfmkx90YsCeKEhNy/K+uW8XpWn6yfhiB/an782dze6cCzMfp9cG7MeX8hJeWPh9zIODg67WfAN2SI15aw+LXkuW/cXBYNDxmm8M2DJFeXh42Hnr9aVhynA4PPfNN+NtJGyHrl+utSovO2hlmOJ1t8bj8Q9tDahIn4Pr4nrROeWste75KS7nOe9ERXqP/NYbOl0nSllrYpZpaurc08u/MGC57EMbX7a/bnoLz8ZhFhSovxnf9n/wkjfkMeNR31irEmShcphlRaQK1P8jx/6nxfnof6Gff5T9rFt0dA7py/XDNm5w/AMe3IJOf0EUqQAAAABJRU5ErkJggg=='
export const BTN_SECONDARY_BACKGROUND =
  'data:image/png;base64,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'
export const BTN_TEXT_BACKGROUND =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKYAAABUCAYAAAAI0kxlAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALoSURBVHgB7dpta9NQGMbxu6t2rDg2HVo6EEVBv//HURRfCB1OBoPWzlUGnqvNmbG0NU0fcuH+P7j3kHXv/pwkJ2nFdjxKc5Kmm6aT5qg41g78727TTNLcpBmnGRXHNtKK+hTe8zTHxQCZAr2MDSKtE2YOshesiPi3qzQXsWag64bZD4JEPYOYBVpJ1TAP07yN2bUjUJeuRT9GhdWzysp3FrMoOwFsRr2pp5/FrPzgKjp1v0xzEMB2qKVnxc+jZR9aFaaiPA9gN/JOzsI4l4V5muZVALulOPMe6F8WnaJ1o/M6gP3QpeLh/MFFYb4LtoOwP2rtzaKDZbquPA1gvx7HbOtymA+UV0wtp9zsoCkvorRQlsPsB9AcRdnLv+QwtVqeBdCs+1Uzh/kkgObdr5o5zF4AHqaLpMLUaZyXM+BCm+5thclpHG6eKsxuAF6OFCancbjp5GtMwElXYfICMNy0eQEYjggTnggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlggTlhTmXQBmCBOOJgpzHICXaZiTALyMWTHhaBrmdQBehvnmZxiAh5sorjFlFICHb/pyUPqFbSM4mJ69c5iK8jKAZl1FsUtUfiTJqommDfIP5TBZNdGkiyjtqc+/xKFi2dfEvinIQfnAoreLPgendOyPWvswf7C95IO/0pwGsHtf0vyYP9he8mFtcrbSHAewO7qu/L7oD+0V/6T9JOLErijKwbI/rgpTFKdWz5PgbXdshy4Vv0bxhGeZVlTTSfO++A7UpUXuU1R41bJqmNl5mn4A68l75IOq/7BumKJVU4GeBbBaDnLtp4p1wswUqG6MemmOAvhDb6vp/qT2Y+5NwizLkXaL6QTXow/BXTG6dryN2VPD69jCA5rfPctk+CK4oRAAAAAASUVORK5CYII='

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
          uiTransform={{
            ...iconTransform,
          }}
          uiBackground={{
            texture: {
              src: icon,
            },
            textureMode: 'stretch',
          }}
        />
      )}
      {!onlyIcon && !!value ? (
        <Label value={value} color={color} fontSize={fontSize} />
      ) : null}
    </UiEntity>
  )
}
