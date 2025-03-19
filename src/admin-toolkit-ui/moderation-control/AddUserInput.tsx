import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Input } from "@dcl/react-ecs";
import { Button } from '../Button';

type Props = {
  scaleFactor: number
  onSubmit(value: string): void
}
let $inputValue: string = ''
export function AddUserInput({ scaleFactor, onSubmit }: Props) {

  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
        // margin: { bottom: 32 * scaleFactor },
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
          onChange={($) => $inputValue = $}
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
          }}
        />
        <Button
          id="moderation_control_add_admin"
          value={'<b>Add</b>'}
          // disabled={!$inputValue.length}
          fontSize={18 * scaleFactor}
          uiTransform={{
            margin: { left: 10 * scaleFactor },
            minWidth: 96 * scaleFactor,
            height: 42 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={() => {}}
        />
      </UiEntity>
    </UiEntity>
  )
}