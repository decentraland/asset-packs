import { Color4 } from '@dcl/ecs-math'

export const getAddUserInputStyles = (scaleFactor: number) => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    positionType: 'relative' as const,
  },
  title: {
    margin: { bottom: 2 * scaleFactor },
  },
  input: {
    width: '100%' as const,
    height: 42 * scaleFactor,
    margin: { bottom: 16 * scaleFactor },
    borderWidth: 4,
    borderRadius: 8,
  },
  button: {
    margin: { left: 10 * scaleFactor },
    minWidth: 96 * scaleFactor,
    height: 42 * scaleFactor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 0,
  },
  error: {
    margin: { top: -16, bottom: 16 * scaleFactor },
    justifyContent: 'flex-start' as const,
  },
  bannedInfoContainer: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    margin: { top: 8 * scaleFactor, bottom: 16 * scaleFactor },
    padding: {
      top: 4 * scaleFactor,
      bottom: 4 * scaleFactor,
      left: 12 * scaleFactor,
      right: 12 * scaleFactor,
    },
    width: '100%' as const,
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
})
