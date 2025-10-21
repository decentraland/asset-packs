import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { getScaleUIFactor } from '../../../ui'
import { IEngine } from '@dcl/ecs'
import { getDclCastInfo } from '../api'
import { CONTENT_URL } from '../../constants'
import { State } from '../../types'

import { Header } from '../../Header'
import DclCastInfo from './DclCastInfo'
import { LoadingDots } from '../../Loading'

const ICONS = {
  VIDEO_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/video-control.png`,
  LINK_ICON:
    'https://builder-items.decentraland.zone/admin_toolkit/assets/icons/open-link.png',
  DCL_CAST_ICON:
    'https://builder-items.decentraland.zone/admin_toolkit/assets/icons/dcl-cast.png',
}

export async function handleGetDclCastInfo(state: State) {
  const [error, data] = await getDclCastInfo()
  if (error) {
    console.error(error)
    return null
  } else {
    if (data) {
      console.log('DCL Cast Info:', data)
      //TODO REMOVE LOGS
      data &&
        Object.keys(data).forEach((key) => {
          console.log(
            `ALE - Key: ${key}, Value:`,
            data?.[key as keyof typeof data],
          )
        })
      state.videoControl.dclCast = data
      return data
    }
  }
}

const DclCast = ({ engine, state }: { engine: IEngine; state: State }) => {
  const scaleFactor = getScaleUIFactor(engine)
  const [isLoading, setIsLoading] = ReactEcs.useState(false)
  const [error, setError] = ReactEcs.useState(false)

  ReactEcs.useEffect(() => {
    const fetchDclCastInfo = async () => {
      setIsLoading(true)
      setError(false)

      if (state.videoControl.dclCast) {
        setIsLoading(false)
        return
      }

      const result = await handleGetDclCastInfo(state)

      if (!result) {
        setError(true)
      }

      setIsLoading(false)
    }

    fetchDclCastInfo()
  }, [])

  return (
    <UiEntity
      uiTransform={{ flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <Header
        iconSrc={ICONS.DCL_CAST_ICON}
        title="DCL Cast"
        scaleFactor={scaleFactor}
      />
      <UiEntity
        uiTransform={{
          width: '100%',
          margin: { bottom: 24 * scaleFactor },
        }}
      >
        <UiEntity
          uiText={{
            value:
              'Use a browser-based DCL Cast room to easily stream camera and screen feed to a screen in your scene.',
            fontSize: 16 * scaleFactor,
            color: Color4.fromHexString('#A09BA8'),

            textAlign: 'top-left',
            textWrap: 'wrap',
          }}
          uiTransform={{
            margin: { bottom: 8 * scaleFactor },
          }}
        />
      </UiEntity>
      {isLoading && (
        <LoadingDots
          uiTransform={{ minHeight: 400 * scaleFactor }}
          scaleFactor={scaleFactor}
          engine={engine}
        />
      )}
      {error && (
        <UiEntity
          uiTransform={{ margin: { top: 16 * scaleFactor } }}
          uiText={{
            value: 'Failed to fetch DCL Cast info',
            fontSize: 16 * scaleFactor,
            color: Color4.Red(),
            textAlign: 'top-left',
            textWrap: 'wrap',
          }}
        />
      )}
      {!isLoading && !error && (
        <DclCastInfo
          scaleFactor={scaleFactor}
          state={state}
          onResetRoomId={async () => {
            await handleGetDclCastInfo(state)
          }}
        />
      )}
    </UiEntity>
  )
}

export default DclCast
