import { Color4 } from '@dcl/sdk/math'
import { UiTransformProps } from '@dcl/react-ecs'

export const getDclCastStyles = (
  scaleFactor: number,
): Record<string, UiTransformProps> => ({
  // Container base styles
  fullContainer: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },

  // Width containers
  fullWidth: {
    width: '100%',
  },

  fullWidthWithBottomMargin: {
    width: '100%',
    margin: { bottom: 24 * scaleFactor },
  },

  // Row containers
  rowSpaceBetween: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  rowCenter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowCenterSpaceBetween: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Column containers
  columnContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
  },

  columnFlexStart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: 'auto',
  },

  columnCentered: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  columnWithMarginTop: {
    display: 'flex',
    flexDirection: 'column',
    margin: { top: 8 * scaleFactor },
  },

  // Margins
  marginBottomSmall: {
    margin: { bottom: 8 * scaleFactor },
  },

  marginBottomMedium: {
    margin: { bottom: 16 * scaleFactor },
  },

  marginBottomLarge: {
    margin: { bottom: 18 * scaleFactor },
  },

  marginTopSmall: {
    margin: { top: -4 * scaleFactor },
  },

  marginTopMedium: {
    margin: { top: 16 * scaleFactor },
  },

  marginTopLarge: {
    margin: { top: 20 * scaleFactor },
  },

  marginLeftSmall: {
    margin: { left: 4 * scaleFactor },
  },

  marginRightMedium: {
    margin: { right: 8 * scaleFactor },
  },

  // Main bordered container
  mainBorderedContainer: {
    width: '100%',
    height: '100%',
    borderWidth: 2 * scaleFactor,
    borderColor: Color4.fromHexString('#716B7C'),
    flexDirection: 'column',
    borderRadius: 12 * scaleFactor,
    padding: {
      left: 16 * scaleFactor,
      right: 16 * scaleFactor,
      top: 24 * scaleFactor,
      bottom: 8 * scaleFactor,
    },
  },

  // Header row container
  headerRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    margin: { bottom: 18 * scaleFactor },
  },

  // Button styles
  deactivateButton: {
    minWidth: 120 * scaleFactor,
    margin: { right: 8 * scaleFactor },
    padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
  },

  activateButton: {
    minWidth: 120 * scaleFactor,
  },

  activateButtonLabel: {
    margin: { left: 20 * scaleFactor, right: 20 * scaleFactor },
  },

  retryButton: {
    margin: { top: 16 * scaleFactor },
    padding: {
      top: 8 * scaleFactor,
      bottom: 8 * scaleFactor,
      left: 16 * scaleFactor,
      right: 16 * scaleFactor,
    },
  },

  resetButton: {
    margin: { right: 8 * scaleFactor, top: 20 * scaleFactor },
    padding: { left: 8 * scaleFactor, right: 8 * scaleFactor },
  },

  // Icon styles
  iconSmall: {
    width: 20 * scaleFactor,
    height: 20 * scaleFactor,
  },

  // Loading container
  loadingContainer: {
    minHeight: 400 * scaleFactor,
  },

  // Separator line
  separatorLine: {
    margin: { top: 16 * scaleFactor, bottom: 16 * scaleFactor },
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: Color4.fromHexString('#43404A'),
  },

  // Text info containers
  textInfoContainer: {
    margin: { bottom: 4 * scaleFactor },
  },

  // Specific row containers with margins
  rowWithBottomMargin: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    margin: { bottom: 8 * scaleFactor },
  },
})

export const getDclCastColors = () => ({
  white: Color4.White(),
  black: Color4.Black(),
  gray: Color4.fromHexString('#716B7C'),
  lightGray: Color4.fromHexString('#A09BA8'),
  success: Color4.fromHexString('#34CE77'),
  danger: Color4.fromHexString('#FB3B3B'),
  darkGray: Color4.Gray(),
})

export const getDclCastBackgrounds = () => ({
  success: { color: Color4.fromHexString('#34CE77') },
  iconStretch: {
    textureMode: 'stretch' as const,
  },
})
