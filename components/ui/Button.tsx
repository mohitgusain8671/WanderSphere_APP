import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/constants';
import { 
  wp, hp, spacing, typography, buttonHeights, 
  borderRadius, deviceResponsive 
} from '../../utils/responsive';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();

  const getButtonStyles = () => {
    // Responsive padding and dimensions
    const sizeStyles = {
      sm: {
        paddingHorizontal: deviceResponsive({
          small: spacing.sm,
          medium: spacing.md,
          large: spacing.md,
          tablet: spacing.lg,
          default: spacing.md
        }),
        height: buttonHeights.sm,
      },
      md: {
        paddingHorizontal: deviceResponsive({
          small: spacing.md,
          medium: spacing.lg,
          large: spacing.xl,
          tablet: spacing.xxl,
          default: spacing.lg
        }),
        height: buttonHeights.md,
      },
      lg: {
        paddingHorizontal: deviceResponsive({
          small: spacing.lg,
          medium: spacing.xl,
          large: spacing.xxl,
          tablet: wp(8),
          default: spacing.xl
        }),
        height: buttonHeights.lg,
      }
    };
    
    const variantStyles = {
      primary: {
        backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
      },
      secondary: {
        backgroundColor: isDarkMode ? '#10B981' : '#059669',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: deviceResponsive({
          small: 1.5,
          medium: 2,
          large: 2,
          tablet: 2.5,
          default: 2
        }),
        borderColor: isDarkMode ? colors.border : '#D1D5DB',
      },
      ghost: {
        backgroundColor: 'transparent',
      }
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      borderRadius: borderRadius.md,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: fullWidth ? '100%' as const : undefined,
      opacity: (disabled || loading) ? 0.6 : 1,
      shadowColor: '#000',
      shadowOffset: variant !== 'ghost' && variant !== 'outline' ? { width: 0, height: 2 } : { width: 0, height: 0 },
      shadowOpacity: variant !== 'ghost' && variant !== 'outline' ? 0.1 : 0,
      shadowRadius: variant !== 'ghost' && variant !== 'outline' ? 3 : 0,
      elevation: variant !== 'ghost' && variant !== 'outline' ? 2 : 0,
    };
  };

  const getTextStyles = () => {
    const sizeTextStyles = {
      sm: {
        fontSize: deviceResponsive({
          small: typography.caption.fontSize,
          medium: typography.bodySmall.fontSize,
          large: typography.bodySmall.fontSize,
          tablet: typography.body.fontSize,
          default: typography.bodySmall.fontSize
        }),
      },
      md: {
        fontSize: typography.button.fontSize,
      },
      lg: {
        fontSize: deviceResponsive({
          small: typography.body.fontSize,
          medium: typography.button.fontSize + 2,
          large: typography.button.fontSize + 4,
          tablet: typography.h3.fontSize,
          default: typography.button.fontSize + 2
        }),
      }
    };

    const variantTextStyles = {
      primary: {
        color: '#FFFFFF',
        fontWeight: '600' as const,
      },
      secondary: {
        color: '#FFFFFF',
        fontWeight: '600' as const,
      },
      outline: {
        color: isDarkMode ? colors.text : '#374151',
        fontWeight: '600' as const,
      },
      ghost: {
        color: isDarkMode ? '#60A5FA' : '#2563EB',
        fontWeight: '500' as const,
      }
    };

    return {
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size={deviceResponsive({
            small: 'small',
            medium: 'small',
            large: 'small', 
            tablet: 'small',
            default: 'small'
          })} 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : 'white'} 
          style={{ marginRight: spacing.sm }}
        />
      )}
      <Text style={getTextStyles()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};