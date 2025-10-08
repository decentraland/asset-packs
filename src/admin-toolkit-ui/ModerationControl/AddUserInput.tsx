import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Input } from '@dcl/react-ecs'
import { Button } from '../Button'
import { postSceneAdmin } from './api'
import { Error } from '../Error'
import { fetchSceneAdmins } from '..'
import {
  getAddUserInputStyles,
  getAddUserInputColors,
  getAddUserInputBackgrounds,
  getInputBorderColor,
} from './styles/AddUserInputStyles'

type Props = {
  scaleFactor: number
  onSubmit(value: string): void
}
let $inputValue: string = ''

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function AddUserInput({ scaleFactor, onSubmit }: Props) {
  const [error, setError] = ReactEcs.useState(false)
  const [loading, setLoading] = ReactEcs.useState(false)
  const styles = getAddUserInputStyles(scaleFactor)
  const colors = getAddUserInputColors()
  const backgrounds = getAddUserInputBackgrounds()

  return (
    <UiEntity uiTransform={styles.container}>
      <Label
        value="<b>Add an Admin</b>"
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
          onSubmit={(value) => {
            onSubmit(value)
            $inputValue = ''
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
          value={'<b>Add</b>'}
          fontSize={18 * scaleFactor}
          uiTransform={styles.button}
          onMouseDown={async () => {
            if (loading) return
            setLoading(true)
            const [error, data] = await postSceneAdmin($inputValue)
            if (data) {
              setError(false)
              $inputValue = ''
              await fetchSceneAdmins()
            } else {
              console.log(error)
              setError(true)
            }
            setLoading(false)
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
