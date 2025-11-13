import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface UserCardProps {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    bio?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onChangeRole: () => void;
  isSuperAdmin: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onChangeRole, isSuperAdmin }) => {
  const { colors } = useTheme();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '#EF4444';
      case 'admin':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#3B82F6',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
            {user.firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{user.email}</Text>
        </View>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: getRoleBadgeColor(user.role),
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            {user.role.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {user.bio && (
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>{user.bio}</Text>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={onEdit}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3B82F6',
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons name="create-outline" size={18} color="white" />
          <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>

        {user.role !== 'super_admin' && (
          <>
            {isSuperAdmin && (
              <TouchableOpacity
                onPress={onChangeRole}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F59E0B',
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="shield-outline" size={18} color="white" />
                <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '600' }}>Role</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onDelete}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#EF4444',
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '600' }}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
