import { version } from '../../package.json'

export const CONTENT_URL = version.includes('commit')
  ? 'https://builder-items.decentraland.zone'
  : 'https://builder-items.decentraland.org'
