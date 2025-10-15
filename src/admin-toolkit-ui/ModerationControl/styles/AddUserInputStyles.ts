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
    borderWidth: 4 * scaleFactor,
    borderRadius: 8 * scaleFactor,
    height: 48 * scaleFactor,
  },
  button: {
    margin: { left: 10 * scaleFactor },
    minWidth: 96 * scaleFactor,
    height: 48 * scaleFactor,
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
      bottom: 8 * scaleFactor,
    },
  },
  marginBottomMedium: {
    margin: { bottom: 4 * scaleFactor },
  },
})

export const getAddUserInputColors = () => ({
  white: Color4.White(),
  black: Color4.Black(),
  red: Color4.Red(),
  pink: Color4.fromHexString('#FB3B3B'),
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

export const getBanUserTextStyles = (scaleFactor: number) => ({
  fontSize: 14 * scaleFactor,
  color: Color4.White(),
  textAlign: 'top-left' as const,
})
