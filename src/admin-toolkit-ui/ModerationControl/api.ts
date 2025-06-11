import { getDomain, Result, wrapSignedFetch } from "../fetch-utils";

const URLS = () => ({
  SCENE_ADMIN: `https://comms-gatekeeper.decentraland.${getDomain()}/scene-admin`,
})

type SceneAdminResponse = {
  id: string;
  name: string;
  admin: string;
  active: string;
  canBeRemoved: boolean;
}

export async function getSceneAdmins(): Promise<Result<SceneAdminResponse[], string>>  {
  return wrapSignedFetch<SceneAdminResponse[]>({ url: URLS().SCENE_ADMIN })
}

export async function postSceneAdmin<T = unknown>(address: string) {
  return wrapSignedFetch<T>({
    url: URLS().SCENE_ADMIN,
    init: {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ admin: address })
    }
  })
}

export async function deleteSceneAdmin<T = unknown>(address: string) {
  return wrapSignedFetch<T>({
    url: URLS().SCENE_ADMIN,
    init: {
      method: 'DELETE',
      headers: {},
      body: JSON.stringify({ admin: address })
    }
  })
}

