import { Entity, IEngine } from '@dcl/ecs'
import { getExplorerComponents } from './components'

export const ENUM_ENTITY_ID_START: Entity = 8000 as Entity
export function getNextEnumEntityId(engine: IEngine): Entity {
  const { NetworkEntity } = getExplorerComponents(engine)

  let value: Entity = ENUM_ENTITY_ID_START
  for (const [, component] of engine.getEntitiesWith(NetworkEntity)) {
    value = Math.max(value, Number(component.entityId)) as Entity
  }
  return (value + 1) as Entity
}
