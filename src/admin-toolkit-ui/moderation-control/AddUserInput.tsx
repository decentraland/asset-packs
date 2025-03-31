import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Input } from "@dcl/react-ecs"
import { Button } from '../Button'
import { postSceneAdmin } from './utils'
import { Error } from '../Error'
import { fetchSceneAdmins } from '..'

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
  return (
    <UiEntity
      uiTransform={{
        display: 'flex',
        flexDirection: 'column',
        positionType: 'relative',
      }}
    >
      <Label
        value="<b>Add an Admin</b>"
        fontSize={18 * scaleFactor}
        color={Color4.White()}
        uiTransform={{
          margin: { bottom: 16 * scaleFactor },
        }}
      />
      <UiEntity>
        <Input
          onChange={($) => {
            $inputValue = $
          }}
          onSubmit={(value) => {
            onSubmit(value)
            $inputValue = ''
          }}
          fontSize={16 * scaleFactor}
          placeholder="Username or Wallet Address"
          placeholderColor={Color4.create(160 / 255, 155 / 255, 168 / 255, 1)}
          color={Color4.Black()}
          uiBackground={{ color: Color4.White() }}
          uiTransform={{
            width: '100%',
            height: 42 * scaleFactor,
            margin: { bottom: 16 * scaleFactor },
            borderColor: (!$inputValue || isValidAddress($inputValue)) ? Color4.White() : Color4.Red(),
            borderWidth: 4,
            borderRadius: 8
          }}
        />
        <Button
          id="moderation_control_add_admin"
          value={'<b>Add</b>'}
          fontSize={18 * scaleFactor}
          uiTransform={{
            margin: { left: 10 * scaleFactor },
            minWidth: 96 * scaleFactor,
            height: 42 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={async () => {
            const [error, data] = await postSceneAdmin($inputValue)
            if (data) {
              $inputValue = ''
              await fetchSceneAdmins()
            } else {
              console.log(error)
              setError(true)
              $inputValue = ''
            }
          }}
        />
      </UiEntity>
      {error && (
        <Error
          uiTransform={{
            margin: { top: -20, bottom: 10 },
            justifyContent: 'flex-start',
          }}
          scaleFactor={scaleFactor}
          text="Please try again."
        />
      )}
    </UiEntity>
  )
}