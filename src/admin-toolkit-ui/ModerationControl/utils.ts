import { postSceneAdmin, postSceneBan, deleteSceneBan } from './api'
import { fetchSceneAdmins, fetchSceneBans } from '..'

export const handleAddAdmin = async (
  adminData: { admin: string } | { name: string },
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void,
  clearInput: () => void,
) => {
  setLoading(true)
  const [data] = await postSceneAdmin(adminData)
  if (data) {
    setError('')
    clearInput()
    await fetchSceneAdmins()
  } else {
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
  setLoading(true)

  const [data] = await postSceneBan(banData)

  if (data) {
    setError('')
    clearInput()
    await fetchSceneBans()
  } else {
    setError('Please try again with a valid NAME or wallet address.')
  }

  setLoading(false)
}

export const handleUnbanUser = async (address: string): Promise<boolean> => {
  if (!address) return false
  const [data] = await deleteSceneBan(address)
  if (data) {
    await fetchSceneBans()
    return true
  } else {
    return false
  }
}
