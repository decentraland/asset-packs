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
        width: '100%',
        ...uiTransform,
      }}
    >
      <UiEntity
        uiTransform={{
          width: 25 * scaleFactor,
          height: 25 * scaleFactor,
          margin: { right: 10 * scaleFactor },
          flexShrink: 0,
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'assets/error.png',
          },
        }}
      />
      <Label
        uiTransform={{
          width: 'auto',
          maxWidth: '90%'
        }}
        value={`<b>${text}</b>`}
        color={Color4.Red()}
        fontSize={14 * scaleFactor}
      />
    </UiEntity>
  )
}