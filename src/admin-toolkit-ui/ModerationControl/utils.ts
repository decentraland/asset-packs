import { postSceneAdmin, postSceneBan, deleteSceneBan } from './api'
import { fetchSceneAdmins, fetchSceneBans } from '..'

export const handleAddAdmin = async (
  adminData: { admin: string } | { name: string },
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void,
  clearInput: () => void,
) => {
  setLoading(true)
  const [error, data] = await postSceneAdmin(adminData)
  if (data) {
    setError('')
    clearInput()
    await fetchSceneAdmins()
  } else {
    console.log(error)
    setError('Please try again with a valid NAME or wallet address.')
  }

  setLoading(false)
}

export const handleBanUser = async (
  banData: { banned_address: string } | { banned_name: string },
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void,
  clearInput: () => void,
) => {
  console.log('ALE=> Starting ban process for:', banData)
  setLoading(true)

  const [error, data] = await postSceneBan(banData)
  console.log('ALE=> postSceneBan response - error:', error, 'data:', data)

  if (data) {
    setError('')
    clearInput()
    console.log('ALE=> Ban successful, fetching updated bans list...')
    await fetchSceneBans()
  } else {
    console.log('ALE=> Ban failed with error:', error)
    setError('Please try again with a valid NAME or wallet address.')
  }

  setLoading(false)
  console.log('ALE=> Ban process completed')
}

export const handleUnbanUser = async (address: string): Promise<boolean> => {
  if (!address) return false

  console.log('ALE=> Starting unban process for:', address)

  const [error, data] = await deleteSceneBan(address)
  console.log('ALE=> deleteSceneBan response - error:', error, 'data:', data)

  if (data) {
    console.log('ALE=> Unban successful, fetching updated bans list...')
    await fetchSceneBans()
    console.log('ALE=> Unban process completed')
    return true
  } else {
    console.log('ALE=> Unban failed with error:', error)
    console.log('ALE=> Unban process completed')
    return false
  }
}
