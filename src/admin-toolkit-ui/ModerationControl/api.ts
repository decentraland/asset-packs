import { getDomain, Result, wrapSignedFetch } from '../fetch-utils'

const URLS = () => ({
  SCENE_ADMIN: `https://comms-gatekeeper.decentraland.${getDomain()}/scene-admin`,
  SCENE_BAN: `https://comms-gatekeeper.decentraland.${getDomain()}/scene-bans`,
})

type SceneAdminResponse = {
  id: string
  name: string
  admin: string
  active: string
  canBeRemoved: boolean
}

type SceneBanUser = {
  id: string
  place_id: string
  banned_address: string
  banned_by: string
  banned_at: number
}

type SceneBansListResponse = {
  results: SceneBanUser[]
  total: number
  page: number
  pages: number
  limit: number
}

export type BannedUser = {
  address: string
  name?: string
  bannedBy: string
  bannedAt: number
  canBeRemoved: boolean
}

export async function getSceneAdmins(): Promise<
  Result<SceneAdminResponse[], string>
> {
  return wrapSignedFetch<SceneAdminResponse[]>({ url: URLS().SCENE_ADMIN })
}

export async function postSceneAdmin<T = unknown>(address: string) {
  return wrapSignedFetch<T>({
    url: URLS().SCENE_ADMIN,
    init: {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ admin: address }),
    },
  })
}

export async function deleteSceneAdmin<T = unknown>(address: string) {
  return wrapSignedFetch<T>({
    url: URLS().SCENE_ADMIN,
    init: {
      method: 'DELETE',
      headers: {},
      body: JSON.stringify({ admin: address }),
    },
  })
}

export async function postSceneBan<T = unknown>(address: string) {
  return wrapSignedFetch<T>({
    url: URLS().SCENE_BAN,
    init: {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ banned_address: address }),
    },
  })
}

export async function getSceneBans(): Promise<
  Result<SceneBansListResponse, string>
> {
  return wrapSignedFetch<SceneBansListResponse>({
    url: URLS().SCENE_BAN,
  })
}

export async function deleteSceneBan<T = unknown>(address: string) {
  return wrapSignedFetch<T>({
    url: URLS().SCENE_BAN,
    init: {
      method: 'DELETE',
      headers: {},
      body: JSON.stringify({ banned_address: address }),
    },
  })
}
