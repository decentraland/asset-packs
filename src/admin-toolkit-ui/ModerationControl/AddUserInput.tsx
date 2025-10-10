import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Input } from '@dcl/react-ecs'
import { Button } from '../Button'
import { Error } from '../Error'
import {
  getAddUserInputStyles,
  getAddUserInputColors,
  getAddUserInputBackgrounds,
} from './styles/AddUserInputStyles'
import { handleAddAdmin, handleBanUser } from './utils'

export enum PermissionType {
  ADMIN = 'admin',
  BAN = 'ban',
}

type Props = {
  scaleFactor: number
  onSubmit(value: string): void
  type: PermissionType
}

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

//Names can have 15 characters max, if the characters exceeded that, we assume is an address
function isAddress(value: string) {
  return value.length > 15
}

export function AddUserInput({ scaleFactor, onSubmit, type }: Props) {
  const [submitError, setSubmitError] = ReactEcs.useState(false)
  const [validationError, setValidationError] = ReactEcs.useState('')
  const [loading, setLoading] = ReactEcs.useState(false)
  const [inputValue, setInputValue] = ReactEcs.useState('')
  const styles = getAddUserInputStyles(scaleFactor)
  const colors = getAddUserInputColors()
  const backgrounds = getAddUserInputBackgrounds()

  const handleSubmit = async () => {
    if (loading) return

    const trimmedValue = inputValue.trim()

    if (!trimmedValue || trimmedValue.length <= 2) {
      setValidationError('Provide a valid address or NAME')
      return
    }

    if (isAddress(trimmedValue) && !isValidAddress(trimmedValue)) {
      setValidationError('Provide a valid address format')
      return
    }

    const clearInput = () => {
      setInputValue('')
    }

    if (type === PermissionType.ADMIN) {
      const adminData = isAddress(trimmedValue)
        ? { admin: trimmedValue }
        : { name: trimmedValue }
      await handleAddAdmin(adminData, setSubmitError, setLoading, clearInput)
    } else {
      const banData = isAddress(trimmedValue)
        ? { banned_address: trimmedValue }
        : { banned_name: trimmedValue }
      await handleBanUser(banData, setSubmitError, setLoading, clearInput)
    }
  }

  return (
    <UiEntity uiTransform={styles.container}>
      <Label
        value={
          type === PermissionType.ADMIN
            ? '<b>Add an Admin</b>'
            : '<b>Ban a User from Scene</b>'
        }
        fontSize={18 * scaleFactor}
        color={colors.white}
      />
      {type === PermissionType.BAN && (
        <UiEntity
          uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            margin: { top: 8 * scaleFactor, bottom: 16 * scaleFactor },
            padding: {
              top: 4 * scaleFactor,
              bottom: 4 * scaleFactor,
              left: 12 * scaleFactor,
              right: 12 * scaleFactor,
            },
            width: '100%',
          }}
        >
          <Label
            value="<b>Banned users CAN'T:</b>"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 4 * scaleFactor },
            }}
          />
          <Label
            value="- See your scene build"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 2 * scaleFactor },
            }}
          />
          <Label
            value="- Send messages in the Nearby chat"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 2 * scaleFactor },
            }}
          />
          <Label
            value="- Be seen by other users"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 12 * scaleFactor },
            }}
          />
          <Label
            value="<b>Banned users CAN still:</b>"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 4 * scaleFactor },
            }}
          />
          <Label
            value="- See other users"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 2 * scaleFactor },
            }}
          />
          <Label
            value="- See the messages in the Nearby chat"
            fontSize={14 * scaleFactor}
            color={colors.white}
            uiTransform={{
              margin: { bottom: 16 * scaleFactor },
            }}
          />
        </UiEntity>
      )}
      <UiEntity>
        <Input
          onChange={(value) => {
            setSubmitError(false)
            setValidationError('')
            setInputValue(value)
          }}
          value={inputValue}
          fontSize={16 * scaleFactor}
          placeholder={'Enter a NAME or wallet address'}
          uiBackground={backgrounds.input}
          uiTransform={{
            ...styles.input,
            borderColor: validationError ? colors.red : colors.white,
          }}
        />
        <Button
          id={
            type === PermissionType.ADMIN
              ? 'moderation_control_add_admin'
              : 'moderation_control_ban_user'
          }
          value={type === PermissionType.ADMIN ? '<b>Add</b>' : '<b>Ban</b>'}
          fontSize={18 * scaleFactor}
          uiTransform={styles.button}
          onMouseDown={handleSubmit}
        />
      </UiEntity>

      {validationError && (
        <Error
          uiTransform={styles.error}
          scaleFactor={scaleFactor}
          text={validationError}
        />
      )}

      {submitError && (
        <Error
          uiTransform={styles.error}
          scaleFactor={scaleFactor}
          text="Please try again."
        />
      )}
    </UiEntity>
  )
}
