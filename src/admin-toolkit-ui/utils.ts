import { getRealm, getSceneInformation } from '~system/Runtime'
import { LAND_MANAGER_URL } from './constants'

export async function getSceneDeployment() {
  try {
    const realm = await getRealm({})
    const sceneInfo = await getSceneInformation({})
    const { realmInfo } = realm
    const { urn: sceneUrn } = sceneInfo

    if (realmInfo && realmInfo.realmName !== 'LocalPreview') {
      const deploymentResponse = await fetch(
        `${realmInfo.baseUrl}/content/deployments/?entityId=${sceneUrn}`,
      )
      const data = await deploymentResponse.json()
      const deployment = data?.['deployments']?.shift()

      return deployment
    }
  } catch (error) {
    console.error('Error getting scene deployment', error)
  }

  return null
}

export async function getSceneOwners() {
  try {
    const deployment = await getSceneDeployment()

    if (deployment?.sceneBasePosition) {
      const sceneOwnersResponse = await fetch(LAND_MANAGER_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            parcels(
              where: {
                x: ${deployment.sceneBasePosition[0]},
                y: ${deployment.sceneBasePosition[1]}
              }
            ) {
              id
              x
              y
              owners {
                id
                address
              }
            }
          }`,
        }),
      })

      const { data: sceneOwnersData } = await sceneOwnersResponse.json()
      const owners =
        sceneOwnersData.parcels
          .shift()
          ?.owners.map((owner: any) => owner.address.toLowerCase()) || []

      return owners
    }
  } catch (error) {
    console.error('Error getting scene owners', error)
  }

  return []
}
