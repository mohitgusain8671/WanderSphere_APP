import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/constants';

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
    const baseStyles = 'rounded-lg flex-row items-center justify-center';
    const sizeStyles = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4'
    };
    
    const variantStyles = {
      primary: `bg-blue-600 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`,
      secondary: `bg-green-600 ${isDarkMode ? 'bg-green-500' : 'bg-green-600'}`,
      outline: `border-2 ${isDarkMode ? 'border-gray-600 bg-transparent' : 'border-gray-300 bg-transparent'}`,
      ghost: 'bg-transparent'
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    const disabledStyle = (disabled || loading) ? 'opacity-50' : '';

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${disabledStyle}`;
  };

  const getTextStyles = () => {
    const sizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    const variantStyles = {
      primary: 'text-white font-semibold',
      secondary: 'text-white font-semibold',
      outline: `font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`,
      ghost: `font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
    };

    return `${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  return (
    <TouchableOpacity
      className={getButtonStyles()}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : 'white'} 
          className="mr-2"
        />
      )}
      <Text className={getTextStyles()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};