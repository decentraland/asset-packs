import { engine } from '@dcl/ecs'
import { initAssetPacks } from './scene-entrypoint'

initAssetPacks(engine, undefined as any)

export function main() {
  console.log('Scene ready')
}
