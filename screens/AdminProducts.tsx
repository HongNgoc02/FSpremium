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
  Image,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { menuItemAPI, categoryAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type AdminProductsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminProducts'>;

interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  description?: string;
  cat_Id: number;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

const AdminProducts = () => {
  const navigation = useNavigation<AdminProductsNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'cat_Id'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    img: '',
    description: '',
    cat_Id: categories[0]?.id || 1,
    status: 'available',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        menuItemAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0 && !currentProduct.cat_Id) {
        setCurrentProduct({ ...currentProduct, cat_Id: categoriesRes.data[0].id });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.cat_Id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      } else {
        return a.cat_Id - b.cat_Id;
      }
    });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const resetCurrentProduct = () => {
    setCurrentProduct({
      id: 0,
      name: '',
      price: 0,
      img: '',
      description: '',
      cat_Id: categories[0]?.id || 1,
      status: 'available',
    });
  };

  const handleAddProduct = async () => {
    if (!currentProduct.name || !currentProduct.price || !currentProduct.img) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await menuItemAPI.create(currentProduct);
      Alert.alert('Thành công', 'Đã thêm sản phẩm');
      setShowAddModal(false);
      resetCurrentProduct();
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!currentProduct.name || !currentProduct.price || !currentProduct.img) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await menuItemAPI.update(currentProduct.id, currentProduct);
      Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
      setShowEditModal(false);
      resetCurrentProduct();
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm');
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await menuItemAPI.delete(productToDelete);
      Alert.alert('Thành công', 'Đã xóa sản phẩm');
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
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
      <LinearGradient colors={['#FF004C', '#FF3366']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý sản phẩm</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Danh mục:</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.filterButtonText}>
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name || 'Tất cả'
                  : 'Tất cả'}
              </Text>
              <Text style={styles.filterIcon}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Sắp xếp:</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.filterButtonText}>
                {sortBy === 'name' ? 'Tên' : sortBy === 'price' ? 'Giá' : 'Danh mục'}
              </Text>
              <Text style={styles.filterIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.img }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{getCategoryName(product.cat_Id)}</Text>
                <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusBadge,
                      product.status === 'available' ? styles.statusAvailable : styles.statusUnavailable,
                    ]}
                  >
                    {product.status === 'available' ? 'Có sẵn' : 'Hết hàng'}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditProduct(product)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteProduct(product.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
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

      {/* Category Filter Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.filterModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Chọn danh mục</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.filterModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterModalList}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  !selectedCategory && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setSelectedCategory('');
                  setShowCategoryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    !selectedCategory && styles.filterOptionTextActive,
                  ]}
                >
                  Tất cả
                </Text>
                {!selectedCategory && <Text style={styles.filterCheckmark}>✓</Text>}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterOption,
                    selectedCategory === cat.id && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedCategory === cat.id && styles.filterOptionTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                  {selectedCategory === cat.id && (
                    <Text style={styles.filterCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sort Filter Modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.filterModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={styles.filterModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterModalList}>
              <TouchableOpacity
                style={[styles.filterOption, sortBy === 'name' && styles.filterOptionActive]}
                onPress={() => {
                  setSortBy('name');
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === 'name' && styles.filterOptionTextActive,
                  ]}
                >
                  Tên
                </Text>
                {sortBy === 'name' && <Text style={styles.filterCheckmark}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, sortBy === 'price' && styles.filterOptionActive]}
                onPress={() => {
                  setSortBy('price');
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === 'price' && styles.filterOptionTextActive,
                  ]}
                >
                  Giá
                </Text>
                {sortBy === 'price' && <Text style={styles.filterCheckmark}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, sortBy === 'cat_Id' && styles.filterOptionActive]}
                onPress={() => {
                  setSortBy('cat_Id');
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === 'cat_Id' && styles.filterOptionTextActive,
                  ]}
                >
                  Danh mục
                </Text>
                {sortBy === 'cat_Id' && <Text style={styles.filterCheckmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm sản phẩm mới</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Tên sản phẩm"
                value={currentProduct.name}
                onChangeText={(text) => setCurrentProduct({ ...currentProduct, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Giá"
                keyboardType="numeric"
                value={currentProduct.price.toString()}
                onChangeText={(text) =>
                  setCurrentProduct({ ...currentProduct, price: parseFloat(text) || 0 })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={currentProduct.img}
                onChangeText={(text) => setCurrentProduct({ ...currentProduct, img: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                numberOfLines={3}
                value={currentProduct.description}
                onChangeText={(text) => setCurrentProduct({ ...currentProduct, description: text })}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Danh mục:</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Chọn danh mục',
                      '',
                      [
                        ...categories.map((cat) => ({
                          text: cat.name,
                          onPress: () => setCurrentProduct({ ...currentProduct, cat_Id: cat.id }),
                        })),
                        { text: 'Hủy', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {categories.find((c) => c.id === currentProduct.cat_Id)?.name || 'Chọn danh mục'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Trạng thái:</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Chọn trạng thái',
                      '',
                      [
                        {
                          text: 'Có sẵn',
                          onPress: () => setCurrentProduct({ ...currentProduct, status: 'available' }),
                        },
                        {
                          text: 'Hết hàng',
                          onPress: () => setCurrentProduct({ ...currentProduct, status: 'unavailable' }),
                        },
                        { text: 'Hủy', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {currentProduct.status === 'available' ? 'Có sẵn' : 'Hết hàng'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetCurrentProduct();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddProduct}>
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
            <Text style={styles.modalTitle}>Chỉnh sửa sản phẩm</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Tên sản phẩm"
                value={currentProduct.name}
                onChangeText={(text) => setCurrentProduct({ ...currentProduct, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Giá"
                keyboardType="numeric"
                value={currentProduct.price.toString()}
                onChangeText={(text) =>
                  setCurrentProduct({ ...currentProduct, price: parseFloat(text) || 0 })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={currentProduct.img}
                onChangeText={(text) => setCurrentProduct({ ...currentProduct, img: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                numberOfLines={3}
                value={currentProduct.description}
                onChangeText={(text) => setCurrentProduct({ ...currentProduct, description: text })}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Danh mục:</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Chọn danh mục',
                      '',
                      [
                        ...categories.map((cat) => ({
                          text: cat.name,
                          onPress: () => setCurrentProduct({ ...currentProduct, cat_Id: cat.id }),
                        })),
                        { text: 'Hủy', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {categories.find((c) => c.id === currentProduct.cat_Id)?.name || 'Chọn danh mục'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Trạng thái:</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Chọn trạng thái',
                      '',
                      [
                        {
                          text: 'Có sẵn',
                          onPress: () => setCurrentProduct({ ...currentProduct, status: 'available' }),
                        },
                        {
                          text: 'Hết hàng',
                          onPress: () => setCurrentProduct({ ...currentProduct, status: 'unavailable' }),
                        },
                        { text: 'Hủy', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {currentProduct.status === 'available' ? 'Có sẵn' : 'Hết hàng'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetCurrentProduct();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProduct}>
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
              Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
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
    flexDirection: 'row',
    gap: 10,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  filterIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterModalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  filterModalList: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterOptionActive: {
    backgroundColor: '#FFF5F5',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#FF004C',
    fontWeight: '600',
  },
  filterCheckmark: {
    fontSize: 18,
    color: '#FF004C',
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#FF004C',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF004C',
    marginBottom: 5,
  },
  statusContainer: {
    marginTop: 5,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusAvailable: {
    backgroundColor: '#D1FAE5',
    color: '#10B981',
  },
  statusUnavailable: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'center',
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
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
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

export default AdminProducts;
