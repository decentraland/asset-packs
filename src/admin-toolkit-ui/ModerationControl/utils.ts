import { FlatFetchResponse, signedFetch } from "~system/SignedFetch"
// import { __DEV__ } from '@dcl/ecs/src/runtime/invariant'

const URLS = {
  SCENE_ADMIN: `https://comms-gatekeeper.decentraland.zone/scene-admin`,
  STREAM_ACCESS_KEY: `https://comms-gatekeeper.decentraland.zone/scene-stream-access`
}

type SceneAdminResponse = {
  id: string;
  admin: string;
  active: string;
}

export async function getSceneAdmins(): Promise<Result<SceneAdminResponse[], string>>  {
  // if (__DEV__) {
  //   return []
  // }
  const response = await tryCatch(signedFetch({ url: URLS.SCENE_ADMIN }))
  return wrapSignedFetch<SceneAdminResponse[]>(response)
}

export async function postSceneAdmin<T = unknown>(address: string) {
  // if (__DEV__) {
  //   return []
  // }
  const response = await tryCatch(signedFetch({
    url: URLS.SCENE_ADMIN,
    init: {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ admin: address })
    }
  }))

  return wrapSignedFetch<T>(response)
}
export async function deleteSceneAdmin<T = unknown>(address: string) {
  // if (__DEV__) {
  //   return []
  // }
  const response = await tryCatch(signedFetch({
    url: URLS.SCENE_ADMIN,
    init: {
      method: 'DELETE',
      headers: {},
      body: JSON.stringify({ admin: address })
    }
  }))

  return wrapSignedFetch<T>(response)
}

async function wrapSignedFetch<T = unknown>(data: Result<FlatFetchResponse, Error>, key?: string): Promise<Result<T, string>> {
  const [error, value] = data


  if (!value?.ok || error) {
    console.log(`Error in ${key} endpoint`, JSON.stringify({ error, data }))
    return [error?.message ?? value?.body ?? 'There was an error', null]
  }

  const [_, body] = await tryCatch<T>(JSON.parse(value.body))

  return [null, body ?? {} as T]
}


// Types for the result object with discriminated union
type Success<T> = [null, T]

type Failure<E> = [E, null]

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return [null, data]
  } catch (error) {
    return [error as E, null]
  }
}