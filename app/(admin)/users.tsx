import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { ADMIN_PERMISSIONS } from '../../utils/constants';

export default function UsersManagement() {
  const { colors, isDarkMode } = useTheme();
  const {
    user,
    adminUsers,
    isAdminUsersLoading,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    updateUserPermissions,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Create User Form State
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    permissions: [] as string[],
  });

  // Edit User Form State
  const [editUserData, setEditUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });

  const [isInitialMount, setIsInitialMount] = React.useState(true);

  useEffect(() => {
    loadUsers();
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    // Load users when filter changes (but not on initial mount)
    if (!isInitialMount) {
      loadUsers(true);
    }
  }, [filterRole]);

  const loadUsers = async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    
    const filters: any = {};
    if (searchQuery) filters.search = searchQuery;
    if (filterRole !== 'all') filters.role = filterRole;
    
    await getAllUsers(filters);
    
    if (showLoading) setRefreshing(false);
  };

  const handleRefresh = async () => {
    await loadUsers(true);
  };

  const handleSearch = () => {
    loadUsers(true);
  };

  const handleFilterChange = (role: string) => {
    setFilterRole(role);
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if only super_admin can create admin
    if (newUser.role === 'admin' && user?.role !== 'super_admin') {
      Alert.alert('Error', 'Only Super Admin can create admin users');
      return;
    }

    const result = await createUser(newUser);
    if (result.success) {
      Alert.alert('Success', 'User created successfully');
      setShowCreateModal(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        permissions: [],
      });
      loadUsers();
    } else {
      Alert.alert('Error', result.error || 'Failed to create user');
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserData({
      firstName: user.firstName,
      lastName: user.lastName || '',
      email: user.email,
      bio: user.bio || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const result = await updateUser(selectedUser._id, editUserData);
    if (result.success) {
      Alert.alert('Success', 'User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } else {
      Alert.alert('Error', result.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteUser(userId);
            if (result.success) {
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = (userId: string, currentRole: string) => {
    if (user?.role !== 'super_admin') {
      Alert.alert('Error', 'Only Super Admin can change user roles');
      return;
    }

    Alert.alert(
      'Change Role',
      'Select new role:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'User',
          onPress: async () => {
            const result = await changeUserRole(userId, 'user', []);
            if (result.success) {
              Alert.alert('Success', 'Role changed successfully');
              loadUsers();
            } else {
              Alert.alert('Error', result.error || 'Failed to change role');
            }
          },
        },
        {
          text: 'Admin',
          onPress: async () => {
            // Show permission selection
            const result = await changeUserRole(userId, 'admin', [
              ADMIN_PERMISSIONS.USER_MANAGEMENT,
              ADMIN_PERMISSIONS.POST_MANAGEMENT,
            ]);
            if (result.success) {
              Alert.alert('Success', 'Role changed to Admin');
              loadUsers();
            } else {
              Alert.alert('Error', result.error || 'Failed to change role');
            }
          },
        },
      ]
    );
  };

  const togglePermission = (permission: string) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleSelectedPermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleManagePermissions = (user: any) => {
    if (user.role !== 'admin') {
      Alert.alert('Error', 'Permissions can only be managed for admin users');
      return;
    }
    setSelectedUser(user);
    setSelectedPermissions(user.permissions || []);
    setShowPermissionsModal(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    const result = await updateUserPermissions(selectedUser._id, selectedPermissions);
    
    if (result.success) {
      Alert.alert('Success', 'Permissions updated successfully. User has been notified via email.');
      setShowPermissionsModal(false);
      setSelectedUser(null);
      setSelectedPermissions([]);
      loadUsers();
    } else {
      Alert.alert('Error', result.error || 'Failed to update permissions');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search and Filters */}
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12 }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.text, fontSize: 14 }}
              placeholder="Search users..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: colors.background, padding: 10, borderRadius: 8 }}
          >
            <Ionicons name="filter" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{ backgroundColor: '#3B82F6', padding: 10, borderRadius: 8 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'user', 'admin', 'super_admin'].map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => handleFilterChange(role)}
                disabled={refreshing}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: filterRole === role ? '#3B82F6' : colors.background,
                  opacity: refreshing ? 0.6 : 1,
                }}
              >
                <Text style={{ color: filterRole === role ? 'white' : colors.text, fontSize: 14, fontWeight: '600' }}>
                  {role === 'all' ? 'All' : role.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Users List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
      >
        {isAdminUsersLoading && !adminUsers.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading users...</Text>
          </View>
        ) : adminUsers.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No users found</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {adminUsers.map((listUser: any) => (
              <View
                key={listUser._id}
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
                      {listUser.firstName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                      {listUser.firstName} {listUser.lastName}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>{listUser.email}</Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor:
                        listUser.role === 'super_admin' ? '#EF4444' : listUser.role === 'admin' ? '#F59E0B' : '#10B981',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {listUser.role.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {listUser.bio && (
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>{listUser.bio}</Text>
                )}

                {/* Show permissions for admin users */}
                {listUser.role === 'admin' && listUser.permissions && listUser.permissions.length >= 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
                      Permissions:
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {listUser.permissions.map((permission: string) => (
                        <View
                          key={permission}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          }}
                        >
                          <Text style={{ fontSize: 10, color: '#3B82F6', fontWeight: '600' }}>
                            {permission.replace(/_/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    onPress={() => handleEditUser(listUser)}
                    style={{
                      flex: 1,
                      minWidth: 100,
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

                  {listUser.role !== 'super_admin' && (
                    <>
                      {/* Show Permissions button only for admin users and only if current logged-in user is super_admin */}
                      {listUser.role === 'admin' && user?.role === 'super_admin' && (
                        <TouchableOpacity
                          onPress={() => handleManagePermissions(listUser)}
                          style={{
                            flex: 1,
                            minWidth: 100,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#8B5CF6',
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Ionicons name="key-outline" size={18} color="white" />
                          <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '600' }}>Permissions</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => handleChangeRole(listUser._id, listUser.role)}
                        style={{
                          flex: 1,
                          minWidth: 100,
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

                      <TouchableOpacity
                        onPress={() => handleDeleteUser(listUser._id, `${listUser.firstName} ${listUser.lastName}`)}
                        style={{
                          flex: 1,
                          minWidth: 100,
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
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Create New User</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="First Name *"
                placeholderTextColor={colors.textSecondary}
                value={newUser.firstName}
                onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Last Name"
                placeholderTextColor={colors.textSecondary}
                value={newUser.lastName}
                onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Email *"
                placeholderTextColor={colors.textSecondary}
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Password *"
                placeholderTextColor={colors.textSecondary}
                value={newUser.password}
                onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                secureTextEntry
              />

              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Role</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['user', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setNewUser({ ...newUser, role, permissions: [] })}
                    disabled={role === 'admin' && user?.role !== 'super_admin'}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: newUser.role === role ? '#3B82F6' : colors.background,
                      opacity: role === 'admin' && user?.role !== 'super_admin' ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ textAlign: 'center', color: newUser.role === role ? 'white' : colors.text, fontWeight: '600' }}>
                      {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {newUser.role === 'admin' && user?.role === 'super_admin' && (
                <>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Permissions</Text>
                  <View style={{ gap: 8, marginBottom: 16 }}>
                    {Object.values(ADMIN_PERMISSIONS).map((permission) => (
                      <TouchableOpacity
                        key={permission}
                        onPress={() => togglePermission(permission)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: newUser.permissions.includes(permission) ? '#3B82F620' : colors.background,
                        }}
                      >
                        <Ionicons
                          name={newUser.permissions.includes(permission) ? 'checkbox' : 'square-outline'}
                          size={24}
                          color={newUser.permissions.includes(permission) ? '#3B82F6' : colors.textSecondary}
                        />
                        <Text style={{ marginLeft: 12, color: colors.text }}>
                          {permission.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={handleCreateUser}
                style={{ backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 8, marginTop: 8 }}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: '700' }}>Create User</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Edit User</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
              placeholder="First Name"
              placeholderTextColor={colors.textSecondary}
              value={editUserData.firstName}
              onChangeText={(text) => setEditUserData({ ...editUserData, firstName: text })}
            />
            <TextInput
              style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
              placeholder="Last Name"
              placeholderTextColor={colors.textSecondary}
              value={editUserData.lastName}
              onChangeText={(text) => setEditUserData({ ...editUserData, lastName: text })}
            />
            <TextInput
              style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={editUserData.email}
              onChangeText={(text) => setEditUserData({ ...editUserData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 16, color: colors.text, height: 80 }}
              placeholder="Bio"
              placeholderTextColor={colors.textSecondary}
              value={editUserData.bio}
              onChangeText={(text) => setEditUserData({ ...editUserData, bio: text })}
              multiline
            />

            <TouchableOpacity
              onPress={handleUpdateUser}
              style={{ backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: '700' }}>Update User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manage Permissions Modal */}
      <Modal visible={showPermissionsModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Manage Permissions</Text>
                {selectedUser && (
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowPermissionsModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ 
                backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', 
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: '#3B82F6',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color: colors.text }}>
                    Permission Management
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                  Grant or revoke permissions for this admin user. Changes will be applied immediately and the user will be notified via email.
                </Text>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Select Permissions
              </Text>

              <View style={{ gap: 10, marginBottom: 20 }}>
                {Object.values(ADMIN_PERMISSIONS).map((permission) => {
                  const isSelected = selectedPermissions.includes(permission);
                  return (
                    <TouchableOpacity
                      key={permission}
                      onPress={() => toggleSelectedPermission(permission)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: isSelected 
                          ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                          : colors.background,
                        borderWidth: 2,
                        borderColor: isSelected ? '#3B82F6' : 'transparent',
                      }}
                    >
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: isSelected ? '#3B82F6' : colors.background,
                        borderWidth: 2,
                        borderColor: isSelected ? '#3B82F6' : colors.textSecondary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}>
                        {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: 15, 
                          fontWeight: '600', 
                          color: isSelected ? '#3B82F6' : colors.text,
                          marginBottom: 2,
                        }}>
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {getPermissionDescription(permission)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ 
                backgroundColor: colors.background, 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  <Text style={{ fontWeight: '600' }}>Selected: </Text>
                  {selectedPermissions.length} of {Object.values(ADMIN_PERMISSIONS).length} permissions
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setSelectedPermissions([])}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 8,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.textSecondary,
                  }}
                >
                  <Text style={{ textAlign: 'center', color: colors.text, fontSize: 15, fontWeight: '600' }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedPermissions(Object.values(ADMIN_PERMISSIONS))}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 8,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: '#3B82F6',
                  }}
                >
                  <Text style={{ textAlign: 'center', color: '#3B82F6', fontSize: 15, fontWeight: '600' }}>
                    Select All
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleUpdatePermissions}
                disabled={isAdminUsersLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 8,
                  marginTop: 16,
                  opacity: isAdminUsersLoading ? 0.6 : 1,
                }}
              >
                {isAdminUsersLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: '700' }}>
                    Update Permissions
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper function to get permission descriptions
function getPermissionDescription(permission: string): string {
  const descriptions: { [key: string]: string } = {
    user_management: 'Create, edit, and delete user accounts',
    post_management: 'Moderate and delete user posts',
    story_management: 'Moderate and delete user stories',
    query_management: 'View and respond to user queries',
    itinerary_management: 'Manage user itineraries',
    wanderlust_management: 'Manage wanderlust content',
    email_management: 'Send broadcast emails to users',
    admin_management: 'Manage other admin accounts',
    analytics_view: 'View analytics and reports',
    system_settings: 'Modify system settings',
    quiz_contest_management: 'Create and manage quizzes and contests',
  };
  return descriptions[permission] || 'Manage this feature';
}
