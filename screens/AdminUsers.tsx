import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type AdminUsersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminUsers'>;

interface User {
  id: number;
  fullname: string;
  email: string;
  phone_number: string;
  address?: string;
  role_name: string;
  created_at?: string;
  password?: string;
}

const AdminUsers = () => {
  const navigation = useNavigation<AdminUsersNavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 0,
    fullname: '',
    email: '',
    phone_number: '',
    address: '',
    role_name: 'customer',
    password: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCurrentUser = () => {
    setCurrentUser({
      id: 0,
      fullname: '',
      email: '',
      phone_number: '',
      address: '',
      role_name: 'customer',
      password: '',
    });
  };

  const handleAddUser = async () => {
    if (!currentUser.fullname || !currentUser.email || !currentUser.phone_number || !currentUser.password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await userAPI.register({
        fullname: currentUser.fullname,
        email: currentUser.email,
        phone_number: currentUser.phone_number,
        address: currentUser.address || '',
        password: currentUser.password,
        role_name: currentUser.role_name,
      });
      Alert.alert('Thành công', 'Đã thêm người dùng');
      setShowAddModal(false);
      resetCurrentUser();
      loadUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Không thể thêm người dùng';
      Alert.alert('Lỗi', errorMsg);
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentUser({ ...user, password: '' });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!currentUser.fullname || !currentUser.email || !currentUser.phone_number) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const updateData: any = {
        fullname: currentUser.fullname,
        email: currentUser.email,
        phone_number: currentUser.phone_number,
        address: currentUser.address || '',
      };
      if (currentUser.password) {
        updateData.password = currentUser.password;
      }
      
      await userAPI.updateProfile(currentUser.id, updateData);
      Alert.alert('Thành công', 'Đã cập nhật người dùng');
      setShowEditModal(false);
      resetCurrentUser();
      loadUsers();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật người dùng');
    }
  };

  const handleDelete = (id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userAPI.deleteAccount(userToDelete);
      Alert.alert('Thành công', 'Đã xóa người dùng');
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa người dùng');
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number.includes(searchQuery);
      const matchesRole = !selectedRole || user.role_name === selectedRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (a.fullname && b.fullname) {
        return a.fullname.localeCompare(b.fullname);
      }
      return 0;
    });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF004C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FF004C', '#FF3366']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.roleFilter}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === '' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('')}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === '' && styles.roleButtonTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'admin' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('admin')}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'admin' && styles.roleButtonTextActive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'customer' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('customer')}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'customer' && styles.roleButtonTextActive,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.fullname?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.fullname}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{user.phone_number}</Text>
                {user.address && <Text style={styles.userAddress}>{user.address}</Text>}
                <View style={styles.userRoleContainer}>
                  <Text
                    style={[
                      styles.userRole,
                      user.role_name === 'admin'
                        ? styles.userRoleAdmin
                        : styles.userRoleCustomer,
                    ]}
                  >
                    {user.role_name === 'admin' ? 'Admin' : 'Customer'}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditUser(user)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(user.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có người dùng nào</Text>
        )}

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>Trước</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              {currentPage} / {totalPages}
            </Text>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>Sau</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm người dùng mới</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên *"
                value={currentUser.fullname}
                onChangeText={(text) => setCurrentUser({ ...currentUser, fullname: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                keyboardType="email-address"
                autoCapitalize="none"
                value={currentUser.email}
                onChangeText={(text) => setCurrentUser({ ...currentUser, email: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại *"
                keyboardType="phone-pad"
                value={currentUser.phone_number}
                onChangeText={(text) => setCurrentUser({ ...currentUser, phone_number: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={currentUser.address}
                onChangeText={(text) => setCurrentUser({ ...currentUser, address: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu *"
                secureTextEntry
                value={currentUser.password}
                onChangeText={(text) => setCurrentUser({ ...currentUser, password: text })}
              />
              <View style={styles.roleSelector}>
                <Text style={styles.inputLabel}>Vai trò:</Text>
                <View style={styles.roleSelectorButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectorButton,
                      currentUser.role_name === 'customer' && styles.roleSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentUser({ ...currentUser, role_name: 'customer' })}
                  >
                    <Text
                      style={[
                        styles.roleSelectorButtonText,
                        currentUser.role_name === 'customer' && styles.roleSelectorButtonTextActive,
                      ]}
                    >
                      Customer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectorButton,
                      currentUser.role_name === 'admin' && styles.roleSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentUser({ ...currentUser, role_name: 'admin' })}
                  >
                    <Text
                      style={[
                        styles.roleSelectorButtonText,
                        currentUser.role_name === 'admin' && styles.roleSelectorButtonTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetCurrentUser();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddUser}>
                <Text style={styles.saveButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa người dùng</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên *"
                value={currentUser.fullname}
                onChangeText={(text) => setCurrentUser({ ...currentUser, fullname: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                keyboardType="email-address"
                autoCapitalize="none"
                value={currentUser.email}
                onChangeText={(text) => setCurrentUser({ ...currentUser, email: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại *"
                keyboardType="phone-pad"
                value={currentUser.phone_number}
                onChangeText={(text) => setCurrentUser({ ...currentUser, phone_number: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={currentUser.address}
                onChangeText={(text) => setCurrentUser({ ...currentUser, address: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới (để trống nếu không đổi)"
                secureTextEntry
                value={currentUser.password}
                onChangeText={(text) => setCurrentUser({ ...currentUser, password: text })}
              />
              <View style={styles.roleSelector}>
                <Text style={styles.inputLabel}>Vai trò:</Text>
                <View style={styles.roleSelectorButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectorButton,
                      currentUser.role_name === 'customer' && styles.roleSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentUser({ ...currentUser, role_name: 'customer' })}
                  >
                    <Text
                      style={[
                        styles.roleSelectorButtonText,
                        currentUser.role_name === 'customer' && styles.roleSelectorButtonTextActive,
                      ]}
                    >
                      Customer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectorButton,
                      currentUser.role_name === 'admin' && styles.roleSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentUser({ ...currentUser, role_name: 'admin' })}
                  >
                    <Text
                      style={[
                        styles.roleSelectorButtonText,
                        currentUser.role_name === 'admin' && styles.roleSelectorButtonTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetCurrentUser();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
                <Text style={styles.saveButtonText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            <Text style={styles.deleteMessage}>
              Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmButton} onPress={confirmDelete}>
                <Text style={styles.deleteConfirmButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  roleFilter: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#FF004C',
  },
  roleButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 15,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF004C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  userRoleContainer: {
    alignSelf: 'flex-start',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userRoleAdmin: {
    backgroundColor: '#E8D5FF',
    color: '#8B5CF6',
  },
  userRoleCustomer: {
    backgroundColor: '#D1FAE5',
    color: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#4ECDC4',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 15,
  },
  pageButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  roleSelector: {
    marginBottom: 15,
  },
  roleSelectorButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleSelectorButtonActive: {
    backgroundColor: '#FF004C',
    borderColor: '#FF004C',
  },
  roleSelectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleSelectorButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF004C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteConfirmButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteConfirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
});

export default AdminUsers;

