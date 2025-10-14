import { Color4 } from '@dcl/ecs-math'
import { CONTENT_URL } from '../../constants'

const ERROR_ICON = `${CONTENT_URL}/admin_toolkit/assets/icons/error.png`

export const getAddUserInputStyles = (scaleFactor: number) => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    margin: { bottom: 8 * scaleFactor },
  },
  title: {
    margin: { bottom: 8 * scaleFactor },
  },
  input: {
    width: '100%' as const,
    height: 42 * scaleFactor,
    borderWidth: 4 * scaleFactor,
    borderRadius: 8 * scaleFactor,
  },
  button: {
    margin: { left: 10 * scaleFactor },
    minWidth: 96 * scaleFactor,
    height: 42 * scaleFactor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 0,
  },
  errorContainer: {
    width: '100%' as const,
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    justifyContent: 'flex-start' as const,
    height: 20 * scaleFactor,
    margin: { top: 8 * scaleFactor, bottom: 12 * scaleFactor },
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
      left: 12 * scaleFactor,
      right: 12 * scaleFactor,
    },
    width: 10000 * scaleFactor,
  },
  marginBottomSmall: {
    margin: { bottom: 2 * scaleFactor },
  },
  marginBottomMedium: {
    margin: { bottom: 4 * scaleFactor },
  },
  marginBottomLarge: {
    margin: { bottom: 12 * scaleFactor },
  },
  marginBottomXLarge: {
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
