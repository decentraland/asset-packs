import ReactEcs, { UiEntity, Label } from '@dcl/react-ecs'
import {
  getAddUserInputStyles,
  getAddUserInputColors,
} from './styles/AddUserInputStyles'

type Props = {
  scaleFactor: number
}

export function BanUserDescription({ scaleFactor }: Props) {
  const styles = getAddUserInputStyles(scaleFactor)
  const colors = getAddUserInputColors()

  return (
    <UiEntity uiTransform={styles.bannedInfoContainer}>
      <Label
        value="<b>Banned users CAN'T:</b>"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomMedium}
      />
      <Label
        value="- See your scene build"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomSmall}
      />
      <Label
        value="- Send messages in the Nearby chat"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomSmall}
      />
      <Label
        value="- Be seen by other users"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomLarge}
      />
      <Label
        value="<b>Banned users CAN still:</b>"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomMedium}
      />
      <Label
        value="- See other users"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomSmall}
      />
      <Label
        value="- See the messages in the Nearby chat"
        fontSize={14 * scaleFactor}
        color={colors.white}
        uiTransform={styles.marginBottomXLarge}
      />
    </UiEntity>
  )
}
