import { Color4 } from '@dcl/ecs-math'

export const getModerationControlStyles = (scaleFactor: number) => ({
  container: {
    width: '100%' as const,
    height: '100%' as const,
    flexDirection: 'column' as const,
  },
  adminListButton: {
    width: 220 * scaleFactor,
    height: 42 * scaleFactor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  adminListIcon: {
    width: 25 * scaleFactor,
    height: 25 * scaleFactor,
    margin: { right: 10 * scaleFactor },
  },
  banListButton: {
    width: 220 * scaleFactor,
    height: 42 * scaleFactor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  banListIcon: {
    width: 25 * scaleFactor,
    height: 25 * scaleFactor,
    margin: { right: 10 * scaleFactor },
  },
  divider: {
    margin: { top: 16 * scaleFactor, bottom: 16 * scaleFactor },
    width: '100%' as const,
    height: 1,
    borderWidth: 1,
    borderColor: Color4.fromHexString('#43404A'),
  },
})

export const getModerationControlColors = () => ({
  white: Color4.White(),
})
