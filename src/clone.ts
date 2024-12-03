import {
  Entity,
  IEngine,
  TransformComponentExtended,
  getComponentEntityTree,
} from '@dcl/ecs'
import { getNextId, requiresId } from './id'
import { isLastWriteWinComponent } from './lww'
import { TriggersComponent } from './definitions'

export function clone(
  entity: Entity,
  engine: IEngine,
  Transform: TransformComponentExtended,
  Triggers: TriggersComponent,
) {
  const ids = new Map<number, number>()
  const entities = new Map<Entity, Entity>()
  const tree = getComponentEntityTree(engine, entity, Transform)

  for (const original of tree) {
    const cloned = engine.addEntity()

    for (const component of engine.componentsIter()) {
      if (component.has(original)) {
        let newValue = JSON.parse(JSON.stringify(component.get(original)))
        if (requiresId(component)) {
          const oldId = newValue.id
          const newId = getNextId(engine)
          ids.set(oldId, newId)
          newValue = {
            ...newValue,
            id: newId,
          }
        }
        if (isLastWriteWinComponent(component)) {
          component.createOrReplace(cloned, newValue)
        }
      }
    }
    entities.set(original, cloned)
  }

  const clones = Array.from(entities.values()).reverse()

  for (const cloned of clones) {
    // if the entity has triggers, remap the old ids in the actions and conditions to the new ones

    if (Triggers.has(cloned)) {
      const triggers = Triggers.getMutable(cloned)
      for (const trigger of triggers.value) {
        for (const action of trigger.actions) {
          if (action.id) {
            const newId = ids.get(action.id)
            if (newId) {
              action.id = newId
            }
          }
        }
        if (trigger.conditions) {
          for (const condition of trigger.conditions) {
            if (condition.id) {
              const newId = ids.get(condition.id)
              if (newId) {
                condition.id = newId
              }
            }
          }
        }
      }
    }

    const transform = Transform.getMutableOrNull(cloned)
    if (transform && transform.parent) {
      const newParent = entities.get(transform.parent)
      if (newParent) {
        transform.parent = newParent
      }
    }
  }

  const cloned = clones[0]

  return { ids, entities, cloned }
}
