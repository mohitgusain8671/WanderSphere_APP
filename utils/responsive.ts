import { Dimensions, PixelRatio } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device categories based on width
export const DEVICE_SIZES = {
  SMALL: 320,   // iPhone SE, small Android phones
  MEDIUM: 375,  // iPhone 12/13/14 standard
  LARGE: 414,   // iPhone 12/13/14 Plus, large Android phones
  TABLET: 768,  // iPad Mini, small tablets
  DESKTOP: 1024 // Large tablets, desktop
};

// Determine device category
export const getDeviceSize = () => {
  if (SCREEN_WIDTH <= DEVICE_SIZES.SMALL) return 'small';
  if (SCREEN_WIDTH <= DEVICE_SIZES.MEDIUM) return 'medium';
  if (SCREEN_WIDTH <= DEVICE_SIZES.LARGE) return 'large';
  if (SCREEN_WIDTH <= DEVICE_SIZES.TABLET) return 'tablet';
  return 'desktop';
};

// Check if device is small screen
export const isSmallDevice = () => SCREEN_WIDTH <= DEVICE_SIZES.SMALL;
export const isMediumDevice = () => SCREEN_WIDTH > DEVICE_SIZES.SMALL && SCREEN_WIDTH <= DEVICE_SIZES.MEDIUM;
export const isLargeDevice = () => SCREEN_WIDTH > DEVICE_SIZES.MEDIUM && SCREEN_WIDTH <= DEVICE_SIZES.LARGE;
export const isTablet = () => SCREEN_WIDTH > DEVICE_SIZES.LARGE;

// Responsive width function
export const wp = (percentage: number): number => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive height function  
export const hp = (percentage: number): number => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive font size
export const fs = (baseFontSize: number): number => {
  const scale = SCREEN_WIDTH / DEVICE_SIZES.MEDIUM; // Base scale on iPhone standard size
  const newSize = baseFontSize * scale;
  
  // Ensure minimum and maximum font sizes
  const minSize = baseFontSize * 0.8;
  const maxSize = baseFontSize * 1.3;
  
  return Math.round(PixelRatio.roundToNearestPixel(
    Math.max(minSize, Math.min(maxSize, newSize))
  ));
};

// Responsive spacing (margins, paddings)
export const spacing = {
  xs: wp(1),      // 4px on standard device
  sm: wp(2),      // 8px
  md: wp(4),      // 16px  
  lg: wp(6),      // 24px
  xl: wp(8),      // 32px
  xxl: wp(10),    // 40px
};

// Responsive border radius
export const borderRadius = {
  xs: wp(1),      // 4px
  sm: wp(2),      // 8px
  md: wp(3),      // 12px
  lg: wp(4),      // 16px
  xl: wp(5),      // 20px
  xxl: wp(6),     // 24px
  full: wp(50),   // Circular
};

// Responsive icon sizes
export const iconSizes = {
  xs: fs(12),
  sm: fs(16),
  md: fs(20),
  lg: fs(24),
  xl: fs(28),
  xxl: fs(32),
};

// Responsive button heights
export const buttonHeights = {
  sm: hp(4.5),    // ~36px
  md: hp(6),      // ~48px
  lg: hp(7),      // ~56px
};

// Responsive card dimensions
export const cardDimensions = {
  minHeight: hp(15),
  mediumHeight: hp(20),
  largeHeight: hp(25),
  fullWidth: wp(100),
  cardWidth: wp(90),
  smallCardWidth: wp(42),
};

// Device-specific responsive values
export const deviceResponsive = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
  default: T;
}): T => {
  const deviceSize = getDeviceSize();
  
  switch (deviceSize) {
    case 'small':
      return values.small ?? values.default;
    case 'medium':
      return values.medium ?? values.default;
    case 'large':
      return values.large ?? values.default;
    case 'tablet':
    case 'desktop':
      return values.tablet ?? values.default;
    default:
      return values.default;
  }
};

// Typography responsive system
export const typography = {
  // Headers
  h1: {
    fontSize: deviceResponsive({
      small: fs(24),
      medium: fs(28),
      large: fs(32),
      tablet: fs(36),
      default: fs(28)
    }),
    lineHeight: deviceResponsive({
      small: fs(30),
      medium: fs(34),
      large: fs(38),
      tablet: fs(42),
      default: fs(34)
    }),
    fontWeight: '800' as const,
  },
  
  h2: {
    fontSize: deviceResponsive({
      small: fs(20),
      medium: fs(22),
      large: fs(24),
      tablet: fs(28),
      default: fs(22)
    }),
    lineHeight: deviceResponsive({
      small: fs(26),
      medium: fs(28),
      large: fs(30),
      tablet: fs(34),
      default: fs(28)
    }),
    fontWeight: '700' as const,
  },
  
  h3: {
    fontSize: deviceResponsive({
      small: fs(16),
      medium: fs(18),
      large: fs(20),
      tablet: fs(22),
      default: fs(18)
    }),
    lineHeight: deviceResponsive({
      small: fs(22),
      medium: fs(24),
      large: fs(26),
      tablet: fs(28),
      default: fs(24)
    }),
    fontWeight: '600' as const,
  },
  
  // Body text
  body: {
    fontSize: deviceResponsive({
      small: fs(14),
      medium: fs(15),
      large: fs(16),
      tablet: fs(17),
      default: fs(15)
    }),
    lineHeight: deviceResponsive({
      small: fs(20),
      medium: fs(22),
      large: fs(24),
      tablet: fs(26),
      default: fs(22)
    }),
    fontWeight: '500' as const,
  },
  
  bodySmall: {
    fontSize: deviceResponsive({
      small: fs(12),
      medium: fs(13),
      large: fs(14),
      tablet: fs(15),
      default: fs(13)
    }),
    lineHeight: deviceResponsive({
      small: fs(16),
      medium: fs(18),
      large: fs(20),
      tablet: fs(22),
      default: fs(18)
    }),
    fontWeight: '500' as const,
  },
  
  // Caption and small text
  caption: {
    fontSize: deviceResponsive({
      small: fs(10),
      medium: fs(11),
      large: fs(12),
      tablet: fs(13),
      default: fs(11)
    }),
    lineHeight: deviceResponsive({
      small: fs(14),
      medium: fs(15),
      large: fs(16),
      tablet: fs(17),
      default: fs(15)
    }),
    fontWeight: '500' as const,
  },
  
  // Button text
  button: {
    fontSize: deviceResponsive({
      small: fs(14),
      medium: fs(15),
      large: fs(16),
      tablet: fs(17),
      default: fs(15)
    }),
    fontWeight: '600' as const,
  }
};

// Layout responsive system
export const layout = {
  // Containers
  container: {
    paddingHorizontal: deviceResponsive({
      small: spacing.md,
      medium: spacing.lg,
      large: spacing.xl,
      tablet: spacing.xxl,
      default: spacing.lg
    }),
  },
  
  // Sections
  section: {
    marginBottom: deviceResponsive({
      small: spacing.lg,
      medium: spacing.xl,
      large: spacing.xxl,
      tablet: wp(12),
      default: spacing.xl
    }),
  },
  
  // Cards
  card: {
    padding: deviceResponsive({
      small: spacing.md,
      medium: spacing.lg,
      large: spacing.xl,
      tablet: spacing.xxl,
      default: spacing.lg
    }),
    borderRadius: deviceResponsive({
      small: borderRadius.md,
      medium: borderRadius.lg,
      large: borderRadius.xl,
      tablet: borderRadius.xxl,
      default: borderRadius.lg
    }),
    marginBottom: deviceResponsive({
      small: spacing.md,
      medium: spacing.lg,
      large: spacing.xl,
      tablet: spacing.xxl,
      default: spacing.lg
    }),
  },
  
  // Header heights
  header: {
    height: deviceResponsive({
      small: hp(8),
      medium: hp(9),
      large: hp(10),
      tablet: hp(12),
      default: hp(9)
    }),
    paddingTop: deviceResponsive({
      small: hp(6),
      medium: hp(7),
      large: hp(7.5),
      tablet: hp(8),
      default: hp(7)
    }),
  },
};

// Animation values
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  scale: {
    press: 0.95,
    hover: 1.02,
  },
};

// Export screen dimensions for direct use
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

// Helper function to get responsive styles based on screen orientation
export const getOrientationStyles = () => {
  const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
  
  return {
    isLandscape,
    isPortrait: !isLandscape,
    containerPadding: isLandscape ? spacing.sm : spacing.md,
    headerHeight: isLandscape ? hp(8) : hp(10),
  };
};

// Grid system for responsive layouts
export const grid = {
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  
  gap: deviceResponsive({
    small: spacing.sm,
    medium: spacing.md,
    large: spacing.lg,
    tablet: spacing.xl,
    default: spacing.md
  }),
  
  cardWidth: deviceResponsive({
    small: wp(100) - (spacing.md * 2),
    medium: wp(100) - (spacing.lg * 2), 
    large: wp(100) - (spacing.xl * 2),
    tablet: wp(45),
    default: wp(100) - (spacing.lg * 2)
  }),
};

export default {
  wp,
  hp,
  fs,
  spacing,
  borderRadius,
  iconSizes,
  buttonHeights,
  cardDimensions,
  deviceResponsive,
  typography,
  layout,
  animations,
  screenDimensions,
  getDeviceSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  getOrientationStyles,
  grid,
};