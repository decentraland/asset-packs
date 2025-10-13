import { Color4 } from '@dcl/ecs-math'
import { CONTENT_URL } from '../../constants'

const ERROR_ICON = `${CONTENT_URL}/admin_toolkit/assets/icons/error.png`

export const getAddUserInputStyles = (scaleFactor: number) => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    positionType: 'relative' as const,
  },
  title: {
    margin: { bottom: 8 * scaleFactor },
  },
  input: {
    width: '100%' as const,
    height: 42 * scaleFactor,
    margin: { bottom: 16 * scaleFactor },
    borderWidth: 4 * scaleFactor,
    borderRadius: 8 * scaleFactor,
  },
  button: {
    margin: { top: 8 * scaleFactor, left: 10 * scaleFactor },
    minWidth: 96 * scaleFactor,
    height: 42 * scaleFactor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 0,
  },
  error: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-start' as const,
    margin: { top: 8 * scaleFactor, bottom: 8 * scaleFactor },
  },
  errorIcon: {
    width: 16 * scaleFactor,
    height: 16 * scaleFactor,
    margin: { right: 8 * scaleFactor },
  },
  bannedInfoContainer: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    margin: { bottom: 8 * scaleFactor },
    padding: {
      top: 4 * scaleFactor,
      bottom: 4 * scaleFactor,
    },
    width: 10000 * scaleFactor,
  },
  bannedInfoTitle: {
    margin: { bottom: 4 * scaleFactor },
  },
  bannedInfoItem: {
    margin: { bottom: 2 * scaleFactor },
  },
  bannedInfoSeparator: {
    margin: { bottom: 12 * scaleFactor },
  },
  bannedInfoSectionTitle: {
    margin: { bottom: 4 * scaleFactor },
  },
  bannedInfoLastItem: {
    margin: { bottom: 16 * scaleFactor },
  },
})

export const getAddUserInputColors = () => ({
  white: Color4.White(),
  black: Color4.Black(),
  red: Color4.Red(),
  placeholder: Color4.create(160 / 255, 155 / 255, 168 / 255, 1),
})

export const getAddUserInputBackgrounds = () => ({
  input: { color: Color4.White() },
  errorIcon: {
    textureMode: 'stretch' as const,
    texture: {
      src: ERROR_ICON,
    },
  },
})
