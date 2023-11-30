import {
  ComponentDefinition,
  LastWriteWinElementSetComponentDefinition,
} from '@dcl/sdk/ecs'

export function isLastWriteWinComponent<T = unknown>(
  component: ComponentDefinition<T>,
): component is LastWriteWinElementSetComponentDefinition<T> {
  return !!(component as LastWriteWinElementSetComponentDefinition<T>)
    .createOrReplace
}
