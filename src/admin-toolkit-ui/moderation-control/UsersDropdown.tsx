import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Dropdown as ReactDropdown } from "@dcl/react-ecs";
import { Button } from '../Button';
import { User } from '.';

type Props = {
  scaleFactor: number
  options: User[]
  selectedIndex?: number
  onSelect(value: number): void
}

const isDefined = (v: number | undefined) => v !== -1  && v !== undefined

export function UsersDropdown({ scaleFactor, options, selectedIndex, onSelect }: Props) {
  const selected = isDefined(selectedIndex) && options[selectedIndex as any] || undefined


  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'column',
        margin: { bottom: 32 * scaleFactor },
      }}
    >
      <Label
        value="<b>Add / Remove Admins</b>"
        fontSize={18 * scaleFactor}
        color={Color4.White()}
        uiTransform={{
          margin: { bottom: 16 * scaleFactor },
        }}
      />
      <UiEntity>
        <ReactDropdown
          acceptEmpty
          emptyLabel="Username"
          options={options.map(($) => $.name)}
          selectedIndex={selectedIndex ?? -1}
          onChange={onSelect}
          textAlign="middle-left"
          fontSize={14 * scaleFactor}
          uiTransform={{
            height: 40 * scaleFactor,
            width: '100%',
          }}
          uiBackground={{ color: Color4.White() }}
          color={Color4.Black()}
        />
        <Button
          id="moderation_control_add_admin"
          value={selected?.isAdmin ? '<b>Remove</b>' : '<b>Add</b>'}
          disabled={!isDefined(selectedIndex)}
          fontSize={18 * scaleFactor}
          // labelTransform={{ margin: { left: 10 * scaleFactor } }}
          uiTransform={{
            margin: { left: 10 * scaleFactor },
            minWidth: 96 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={() => {
            if (selected) {
              selected.isAdmin = !selected.isAdmin
            }
          }}
          // disabled={!selectedVideoPlayer}
        />
      </UiEntity>
    </UiEntity>
  )
}