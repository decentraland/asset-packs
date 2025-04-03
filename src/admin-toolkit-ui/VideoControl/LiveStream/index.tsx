import { Color4 } from '@dcl/sdk/math'
import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import { ICONS } from '..'
import { Header } from '../../Header'
import { ShowStreamKey } from './ShowStreamKey'
import { GenerateStreamKey } from './GenerateStreamKey'
import { DeleteStreamKeyConfirmation } from './DeleteStreamKey'
import { state } from '../..'
import { getComponents } from '../../../definitions'
import { getStreamKey } from '../api'
import { setInterval } from '../../utils'

export const LIVEKIT_STREAM_SRC = 'livekit-video://current-stream'

export function LiveStream({
  engine,
  scaleFactor,
  entity,
  video
}: {
  engine: IEngine
  scaleFactor: number
  entity: Entity
  video: DeepReadonlyObject<PBVideoPlayer> | undefined
}) {
  const [showResetStreamKey, setResetStreamKey] = ReactEcs.useState<boolean>(false)
  const { VideoControlState } = getComponents(engine)
  const videoControlState = VideoControlState.getOrNull(state.adminToolkitUiEntity)
  const streamKey = videoControlState?.streamKey
  const streamKeyEndsAt = videoControlState?.endsAt
  // console.log(videoControlState, videoControlState?.streamKey)
  ReactEcs.useEffect(() => {
    async function streamKeyFn() {
      if (streamKey) return
      const [error, data] = await getStreamKey()
      if (error) {
        console.log(error)
      } else {
        const videoControlState = VideoControlState.getMutable(
          state.adminToolkitUiEntity,
        )
        videoControlState.endsAt = data?.endsAt
        videoControlState.streamKey = data?.streamingKey ?? 'boedo-carnaval`'
      }
    }
    streamKeyFn()
  }, [])


  if (showResetStreamKey) {
    return <DeleteStreamKeyConfirmation
      scaleFactor={scaleFactor}
      engine={engine}
      onCancel={() => setResetStreamKey(false)}
    />
  }

  return (
    <UiEntity uiTransform={{ flexDirection: 'column' }}>
      <Header
        iconSrc={ICONS.LIVE_SOURCE}
        title="Live Stream"
        scaleFactor={scaleFactor}
      />
      <Label
        value="Stream an existing feed providing using an RMTP server."
        color={Color4.fromHexString('#A09BA8')}
        fontSize={16 * scaleFactor}
      />
      {streamKey ? (
        <ShowStreamKey
          streamKey={streamKey}
          endsAt={streamKeyEndsAt ?? 0}
          scaleFactor={scaleFactor}
          engine={engine}
          entity={entity}
          video={video}
          onReset={() => setResetStreamKey(true)}
        />
      ) : (
        <GenerateStreamKey scaleFactor={scaleFactor} engine={engine} />
      )}
    </UiEntity>
  )
}

