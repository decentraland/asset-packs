import { Result, wrapSignedFetch } from "../fetch-utils";

const URLS = {
  STREAM_KEY: `https://comms-gatekeeper.decentraland.zone/scene-admin`,
}

type StreamKeyResponse = {
  id: string;
}

export async function getStreamKey(): Promise<Result<StreamKeyResponse, string>>  {
  return wrapSignedFetch<StreamKeyResponse>({ url: URLS.STREAM_KEY })
}

export async function revokeStreamKey(): Promise<Result<StreamKeyResponse, string>>  {
  return wrapSignedFetch<StreamKeyResponse>({ url: URLS.STREAM_KEY, init: { method: 'DELETE', headers: {} } })
}
