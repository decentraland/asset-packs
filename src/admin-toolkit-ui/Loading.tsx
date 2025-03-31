import { IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity } from '@dcl/react-ecs'
import { clearInterval, setInterval } from './utils'

interface LoadingProps {
  scaleFactor: number
  engine: IEngine
  width?: number
  height?: number
}

export function LoadingDots({
  scaleFactor,
  engine,
  width = 20,
  height = 20,
}: LoadingProps) {
  let frame = 0
  const [_frame, setFrame] = ReactEcs.useState(0)

  ReactEcs.useEffect(() => {
    const interval = setInterval(
      engine,
      () => {
        frame = (frame + 1) % 3
        setFrame(frame)
      },
      340,
    )
    return () => clearInterval(engine, interval)
  }, [])

  return (
    <UiEntity
      uiTransform={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <UiEntity
          key={`dot-${i}`}
          uiTransform={{
            width: width * scaleFactor,
            height: height * scaleFactor,
            borderRadius: (width / 2) * scaleFactor,
            margin: { right: 8 * scaleFactor },
          }}
          uiBackground={{
            color: _frame === i ? Color4.White() : Color4.create(1, 1, 1, 0.3),
          }}
        />
      ))}
    </UiEntity>
  )
}

