import { Entity, IEngine } from '@dcl/sdk/ecs'
import { definePlayerHelper } from '@dcl/sdk/src/players'
import { getComponents } from './definitions'
import { createAdminToolkitUI } from './admin-ui'
import { ReactBasedUiSystem } from '@dcl/react-ecs'
import { PointerEventsSystem } from '@dcl/ecs'

export type PlayerHelper = ReturnType<typeof definePlayerHelper>

// Create a system to manage the AdminToolkit
export function createAdminToolkitSystem(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  players: PlayerHelper,
) {
  let adminToolkitEntity: Entity | null = null
  const { AdminTools } = getComponents(engine)

  return function adminToolkitSystem(_dt: number) {
    const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
    const hasAdminToolkit = adminToolkitEntities.length > 0

    // Create admin toolkit UI if the smart item exists and UI hasn't been created
    if (hasAdminToolkit && !adminToolkitEntity) {
      adminToolkitEntity = adminToolkitEntities[0][0]
      createAdminToolkitUI(
        engine,
        pointerEventsSystem,
        reactBasedUiSystem,
        players,
      )
      console.log('Admin toolkit created with ui')
    }
    // Remove admin toolkit UI if the smart item is removed
    else if (!hasAdminToolkit && adminToolkitEntity) {
      engine.removeEntity(adminToolkitEntity)
      adminToolkitEntity = null
    }
  }
}
