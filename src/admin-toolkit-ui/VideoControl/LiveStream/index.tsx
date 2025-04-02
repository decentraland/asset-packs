import { Color4 } from '@dcl/sdk/math'
import { DeepReadonlyObject, Entity, IEngine, PBVideoPlayer } from '@dcl/ecs'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import { ICONS } from '..'
import { getAdminToolkitVideoControl } from '../utils'
import { Header } from '../../Header'
import { ShowStreamKey } from './ShowStreamKey'
import { GenerateStreamKey } from './GenerateStreamKey'
import { DeleteStreamKeyConfirmation } from './DeleteStreamKey'
import { state } from '../..'
import { getComponents } from '../../../definitions'

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
  const streamKey = VideoControlState.getOrNull(state.adminToolkitUiEntity)?.streamKey ?? ''

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

