import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'


type Props = {
  scaleFactor: number
  iconSrc: string
  title: string
}

export function Header({ scaleFactor, iconSrc, title }: Props) {
  return (
    <UiEntity
      uiTransform={{
        flexDirection: 'row',
        margin: { bottom: 10 * scaleFactor },
        height: 30 * scaleFactor,
      }}
    >
      <UiEntity
        uiTransform={{ width: 30 * scaleFactor, height: 30 * scaleFactor }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: iconSrc,
          },
        }}
      />
      <Label
        value={`<b>${title}</b>`}
        uiTransform={{ margin: { bottom: 2 * scaleFactor, left: 10 * scaleFactor } }}
        fontSize={24 * scaleFactor}
        color={Color4.White()}
      />
    </UiEntity>
  )
}
