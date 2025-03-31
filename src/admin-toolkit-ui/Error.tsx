import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, UiTransformProps } from '@dcl/react-ecs'

interface LoadingProps {
  scaleFactor: number
  text: string
  uiTransform?: UiTransformProps
}

export function Error({
  scaleFactor,
  text,
  uiTransform
}: LoadingProps) {
  return (
    <UiEntity
      uiTransform={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: { top: 10 * scaleFactor },
        ...uiTransform,
      }}
    >
      <UiEntity
        uiTransform={{
          width: 15 * scaleFactor,
          height: 15 * scaleFactor,
          margin: { right: 10 * scaleFactor },
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'assets/error.png',
          },
        }}
      />
      <Label
        value={`<b>${text}</b>`}
        color={Color4.Red()}
        fontSize={14 * scaleFactor}
      />
    </UiEntity>
  )
}