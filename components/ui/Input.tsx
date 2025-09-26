import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputContainerStyles = () => {
    const baseStyles = 'flex-row items-center rounded-lg border px-3 py-3';
    const themeStyles = isDarkMode 
      ? 'bg-gray-800 border-gray-600' 
      : 'bg-gray-50 border-gray-300';
    const errorStyles = error 
      ? (isDarkMode ? 'border-red-400' : 'border-red-500')
      : '';
    
    return `${baseStyles} ${themeStyles} ${errorStyles}`;
  };

  const getInputStyles = () => {
    const baseStyles = 'flex-1 text-base';
    const themeStyles = isDarkMode ? 'text-gray-100' : 'text-gray-900';
    
    return `${baseStyles} ${themeStyles}`;
  };

  const iconColor = isDarkMode ? colors.textSecondary : colors.textSecondary;

  return (
    <View className="mb-4">
      {label && (
        <Text className={`mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {label}
        </Text>
      )}
      
      <View className={getInputContainerStyles()}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={iconColor} 
            className="mr-3"
          />
        )}
        
        <TextInput
          className={getInputStyles()}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          style={style}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="ml-3">
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={iconColor}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-3">
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="mt-1 text-sm text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
};