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
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { categoryAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type AdminCategoriesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminCategories'>;

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

const AdminCategories = () => {
  const navigation = useNavigation<AdminCategoriesNavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'name' | 'description' | 'id'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category>({
    id: 0,
    name: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const sortTable = (column: 'name' | 'description' | 'id') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredCategories = categories
    .filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : valueA < valueB ? 1 : -1;
      }
    });

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;

  const resetCurrentCategory = () => {
    setCurrentCategory({
      id: 0,
      name: '',
      description: '',
      image: '',
    });
  };

  const handleAddCategory = async () => {
    if (!currentCategory.name) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    try {
      await categoryAPI.create(currentCategory);
      Alert.alert('Thành công', 'Đã thêm danh mục');
      setShowAddModal(false);
      resetCurrentCategory();
      loadCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm danh mục');
    }
  };

  const handleEditCategory = async (category: Category) => {
    try {
      const response = await categoryAPI.getById(category.id);
      setCurrentCategory({
        id: response.data.id,
        name: response.data.name,
        description: response.data.description || '',
        image: response.data.image || '',
      });
      setShowEditModal(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin danh mục');
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory.name) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    try {
      await categoryAPI.update(currentCategory.id, currentCategory);
      Alert.alert('Thành công', 'Đã cập nhật danh mục');
      setShowEditModal(false);
      resetCurrentCategory();
      loadCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật danh mục');
    }
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryAPI.delete(categoryToDelete);
      Alert.alert('Thành công', 'Đã xóa danh mục');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa danh mục');
    }
  };

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
          <Text style={styles.headerTitle}>Quản lý danh mục</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm danh mục..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paginatedCategories.length > 0 ? (
          paginatedCategories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryImageContainer}>
                {category.image ? (
                  <Image source={{ uri: category.image }} style={styles.categoryImage} />
                ) : (
                  <View style={styles.categoryImagePlaceholder}>
                    <Text style={styles.categoryImageIcon}>🍽️</Text>
                  </View>
                )}
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {category.description || 'Không có mô tả'}
                </Text>
                <Text style={styles.categoryId}>ID: {category.id}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditCategory(category)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(category.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có danh mục nào</Text>
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
            <Text style={styles.modalTitle}>Thêm danh mục mới</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Tên danh mục *"
                value={currentCategory.name}
                onChangeText={(text) => setCurrentCategory({ ...currentCategory, name: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                numberOfLines={3}
                value={currentCategory.description}
                onChangeText={(text) =>
                  setCurrentCategory({ ...currentCategory, description: text })
                }
              />
              {/* <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={currentCategory.image}
                onChangeText={(text) => setCurrentCategory({ ...currentCategory, image: text })}
              /> */}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetCurrentCategory();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCategory}>
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
            <Text style={styles.modalTitle}>Chỉnh sửa danh mục</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Tên danh mục *"
                value={currentCategory.name}
                onChangeText={(text) => setCurrentCategory({ ...currentCategory, name: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                numberOfLines={3}
                value={currentCategory.description}
                onChangeText={(text) =>
                  setCurrentCategory({ ...currentCategory, description: text })
                }
              />
              {/* <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={currentCategory.image}
                onChangeText={(text) => setCurrentCategory({ ...currentCategory, image: text })}
              /> */}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetCurrentCategory();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateCategory}>
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
              Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
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
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  content: {
    padding: 15,
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
  categoryCard: {
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
  categoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 15,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImageIcon: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  categoryId: {
    fontSize: 12,
    color: '#999',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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

export default AdminCategories;

