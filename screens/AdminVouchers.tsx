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
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { voucherAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type AdminVouchersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminVouchers'>;

interface Voucher {
  id?: number;
  code: string;
  description?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  start_date: string;
  end_date: string;
  limit?: number;
  max_uses_per_user?: number;
  status?: string;
  used_count?: number;
}

const AdminVouchers = () => {
  const navigation = useNavigation<AdminVouchersNavigationProp>();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher>({
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: 10,
    min_order_amount: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    limit: 0,
    max_uses_per_user: 0,
    status: 'active',
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setIsLoading(true);
      const response = await voucherAPI.getAll();
      setVouchers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách vouchers');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCurrentVoucher({ ...currentVoucher, code: result });
  };

  const resetCurrentVoucher = () => {
    setCurrentVoucher({
      code: '',
      description: '',
      discount_type: 'percent',
      discount_value: 10,
      min_order_amount: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      limit: 0,
      max_uses_per_user: 0,
      status: 'active',
    });
  };

  const handleAddVoucher = async () => {
    if (!currentVoucher.code) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
      return;
    }

    try {
      await voucherAPI.create(currentVoucher);
      Alert.alert('Thành công', 'Đã thêm voucher');
      setShowAddModal(false);
      resetCurrentVoucher();
      loadVouchers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Không thể thêm voucher';
      Alert.alert('Lỗi', errorMsg);
    }
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setCurrentVoucher({
      id: voucher.id,
      code: voucher.code,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_amount: voucher.min_order_amount || 0,
      start_date: voucher.start_date.split('T')[0],
      end_date: voucher.end_date.split('T')[0],
      limit: voucher.limit || 0,
      max_uses_per_user: voucher.max_uses_per_user || 0,
      status: voucher.status || 'active',
    });
    setShowEditModal(true);
  };

  const handleUpdateVoucher = async () => {
    if (!currentVoucher.code) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
      return;
    }

    if (!currentVoucher.id) return;

    try {
      await voucherAPI.update(currentVoucher.id, currentVoucher);
      Alert.alert('Thành công', 'Đã cập nhật voucher');
      setShowEditModal(false);
      resetCurrentVoucher();
      loadVouchers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Không thể cập nhật voucher';
      Alert.alert('Lỗi', errorMsg);
    }
  };

  const handleDelete = (id: number) => {
    setVoucherToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!voucherToDelete) return;

    try {
      await voucherAPI.delete(voucherToDelete);
      Alert.alert('Thành công', 'Đã xóa voucher');
      setShowDeleteModal(false);
      setVoucherToDelete(null);
      loadVouchers();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa voucher');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const filteredVouchers = vouchers
    .filter((voucher) => {
      const matchesSearch =
        voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (voucher.description && voucher.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !selectedStatus || voucher.status === selectedStatus;
      const matchesType =
        !selectedType ||
        (selectedType === 'percentage' && voucher.discount_type === 'percent') ||
        (selectedType === 'fixed' && voucher.discount_type === 'fixed');
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage) || 1;

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
      <LinearGradient colors={['#FF004C', '#FF3366']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Vouchers</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo mã voucher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedStatus && styles.filterChipActive]}
              onPress={() => setSelectedStatus('')}
            >
              <Text style={[styles.filterChipText, !selectedStatus && styles.filterChipTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {['active', 'inactive', 'expired'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}
                >
                  {status === 'active' ? 'Hoạt động' : status === 'inactive' ? 'Tạm dừng' : 'Hết hạn'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedType && styles.filterChipActive]}
              onPress={() => setSelectedType('')}
            >
              <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>
                Tất cả loại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedType === 'percentage' && styles.filterChipActive]}
              onPress={() => setSelectedType('percentage')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === 'percentage' && styles.filterChipTextActive,
                ]}
              >
                Phần trăm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedType === 'fixed' && styles.filterChipActive]}
              onPress={() => setSelectedType('fixed')}
            >
              <Text style={[styles.filterChipText, selectedType === 'fixed' && styles.filterChipTextActive]}>
                Cố định
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paginatedVouchers.length > 0 ? (
          paginatedVouchers.map((voucher) => (
            <View key={voucher.id} style={styles.voucherCard}>
              <View style={styles.voucherInfo}>
                <View style={styles.voucherHeader}>
                  <Text style={styles.voucherCode}>{voucher.code}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      voucher.status === 'active'
                        ? styles.statusActive
                        : voucher.status === 'expired'
                        ? styles.statusExpired
                        : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {voucher.status === 'active'
                        ? 'Hoạt động'
                        : voucher.status === 'expired'
                        ? 'Hết hạn'
                        : 'Tạm dừng'}
                    </Text>
                  </View>
                </View>
                {voucher.description && (
                  <Text style={styles.voucherDescription}>{voucher.description}</Text>
                )}
                <View style={styles.voucherDetails}>
                  <Text style={styles.voucherValue}>
                    {voucher.discount_type === 'percent'
                      ? `Giảm ${voucher.discount_value}%`
                      : `Giảm ${voucher.discount_value.toLocaleString('vi-VN')} VNĐ`}
                  </Text>
                  {voucher.min_order_amount && voucher.min_order_amount > 0 && (
                    <Text style={styles.voucherMinOrder}>
                      Tối thiểu: {voucher.min_order_amount.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  )}
                  <Text style={styles.voucherDate}>
                    Từ: {formatDate(voucher.start_date)} - Đến: {formatDate(voucher.end_date)}
                  </Text>
                  {voucher.limit && voucher.limit > 0 && (
                    <Text style={styles.voucherUsage}>
                      Đã dùng: {voucher.used_count || 0}/{voucher.limit}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditVoucher(voucher)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(voucher.id!)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có voucher nào</Text>
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
            <Text style={styles.modalTitle}>Thêm voucher mới</Text>
            <ScrollView>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mã voucher *"
                  value={currentVoucher.code}
                  onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, code: text.toUpperCase() })}
                />
                <TouchableOpacity style={styles.generateButton} onPress={generateRandomCode}>
                  <Text style={styles.generateButtonText}>Tạo mã</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                numberOfLines={3}
                value={currentVoucher.description}
                onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, description: text })}
              />
              <View style={styles.typeSelector}>
                <Text style={styles.inputLabel}>Loại giảm giá:</Text>
                <View style={styles.typeSelectorButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorButton,
                      currentVoucher.discount_type === 'percent' && styles.typeSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentVoucher({ ...currentVoucher, discount_type: 'percent' })}
                  >
                    <Text
                      style={[
                        styles.typeSelectorButtonText,
                        currentVoucher.discount_type === 'percent' && styles.typeSelectorButtonTextActive,
                      ]}
                    >
                      Phần trăm (%)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorButton,
                      currentVoucher.discount_type === 'fixed' && styles.typeSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentVoucher({ ...currentVoucher, discount_type: 'fixed' })}
                  >
                    <Text
                      style={[
                        styles.typeSelectorButtonText,
                        currentVoucher.discount_type === 'fixed' && styles.typeSelectorButtonTextActive,
                      ]}
                    >
                      Cố định (VNĐ)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder={
                  currentVoucher.discount_type === 'percent'
                    ? 'Giá trị giảm (%) *'
                    : 'Giá trị giảm (VNĐ) *'
                }
                keyboardType="numeric"
                value={currentVoucher.discount_value.toString()}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, discount_value: parseFloat(text) || 0 })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Giá trị đơn hàng tối thiểu (VNĐ)"
                keyboardType="numeric"
                value={currentVoucher.min_order_amount?.toString() || '0'}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, min_order_amount: parseFloat(text) || 0 })
                }
              />
              <View style={styles.dateRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Ngày bắt đầu:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={currentVoucher.start_date}
                    onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, start_date: text })}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Ngày kết thúc:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={currentVoucher.end_date}
                    onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, end_date: text })}
                  />
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Sử dụng tối đa (0 = không giới hạn)"
                keyboardType="numeric"
                value={currentVoucher.limit?.toString() || '0'}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, limit: parseInt(text) || 0 })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Sử dụng tối đa mỗi người (0 = không giới hạn)"
                keyboardType="numeric"
                value={currentVoucher.max_uses_per_user?.toString() || '0'}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, max_uses_per_user: parseInt(text) || 0 })
                }
              />
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Trạng thái:</Text>
                <Switch
                  value={currentVoucher.status === 'active'}
                  onValueChange={(value) =>
                    setCurrentVoucher({ ...currentVoucher, status: value ? 'active' : 'inactive' })
                  }
                />
                <Text style={styles.switchLabel}>
                  {currentVoucher.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </Text>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetCurrentVoucher();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddVoucher}>
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
            <Text style={styles.modalTitle}>Chỉnh sửa voucher</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Mã voucher *"
                value={currentVoucher.code}
                onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, code: text.toUpperCase() })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                numberOfLines={3}
                value={currentVoucher.description}
                onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, description: text })}
              />
              <View style={styles.typeSelector}>
                <Text style={styles.inputLabel}>Loại giảm giá:</Text>
                <View style={styles.typeSelectorButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorButton,
                      currentVoucher.discount_type === 'percent' && styles.typeSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentVoucher({ ...currentVoucher, discount_type: 'percent' })}
                  >
                    <Text
                      style={[
                        styles.typeSelectorButtonText,
                        currentVoucher.discount_type === 'percent' && styles.typeSelectorButtonTextActive,
                      ]}
                    >
                      Phần trăm (%)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorButton,
                      currentVoucher.discount_type === 'fixed' && styles.typeSelectorButtonActive,
                    ]}
                    onPress={() => setCurrentVoucher({ ...currentVoucher, discount_type: 'fixed' })}
                  >
                    <Text
                      style={[
                        styles.typeSelectorButtonText,
                        currentVoucher.discount_type === 'fixed' && styles.typeSelectorButtonTextActive,
                      ]}
                    >
                      Cố định (VNĐ)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder={
                  currentVoucher.discount_type === 'percent'
                    ? 'Giá trị giảm (%) *'
                    : 'Giá trị giảm (VNĐ) *'
                }
                keyboardType="numeric"
                value={currentVoucher.discount_value.toString()}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, discount_value: parseFloat(text) || 0 })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Giá trị đơn hàng tối thiểu (VNĐ)"
                keyboardType="numeric"
                value={currentVoucher.min_order_amount?.toString() || '0'}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, min_order_amount: parseFloat(text) || 0 })
                }
              />
              <View style={styles.dateRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Ngày bắt đầu:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={currentVoucher.start_date}
                    onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, start_date: text })}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Ngày kết thúc:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={currentVoucher.end_date}
                    onChangeText={(text) => setCurrentVoucher({ ...currentVoucher, end_date: text })}
                  />
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Sử dụng tối đa (0 = không giới hạn)"
                keyboardType="numeric"
                value={currentVoucher.limit?.toString() || '0'}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, limit: parseInt(text) || 0 })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Sử dụng tối đa mỗi người (0 = không giới hạn)"
                keyboardType="numeric"
                value={currentVoucher.max_uses_per_user?.toString() || '0'}
                onChangeText={(text) =>
                  setCurrentVoucher({ ...currentVoucher, max_uses_per_user: parseInt(text) || 0 })
                }
              />
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Trạng thái:</Text>
                <Switch
                  value={currentVoucher.status === 'active'}
                  onValueChange={(value) =>
                    setCurrentVoucher({ ...currentVoucher, status: value ? 'active' : 'inactive' })
                  }
                />
                <Text style={styles.switchLabel}>
                  {currentVoucher.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </Text>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetCurrentVoucher();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateVoucher}>
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
              Bạn có chắc chắn muốn xóa voucher này không? Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setVoucherToDelete(null);
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
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  filterRow: {
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#FF004C',
    borderColor: '#FF004C',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 15,
  },
  voucherCard: {
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
  voucherInfo: {
    flex: 1,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusExpired: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  voucherDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  voucherDetails: {
    marginTop: 5,
  },
  voucherValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF004C',
    marginBottom: 5,
  },
  voucherMinOrder: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  voucherDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  voucherUsage: {
    fontSize: 12,
    color: '#666',
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  generateButton: {
    backgroundColor: '#FF004C',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  typeSelector: {
    marginBottom: 15,
  },
  typeSelectorButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeSelectorButtonActive: {
    backgroundColor: '#FF004C',
    borderColor: '#FF004C',
  },
  typeSelectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeSelectorButtonTextActive: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
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
});

export default AdminVouchers;
