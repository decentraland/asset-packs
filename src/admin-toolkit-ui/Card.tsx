import ReactEcs, { UiEntity } from "@dcl/react-ecs";
import { containerBackgroundColor } from ".";

export function Card({ scaleFactor, children }: { scaleFactor: number; children?: ReactEcs.JSX.Element }) {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        borderRadius: 12 * scaleFactor,
        margin: {
          top: 10 * scaleFactor,
          right: 0,
          bottom: 0,
          left: 0,
        },
        padding: {
          top: 32 * scaleFactor,
          right: 32 * scaleFactor,
          bottom: 32 * scaleFactor,
          left: 32 * scaleFactor,
        },
      }}
      uiBackground={{ color: containerBackgroundColor }}
    >
      {children}
    </UiEntity>
  )
}