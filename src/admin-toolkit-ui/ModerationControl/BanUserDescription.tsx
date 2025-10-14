import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import {
  getAddUserInputStyles,
  getAddUserInputColors,
  getBanUserTextStyles,
} from './styles/AddUserInputStyles'

type Props = {
  scaleFactor: number
}

export function BanUserDescription({ scaleFactor }: Props) {
  const styles = getAddUserInputStyles(scaleFactor)
  const textStyles = getBanUserTextStyles(scaleFactor)

  return (
    <UiEntity uiTransform={styles.bannedInfoContainer}>
      <UiEntity
        uiText={{
          value: "<b>Banned users CAN'T:</b>",
          ...textStyles,
        }}
        uiTransform={styles.marginBottomMedium}
      />
      <UiEntity
        uiText={{
          value: '- See your scene build',
          ...textStyles,
        }}
        uiTransform={styles.marginBottomSmall}
      />
      <UiEntity
        uiText={{
          value: '- Send messages in the Nearby chat',
          ...textStyles,
        }}
        uiTransform={styles.marginBottomSmall}
      />
      <UiEntity
        uiText={{
          value: '- Be seen by other users',
          ...textStyles,
        }}
        uiTransform={styles.marginBottomLarge}
      />
      <UiEntity
        uiText={{
          value: '<b>Banned users CAN still:</b>',
          ...textStyles,
        }}
        uiTransform={styles.marginBottomMedium}
      />
      <UiEntity
        uiText={{
          value: '- See other users',
          ...textStyles,
        }}
        uiTransform={styles.marginBottomSmall}
      />
      <UiEntity
        uiText={{
          value: '- See the messages in the Nearby chat',
          ...textStyles,
        }}
        uiTransform={styles.marginBottomXLarge}
      />
    </UiEntity>
  )
}
