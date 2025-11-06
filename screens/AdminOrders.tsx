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
import { orderAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type AdminOrdersNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminOrders'>;

interface Order {
  id: number;
  user_Id: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  User?: {
    fullname: string;
    phone_number: string;
    email: string;
  };
  Voucher?: {
    code: string;
  };
}

interface OrderDetail {
  id: number;
  menu_item_Id: number;
  quantity: number;
  subtotal: number;
  MenuItem?: {
    name: string;
    price: number;
  };
}

const AdminOrders = () => {
  const navigation = useNavigation<AdminOrdersNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderAPI.getOrderAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      const response = await orderAPI.getOrderDetails(orderId);
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: any = {
      pending: '⏳ Chờ xử lý',
      processing: '🔄 Đang xử lý',
      shipped: '🚚 Đã gửi hàng',
      delivered: '✅ Đã giao hàng',
      cancelled: '❌ Đã hủy',
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: any = {
      pending: '#F59E0B',
      processing: '#3B82F6',
      shipped: '#8B5CF6',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };
    return colorMap[status?.toLowerCase()] || '#6B7280';
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        String(order.id).includes(searchQuery) ||
        order.User?.fullname?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !selectedStatus || order.status === selectedStatus;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orderDate = new Date(order.created_at);
        
        if (dateRange === 'today') {
          matchesDate = orderDate.toDateString() === today.toDateString();
        } else if (dateRange === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = orderDate.toDateString() === yesterday.toDateString();
        } else if (dateRange === 'week') {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          matchesDate = orderDate >= weekStart;
        } else if (dateRange === 'month') {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          matchesDate = orderDate >= monthStart;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderAPI.updateOrder(orderId, { status: newStatus });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
      setShowStatusModal(false);
      setOrderToUpdate(null);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleUpdatePayment = async (orderId: number, paymentStatus: string) => {
    try {
      await orderAPI.updateOrder(orderId, { payment_status: paymentStatus });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái thanh toán');
      setShowPaymentModal(false);
      setOrderToUpdate(null);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thanh toán');
    }
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    await loadOrderDetails(order.id);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN').format(numPrice) + ' VNĐ';
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
          <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
          <View style={{ width: 80 }} />
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo mã đơn hàng hoặc tên người dùng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Trạng thái:</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.statusChip, !selectedStatus && styles.statusChipActive]}
                  onPress={() => setSelectedStatus('')}
                >
                  <Text style={[styles.statusChipText, !selectedStatus && styles.statusChipTextActive]}>
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusChip, selectedStatus === status && styles.statusChipActive]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text
                      style={[styles.statusChipText, selectedStatus === status && styles.statusChipTextActive]}
                    >
                      {translateStatus(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Thời gian:</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['all', 'today', 'yesterday', 'week', 'month'].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[styles.dateChip, dateRange === range && styles.dateChipActive]}
                    onPress={() => setDateRange(range)}
                  >
                    <Text style={[styles.dateChipText, dateRange === range && styles.dateChipTextActive]}>
                      {range === 'all'
                        ? 'Tất cả'
                        : range === 'today'
                        ? 'Hôm nay'
                        : range === 'yesterday'
                        ? 'Hôm qua'
                        : range === 'week'
                        ? 'Tuần này'
                        : 'Tháng này'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  <Text style={styles.orderCustomer}>
                    {order.User?.fullname || 'Khách hàng'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{translateStatus(order.status)}</Text>
                </View>
              </View>

              <View style={styles.orderInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tổng tiền:</Text>
                  <Text style={styles.infoValue}>{formatPrice(order.total_price)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thanh toán:</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setOrderToUpdate(order);
                      setShowPaymentModal(true);
                    }}
                  >
                    <View
                      style={[
                        styles.paymentBadge,
                        order.payment_status === 'paid' ? styles.paymentBadgePaid : styles.paymentBadgeUnpaid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentText,
                          order.payment_status === 'paid' ? styles.paymentTextPaid : styles.paymentTextUnpaid,
                        ]}
                      >
                        {order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleViewDetails(order)}
                >
                  <Text style={styles.detailsButtonText}>📋 Chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => {
                    setOrderToUpdate(order);
                    setShowStatusModal(true);
                  }}
                >
                  <Text style={styles.statusButtonText}>✏️ Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
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

      {/* Update Status Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              setShowStatusModal(false);
              setOrderToUpdate(null);
            }}
          />
          <View style={styles.filterModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Cập nhật trạng thái</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowStatusModal(false);
                  setOrderToUpdate(null);
                }}
              >
                <Text style={styles.filterModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {orderToUpdate && (
              <View style={styles.filterModalList}>
                <Text style={styles.filterModalSubtitle}>Đơn hàng #{orderToUpdate.id}</Text>
                <Text style={styles.filterModalInstruction}>Chọn trạng thái mới:</Text>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    orderToUpdate.status === 'pending' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleUpdateStatus(orderToUpdate.id, 'pending')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      orderToUpdate.status === 'pending' && styles.statusOptionTextActive,
                    ]}
                  >
                    ⏳ Chờ xử lý
                  </Text>
                  {orderToUpdate.status === 'pending' && <Text style={styles.filterCheckmark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    orderToUpdate.status === 'processing' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleUpdateStatus(orderToUpdate.id, 'processing')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      orderToUpdate.status === 'processing' && styles.statusOptionTextActive,
                    ]}
                  >
                    🔄 Đang xử lý
                  </Text>
                  {orderToUpdate.status === 'processing' && (
                    <Text style={styles.filterCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    orderToUpdate.status === 'shipped' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleUpdateStatus(orderToUpdate.id, 'shipped')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      orderToUpdate.status === 'shipped' && styles.statusOptionTextActive,
                    ]}
                  >
                    🚚 Đã gửi hàng
                  </Text>
                  {orderToUpdate.status === 'shipped' && <Text style={styles.filterCheckmark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    orderToUpdate.status === 'delivered' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleUpdateStatus(orderToUpdate.id, 'delivered')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      orderToUpdate.status === 'delivered' && styles.statusOptionTextActive,
                    ]}
                  >
                    ✅ Đã giao hàng
                  </Text>
                  {orderToUpdate.status === 'delivered' && (
                    <Text style={styles.filterCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    styles.statusOptionCancel,
                    orderToUpdate.status === 'cancelled' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleUpdateStatus(orderToUpdate.id, 'cancelled')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      styles.statusOptionTextCancel,
                      orderToUpdate.status === 'cancelled' && styles.statusOptionTextActive,
                    ]}
                  >
                    ❌ Đã hủy
                  </Text>
                  {orderToUpdate.status === 'cancelled' && <Text style={styles.filterCheckmark}>✓</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Update Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              setShowPaymentModal(false);
              setOrderToUpdate(null);
            }}
          />
          <View style={styles.filterModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Cập nhật thanh toán</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPaymentModal(false);
                  setOrderToUpdate(null);
                }}
              >
                <Text style={styles.filterModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {orderToUpdate && (
              <View style={styles.filterModalList}>
                <Text style={styles.filterModalSubtitle}>Đơn hàng #{orderToUpdate.id}</Text>
                <Text style={styles.filterModalInstruction}>Chọn trạng thái thanh toán:</Text>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    orderToUpdate.payment_status === 'paid' && styles.paymentOptionActive,
                  ]}
                  onPress={() => handleUpdatePayment(orderToUpdate.id, 'paid')}
                >
                  <Text
                    style={[
                      styles.paymentOptionText,
                      orderToUpdate.payment_status === 'paid' && styles.paymentOptionTextActive,
                    ]}
                  >
                    ✅ Đã thanh toán
                  </Text>
                  {orderToUpdate.payment_status === 'paid' && (
                    <Text style={styles.filterCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    orderToUpdate.payment_status === 'unpaid' && styles.paymentOptionActive,
                  ]}
                  onPress={() => handleUpdatePayment(orderToUpdate.id, 'unpaid')}
                >
                  <Text
                    style={[
                      styles.paymentOptionText,
                      orderToUpdate.payment_status === 'unpaid' && styles.paymentOptionTextActive,
                    ]}
                  >
                    ⏳ Chưa thanh toán
                  </Text>
                  {orderToUpdate.payment_status === 'unpaid' && (
                    <Text style={styles.filterCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng #{selectedOrder?.id}</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selectedOrder && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Khách hàng:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.User?.fullname || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.User?.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Số điện thoại:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.User?.phone_number || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tổng tiền:</Text>
                    <Text style={styles.detailValue}>{formatPrice(selectedOrder.total_price)}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Mã voucher:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.Voucher?.code || 'Không có'}
                    </Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                    <Text style={styles.detailValue}>{translateStatus(selectedOrder.status)}</Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Thanh toán:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Text>
                  </View>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ngày đặt:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedOrder.created_at)}</Text>
                  </View>

                  <Text style={styles.itemsTitle}>Sản phẩm:</Text>
                  {orderDetails.length > 0 ? (
                    orderDetails.map((item) => (
                      <View key={item.id} style={styles.orderItem}>
                        <Text style={styles.itemName}>{item.MenuItem?.name || 'N/A'}</Text>
                        <Text style={styles.itemQuantity}>x {item.quantity}</Text>
                        <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyItems}>Không có sản phẩm</Text>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Đóng</Text>
            </TouchableOpacity>
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
    gap: 10,
  },
  filterItem: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  pickerContainer: {
    marginTop: 5,
  },
  statusChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusChipActive: {
    backgroundColor: '#FF004C',
    borderColor: '#FF004C',
  },
  statusChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  dateChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateChipActive: {
    backgroundColor: '#FF004C',
    borderColor: '#FF004C',
  },
  dateChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paidText: {
    color: '#10B981',
  },
  unpaidText: {
    color: '#F59E0B',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentBadgePaid: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  paymentBadgeUnpaid: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentTextPaid: {
    color: '#10B981',
  },
  paymentTextUnpaid: {
    color: '#F59E0B',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#FF004C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  filterModalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  filterModalInstruction: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  filterModalList: {
    paddingBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  statusOptionActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF004C',
  },
  statusOptionCancel: {
    borderColor: '#DC2626',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#666',
  },
  statusOptionTextActive: {
    color: '#FF004C',
    fontWeight: '600',
  },
  statusOptionTextCancel: {
    color: '#DC2626',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  paymentOptionActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF004C',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#666',
  },
  paymentOptionTextActive: {
    color: '#FF004C',
    fontWeight: '600',
  },
  filterCheckmark: {
    fontSize: 18,
    color: '#FF004C',
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF004C',
  },
  emptyItems: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
  closeModalButton: {
    backgroundColor: '#FF004C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminOrders;
