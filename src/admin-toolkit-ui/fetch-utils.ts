import { SignedFetchRequest, signedFetch } from "~system/SignedFetch"
import { __DEV__ } from '@dcl/ecs/dist/runtime/invariant'
import { toCamelCase, CamelCase } from "./utils"

type Opts = {
  toCamelCase?: boolean
}
export async function wrapSignedFetch<T extends any = unknown>(signedFetchBody: SignedFetchRequest, opts: Opts = {}): Promise<Result<T, string>> {
  // TODO: uncomment this
  if (__DEV__ && false) {
    return ["Cant do request on Local Preview", null]
  }

  const [error, value] = await tryCatch(signedFetch(signedFetchBody))

  if (!value?.ok || error) {
    console.log(`Error in ${signedFetchBody.url} endpoint`, JSON.stringify({ error, value }))
    return [error?.message ?? value?.body ?? 'There was an error', null]
  }

  const [_, body] = await tryCatch<T>(JSON.parse(value.body))

  return [null, opts.toCamelCase ? toCamelCase(body ?? {}) : body ?? {}] as [null, T]
}

// Types for the result object with discriminated union
export type Success<T> = [null, T]

export type Failure<E> = [E, null]

export type Result<T, E = Error> = Success<T> | Failure<E>;

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