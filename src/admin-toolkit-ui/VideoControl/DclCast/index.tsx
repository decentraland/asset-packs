import ReactEcs, { Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { getScaleUIFactor } from '../../../ui'
import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import { getDclCastInfo } from '../api'
import { CONTENT_URL } from '../../constants'
import { State } from '../../types'

import { Header } from '../../Header'
import DclCastInfo from './DclCastInfo'
import { LoadingDots } from '../../Loading'
import { Button } from '../../Button'

//TODO CHANGE ICONS URL
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

const DclCast = ({
  engine,
  state,
  entity,
  video,
}: {
  engine: IEngine
  state: State
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
}) => {
  const scaleFactor = getScaleUIFactor(engine)
  const [isLoading, setIsLoading] = ReactEcs.useState(false)
  const [error, setError] = ReactEcs.useState(false)

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

  ReactEcs.useEffect(() => {
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
          uiTransform={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <UiEntity
            uiText={{
              value: '<b>Failed to fetch DCL Cast info</b>',
              fontSize: 16 * scaleFactor,
              color: Color4.White(),
            }}
            uiTransform={{ margin: { bottom: 8 * scaleFactor } }}
          />
          <UiEntity
            uiText={{
              value: 'Please retry.',
              fontSize: 16 * scaleFactor,
              color: Color4.Gray(),
            }}
          />
          <Button
            id="dcl_cast_retry"
            value="<b>Retry</b>"
            variant="secondary"
            fontSize={16 * scaleFactor}
            color={Color4.White()}
            onMouseDown={() => {
              handleGetDclCastInfo(state)
            }}
            uiTransform={{
              margin: { top: 16 * scaleFactor },
              padding: {
                top: 8 * scaleFactor,
                bottom: 8 * scaleFactor,
                left: 16 * scaleFactor,
                right: 16 * scaleFactor,
              },
            }}
          />
        </UiEntity>
      )}
      {!isLoading && !error && (
        <DclCastInfo
          scaleFactor={scaleFactor}
          state={state}
          entity={entity}
          engine={engine}
          video={video}
          onResetRoomId={async () => {
            fetchDclCastInfo()
          }}
        />
      )}
    </UiEntity>
  )
}

export default DclCast
