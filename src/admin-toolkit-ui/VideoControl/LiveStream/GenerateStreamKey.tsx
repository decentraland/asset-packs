import { Color4 } from '@dcl/sdk/math'
import { IEngine } from '@dcl/ecs'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import { Button } from '../../Button'
import { Error } from '../../Error'
import { getStreamKey } from '../api'
import { LoadingDots } from '../../Loading'
import { getComponents } from '../../../definitions'
import { state } from '../..'

export function GenerateStreamKey({
  scaleFactor,
  engine,
}: {
  scaleFactor: number
  engine: IEngine
}) {
  const [loading, setLoading] = ReactEcs.useState<boolean>(false)
  const [error, setError] = ReactEcs.useState<string>('')
  const { VideoControlState } = getComponents(engine)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 460 * scaleFactor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {loading ? (
        <UiEntity uiTransform={{ flexDirection: 'column' }}>
          <LoadingDots scaleFactor={scaleFactor} engine={engine} />
          <Label
            value="Generating your Stream Key"
            color={Color4.fromHexString('#A09BA8')}
            fontSize={16 * scaleFactor}
            uiTransform={{ margin: { top: 16 * scaleFactor } }}
          />
        </UiEntity>
      ) : (
        <UiEntity uiTransform={{ flexDirection: 'column' }}>
          <UiEntity uiTransform={{ justifyContent: 'center', width: '100%' }}>
            <Button
              id="video_control_live_generate_key"
              value="<b>Get Stream Key</b>"
              fontSize={18 * scaleFactor}
              uiTransform={{
                height: 52 * scaleFactor,
                padding: 16 * scaleFactor,
                margin: { bottom: 16 * scaleFactor }
              }}
              onMouseDown={async () => {
                console.log('on mouse down')
                setLoading(true)
                const [error, data] = await getStreamKey()
                setLoading(false)
                if (error) {
                  setError(error)
                } else {
                  console.log('Genearte Stream Key Response: ', JSON.stringify(data))
                  VideoControlState.getMutable(state.adminToolkitUiEntity).streamKey = 'some-stream-key'
                }
              }}
            />
          </UiEntity>
          {error && (
            <Error
              scaleFactor={scaleFactor}
              text={error}
              uiTransform={{ margin: { top: 16 * scaleFactor } }}
            />
          )}
        </UiEntity>
      )}
    </UiEntity>
  )
}
