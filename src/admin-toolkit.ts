import { Entity, IEngine, PointerEventsSystem } from '@dcl/ecs'
import { ReactBasedUiSystem } from '@dcl/react-ecs'
import { getComponents, IPlayersHelper } from './definitions'
import { createAdminToolkitUI } from './admin-toolkit-ui'

// Create a system to manage the AdminToolkit
export function createAdminToolkitSystem(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  playersHelper?: IPlayersHelper,
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
        playersHelper,
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
