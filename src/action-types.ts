import {
  IEngine,
  ISchema,
  JsonSchemaExtended,
  LastWriteWinElementSetComponentDefinition,
  Schemas,
} from '@dcl/sdk/ecs'
import { ActionTypes, ComponentName } from './definitions'

export const EMPTY: JsonSchemaExtended = {
  type: 'object',
  properties: {},
  serializationType: 'map',
}

export function getActionTypesComponent(engine: IEngine) {
  return engine.getComponent(
    ComponentName.ACTION_TYPES,
  ) as LastWriteWinElementSetComponentDefinition<ActionTypes>
}

export function addActionType<T extends ISchema>(
  engine: IEngine,
  type: string,
  schema?: T,
) {
  const ActionTypes = getActionTypesComponent(engine)
  const actionTypes = ActionTypes.getOrCreateMutable(engine.RootEntity)
  actionTypes.value.push({
    type,
    jsonSchema: JSON.stringify(
      schema?.jsonSchema || Schemas.Map({}).jsonSchema,
    ),
  })
}

export function getActionSchema(engine: IEngine, type: string) {
  const ActionTypes = getActionTypesComponent(engine)
  const actionTypes = ActionTypes.getOrCreateMutable(engine.RootEntity)
  const actionType = actionTypes.value.find(($) => $.type === type)
  const jsonSchema: JsonSchemaExtended = actionType
    ? JSON.parse(actionType.jsonSchema)
    : EMPTY
  return Schemas.fromJson(jsonSchema)
}

export function getActionTypes(engine: IEngine) {
  const ActionTypes = getActionTypesComponent(engine)
  const actionTypes = ActionTypes.getOrCreateMutable(engine.RootEntity)
  return actionTypes.value.map(($) => $.type)
}
