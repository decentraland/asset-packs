import { postSceneAdmin, postSceneBan, getSceneBans } from './api'
import { fetchSceneAdmins } from '..'

export const handleAddAdmin = async (
  inputValue: string,
  setError: (error: boolean) => void,
  setLoading: (loading: boolean) => void,
  clearInput: () => void,
) => {
  if (!inputValue) return

  setLoading(true)
  const [error, data] = await postSceneAdmin(inputValue)

  if (data) {
    setError(false)
    clearInput()
    await fetchSceneAdmins()
  } else {
    console.log(error)
    setError(true)
  }

  setLoading(false)
}

export const handleBanUser = async (
  inputValue: string,
  setError: (error: boolean) => void,
  setLoading: (loading: boolean) => void,
  clearInput: () => void,
) => {
  if (!inputValue) return

  console.log('ALE=> Starting ban process for:', inputValue)
  setLoading(true)

  const [error, data] = await postSceneBan(inputValue)
  console.log('ALE=> postSceneBan response - error:', error, 'data:', data)

  if (data) {
    setError(false)
    clearInput()
    console.log('ALE=> Ban successful, fetching updated bans list...')
    const [getBansError, getBansData] = await getSceneBans()
    console.log(
      'ALE=> getSceneBans response - error:',
      getBansError,
      'data:',
      getBansData,
    )
  } else {
    console.log('ALE=> Ban failed with error:', error)
    setError(true)
  }

  setLoading(false)
  console.log('ALE=> Ban process completed')
}
