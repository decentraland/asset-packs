import { IEngine } from '@dcl/ecs'
import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'

import { Button } from '../Button'
import { deleteSceneAdmin } from './utils'
import { moderationControlState, SceneAdmin } from '.'
import { LoadingDots } from '../Loading'
import { Error } from '../Error'
import { fetchSceneAdmins } from '..'


export function RemoveAdminConfirmation({
  scaleFactor,
  admin,
  engine,
}: {
  scaleFactor: number
  admin: SceneAdmin
  engine: IEngine
}) {
  const [isLoading, setIsLoading] = ReactEcs.useState(false)
  const [error, setError] = ReactEcs.useState(false)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <UiEntity
        uiTransform={{
          width: 675 * scaleFactor,
          minHeight: 279 * scaleFactor,
          padding: 24 * scaleFactor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
        }}
        uiBackground={{ color: Color4.Black() }}
      >
        <Label
          value={`Are you sure you want to remove <b>${admin.name ?? admin.address}</b> from the Admin list?`}
          fontSize={18 * scaleFactor}
          color={Color4.White()}
        />

        <Label
          value="This user will lose access to the Admin Tools for this scene"
          fontSize={14 * scaleFactor}
          color={Color4.Gray()}
          uiTransform={{
            margin: { top: 12 * scaleFactor, bottom: 24 * scaleFactor },
          }}
        />

        <UiEntity
          uiTransform={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {!isLoading && <Button
            id="cancel-remove"
            value="<b>Cancel</b>"
            variant="primary"
            fontSize={16 * scaleFactor}
            color={Color4.Black()}
            uiTransform={{
              width: 90 * scaleFactor,
              height: 40 * scaleFactor,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: { right: 30 * scaleFactor, left: 30 * scaleFactor },
            }}
            onMouseDown={() => {
              moderationControlState.adminToRemove = undefined
            }}
          />}
          {!isLoading && <Button
            id="confirm-remove"
            value={'<b>Remove Admin</b>'}
            variant="primary"
            fontSize={16 * scaleFactor}
            color={Color4.White()}
            uiTransform={{
              width: 160 * scaleFactor,
              height: 40 * scaleFactor,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            uiBackground={{ color: Color4.fromHexString('#FF2D55') }}
            onMouseDown={async () => {
              if (!isLoading && admin.address) {
                setIsLoading(true)
                const [error] = await deleteSceneAdmin(admin.address)
                if (error) {
                  setError(true)
                  console.log(error)
                  // TODO: handle error
                } else {
                  moderationControlState.adminToRemove = undefined
                  await fetchSceneAdmins()
                }
                setIsLoading(false)
              }
            }}
          />}
        </UiEntity>
          {isLoading && <LoadingDots scaleFactor={scaleFactor} engine={engine} />}
          {error && <Error scaleFactor={scaleFactor} text="Please try again" />}
      </UiEntity>
    </UiEntity>
  )
}
