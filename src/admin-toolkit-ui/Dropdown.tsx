import ReactEcs, { Label, UiEntity, UiTransformProps } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { CONTENT_URL } from './constants'

// Constants
export const DROPDOWN_BACKGROUND = `${CONTENT_URL}/admin_toolkit/assets/backgrounds/dropdown-background.png`
export const DROPDOWN_ARROW = `${CONTENT_URL}/admin_toolkit/assets/icons/dropdown-arrow.png`

const COLORS = {
  PRIMARY: Color4.White(),
  SECONDARY: Color4.create(160 / 255, 155 / 255, 168 / 255, 1),
  DISABLED: Color4.create(74 / 255, 74 / 255, 74 / 255, 1),
} as const

interface DropdownOption {
  value: string
  label: string
  leftIcon?: string
  rightIcon?: string
}

interface DropdownProps {
  options: DropdownOption[]
  selectedIndex?: number
  onChange?: (index: number) => void
  disabled?: boolean
  placeholder?: string
  uiTransform?: UiTransformProps
  maxHeight?: number
  fontSize?: number
}

interface DropdownState {
  isOpen: boolean
}

// Store dropdown states in a Map
const dropdownStates = new Map<string, DropdownState>()

export function Dropdown({
  options,
  selectedIndex = -1,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  uiTransform,
  maxHeight = 200,
  fontSize = 16,
}: DropdownProps) {
  const dropdownId = `dropdown_${options.map((opt) => opt.value).join('_')}`
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  // Get or set initial state
  if (!dropdownStates.has(dropdownId)) {
    dropdownStates.set(dropdownId, { isOpen: false })
  }

  const dropdownState = dropdownStates.get(dropdownId)!

  return (
    <UiEntity
      uiTransform={{
        minWidth: 150,
        position: { top: 0, left: 0 },
        positionType: 'relative',
        ...uiTransform,
      }}
    >
      {/* Dropdown Header */}
      <UiEntity
        uiTransform={{
          height: 40,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: {
            left: 12,
            right: 12,
          },
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: { src: DROPDOWN_BACKGROUND },
          color: disabled ? COLORS.DISABLED : COLORS.PRIMARY,
        }}
        onMouseDown={() => {
          if (!disabled) {
            dropdownStates.set(dropdownId, { isOpen: !dropdownState.isOpen })
          }
        }}
      >
        {selectedOption?.leftIcon && (
          <UiEntity
            uiTransform={{
              width: 20,
              height: 20,
              margin: {
                right: 8,
              },
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: { src: selectedOption.leftIcon },
            }}
          />
        )}
        <Label
          value={selectedOption?.label ?? placeholder}
          fontSize={fontSize}
          color={disabled ? COLORS.DISABLED : COLORS.SECONDARY}
        />
        <UiEntity
          uiTransform={{
            width: 20,
            height: 20,
            margin: {
              left: 8,
            },
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: DROPDOWN_ARROW },
          }}
        />
      </UiEntity>

      {/* Dropdown Options */}
      {dropdownState.isOpen && !disabled && (
        <UiEntity
          uiTransform={{
            width: '100%',
            maxHeight,
            flexDirection: 'column',
            positionType: 'absolute',
            position: { top: 42 },
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: DROPDOWN_BACKGROUND },
          }}
        >
          {options.map((option, index) => (
            <UiEntity
              key={option.value}
              uiTransform={{
                width: '100%',
                height: 40,
                flexDirection: 'row',
                alignItems: 'center',
                padding: {
                  left: 12,
                  right: 12,
                },
              }}
              onMouseDown={() => {
                onChange?.(index)
                dropdownStates.set(dropdownId, { isOpen: false })
              }}
            >
              {option.leftIcon && (
                <UiEntity
                  uiTransform={{
                    width: 20,
                    height: 20,
                    margin: {
                      right: 8,
                    },
                  }}
                  uiBackground={{
                    textureMode: 'stretch',
                    texture: { src: option.leftIcon },
                  }}
                />
              )}
              <Label
                value={option.label}
                fontSize={fontSize}
                color={COLORS.SECONDARY}
              />
              {option.rightIcon && (
                <UiEntity
                  uiTransform={{
                    width: 20,
                    height: 20,
                    margin: {
                      left: 8,
                    },
                  }}
                  uiBackground={{
                    textureMode: 'stretch',
                    texture: { src: option.rightIcon },
                  }}
                />
              )}
            </UiEntity>
          ))}
        </UiEntity>
      )}
    </UiEntity>
  )
}
