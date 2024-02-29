import { engine } from '@dcl/sdk/ecs'
import { initAssetPacks } from './scene-entrypoint'

initAssetPacks(engine)

export function main() {
  console.log('Scene ready')
}
