import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Input } from '@dcl/react-ecs'
import { Button } from '../Button'
import { Error } from '../Error'
import {
  getAddUserInputStyles,
  getAddUserInputColors,
  getAddUserInputBackgrounds,
  getInputBorderColor,
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

let $inputValue: string = ''

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function AddUserInput({ scaleFactor, onSubmit, type }: Props) {
  const [error, setError] = ReactEcs.useState(false)
  const [loading, setLoading] = ReactEcs.useState(false)
  const styles = getAddUserInputStyles(scaleFactor)
  const colors = getAddUserInputColors()
  const backgrounds = getAddUserInputBackgrounds()

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
        uiTransform={styles.title}
      />
      <UiEntity>
        <Input
          onChange={($) => {
            if (error) {
              setError(false)
            }
            $inputValue = $
          }}
          value={$inputValue}
          fontSize={16 * scaleFactor}
          placeholder="Wallet Address"
          placeholderColor={colors.placeholder}
          color={colors.black}
          uiBackground={backgrounds.input}
          uiTransform={{
            ...styles.input,
            borderColor: getInputBorderColor(
              $inputValue,
              isValidAddress($inputValue),
              error,
            ),
          }}
        />
        <Button
          id="moderation_control_add_admin"
          value={type === PermissionType.ADMIN ? '<b>Add</b>' : '<b>Ban</b>'}
          fontSize={18 * scaleFactor}
          uiTransform={styles.button}
          onMouseDown={async () => {
            if (loading) return

            const clearInput = () => {
              $inputValue = ''
            }

            if (type === PermissionType.ADMIN) {
              await handleAddAdmin(
                $inputValue,
                setError,
                setLoading,
                clearInput,
              )
            } else {
              await handleBanUser($inputValue, setError, setLoading, clearInput)
            }
          }}
        />
      </UiEntity>
      {error && (
        <Error
          uiTransform={styles.error}
          scaleFactor={scaleFactor}
          text="Please try again."
        />
      )}
    </UiEntity>
  )
}
