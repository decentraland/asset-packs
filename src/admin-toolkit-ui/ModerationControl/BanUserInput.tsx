import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label, Input } from '@dcl/react-ecs'
import { Button } from '../Button'
import { postSceneBan } from './api'
import { Error } from '../Error'
import { getSceneBans } from './api'

type Props = {
  scaleFactor: number
  onSubmit(value: string): void
}
let $inputValue: string = ''

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function BanUserInput({ scaleFactor, onSubmit }: Props) {
  const [error, setError] = ReactEcs.useState(false)
  const [loading, setLoading] = ReactEcs.useState(false)

  return (
    <UiEntity
      uiTransform={{
        display: 'flex',
        flexDirection: 'column',
        positionType: 'relative',
      }}
    >
      <Label
        value="<b>Ban user from scene</b>"
        fontSize={18 * scaleFactor}
        color={Color4.White()}
        uiTransform={{
          margin: { bottom: 16 * scaleFactor },
        }}
      />
      <UiEntity>
        <Input
          onChange={($) => {
            if (error) {
              setError(false)
            }
            $inputValue = $
          }}
          onSubmit={(value) => {
            onSubmit(value)
            $inputValue = ''
          }}
          value={$inputValue}
          fontSize={16 * scaleFactor}
          placeholder="Wallet Address"
          placeholderColor={Color4.create(160 / 255, 155 / 255, 168 / 255, 1)}
          color={Color4.Black()}
          uiBackground={{ color: Color4.White() }}
          uiTransform={{
            width: '100%',
            height: 42 * scaleFactor,
            margin: { bottom: 16 * scaleFactor },
            borderColor:
              (!$inputValue || isValidAddress($inputValue)) && !error
                ? Color4.White()
                : Color4.Red(),
            borderWidth: 4,
            borderRadius: 8,
          }}
        />
        <Button
          id="moderation_control_kick_user"
          value={'<b>Ban</b>'}
          fontSize={18 * scaleFactor}
          uiTransform={{
            margin: { left: 10 * scaleFactor },
            minWidth: 96 * scaleFactor,
            height: 42 * scaleFactor,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseDown={async () => {
            if (loading) return
            console.log('ALE=> Starting ban process for:', $inputValue)
            setLoading(true)
            const [error, data] = await postSceneBan($inputValue)
            console.log(
              'ALE=> postSceneBan response - error:',
              error,
              'data:',
              data,
            )
            if (data) {
              setError(false)
              $inputValue = ''
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
          }}
        />
      </UiEntity>
      {error && (
        <Error
          uiTransform={{
            margin: { top: -16 & scaleFactor, bottom: 16 * scaleFactor },
            justifyContent: 'flex-start',
          }}
          scaleFactor={scaleFactor}
          text="Please try again."
        />
      )}
    </UiEntity>
  )
}
