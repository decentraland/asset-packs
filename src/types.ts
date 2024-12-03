import { Entity } from '@dcl/ecs'
import { ComponentName } from './enums'

export type AssetPackData = {
  id: string
  name: string
}

export function isAssetPackData(value: any): value is AssetPackData {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  )
}

export type LegacyAssetData = {
  id: string
  name: string
  category: string
  tags: string[]
  components: Record<string, any>
}

export type AssetData = {
  id: string
  name: string
  category: string
  tags: string[]
  composite: {
    version: number
    components: Array<{
      name: string
      data: {
        [key: string]: {
          json: any
        }
      }
    }>
  }
}

export interface TriggerData {
  value: {
    type: string
    actions: {
      id: string
      name: string
    }[]
  }[]
}

export function isAssetData(value: any): value is AssetData {
  return (
    value &&
    typeof value === 'object' &&
    'composite' in value &&
    typeof value.composite === 'object' &&
    'version' in value.composite &&
    'components' in value.composite &&
    Array.isArray(value.composite.components)
  )
}

export function isLegacyAssetData(value: any): value is LegacyAssetData {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.category === 'string' &&
    typeof value.components === 'object' &&
    value.components !== null
  )
}

export function getTriggerComponent(value: AssetData): TriggerData | undefined {
  return value.composite.components.find(
    (c) => c.name === ComponentName.TRIGGERS,
  )?.data[0]?.json as TriggerData | undefined
}

export function assertValidTriggerComponent(
  assetName: string,
  trigger: TriggerData,
) {
  trigger.value.forEach(({ type, actions }) => {
    actions.forEach(({ id, name }) => {
      if (!id || !name) {
        throw new Error(
          `Invalid actions found on "${assetName}" for trigger with type "${type}"`,
        )
      }
    })
  })
}

export type Asset = AssetData & { contents: Record<string, string> }
export type AssetPack = AssetPackData & { thumbnail: string; assets: Asset[] }
export type Catalog = { assetPacks: AssetPack[] }

export type Component = {
  name: string
  data: {
    [key: string]: {
      json: any
    }
  }
}


export type ISDKHelpers = {
  // SyncEntity helper to create network entities at runtime.
  syncEntity?: SyncEntitySDK
}
export type SyncEntitySDK =  (entityId: Entity, componentIds: number[], entityEnumId?: number | undefined) => void
