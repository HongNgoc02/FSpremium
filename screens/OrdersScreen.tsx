import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

interface OrderItem {
  id: number;
  menu_item_Id: number;
  quantity: number;
  price: number;
  total_price: number;
  MenuItem?: {
    id: number;
    name: string;
    img?: string;
    image?: string;
  };
}

interface Order {
  id: number;
  user_Id: number;
  total_price: number;
  status: string;
  payment_status?: string;
  shipping_address?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  created_at?: string;
  OrderDetails?: OrderItem[];
}

const OrdersScreen = () => {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await orderAPI.getOrders(user.id);
      let ordersData: Order[] = [];

      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      }

      // Load order details and payment info for each order
      for (let order of ordersData) {
        try {
          const detailsResponse = await orderAPI.getOrderDetails(order.id);
          if (detailsResponse?.data) {
            order.OrderDetails = detailsResponse.data;
          }

          const paymentResponse = await paymentAPI.getPaymentByOrderId(order.id);
          if (paymentResponse?.data) {
            order.payment_status = paymentResponse.data.status;
          }
        } catch (error) {
          console.error('Error loading order details:', error);
        }
      }

      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return '#4CAF50';
      case 'delivering':
      case 'shipped':
        return '#2196F3';
      case 'preparing':
      case 'processing':
        return '#FF9800';
      case 'confirmed':
        return '#9C27B0';
      case 'pending':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'Đã hoàn thành';
      case 'delivering':
      case 'shipped':
        return 'Đang giao';
      case 'preparing':
      case 'processing':
        return 'Đang chuẩn bị';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.OrderDetails && item.OrderDetails.length > 0 && (
        <View style={styles.orderItems}>
          {item.OrderDetails.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.orderItemRow}>
              <Image
                source={{ uri: orderItem.MenuItem?.img || orderItem.MenuItem?.image || '' }}
                style={styles.orderItemImage}
              />
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{orderItem.MenuItem?.name || 'Unknown'}</Text>
                <Text style={styles.orderItemQuantity}>x{orderItem.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>
                {orderItem.total_price.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          ))}
          {item.OrderDetails.length > 2 && (
            <Text style={styles.moreItems}>+{item.OrderDetails.length - 2} sản phẩm khác</Text>
          )}
        </View>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          {formatDate(item.created_at)}
        </Text>
        <Text style={styles.orderTotal}>
          Tổng: {item.total_price.toLocaleString('vi-VN')} đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF004C" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadOrders}
        />
      )}

      {/* Order Details Modal */}
      <Modal visible={showOrderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mã đơn hàng:</Text>
                  <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedOrder.status)}</Text>
                  </View>
                </View>

                {selectedOrder.payment_status && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Thanh toán:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Text>
                  </View>
                )}

                {selectedOrder.OrderDetails && selectedOrder.OrderDetails.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Sản phẩm:</Text>
                    {selectedOrder.OrderDetails.map((item, index) => (
                      <View key={index} style={styles.orderDetailItem}>
                        <Image
                          source={{ uri: item.MenuItem?.img || item.MenuItem?.image || '' }}
                          style={styles.detailItemImage}
                        />
                        <View style={styles.detailItemInfo}>
                          <Text style={styles.detailItemName}>{item.MenuItem?.name || 'Unknown'}</Text>
                          <Text style={styles.detailItemQuantity}>Số lượng: {item.quantity}</Text>
                          <Text style={styles.detailItemPrice}>
                            {item.total_price.toLocaleString('vi-VN')} đ
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {selectedOrder.shipping_address && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Địa chỉ giao hàng:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.shipping_address}</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tổng tiền:</Text>
                  <Text style={styles.totalPrice}>
                    {selectedOrder.total_price.toLocaleString('vi-VN')} đ
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày đặt:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.created_at)}</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOrderModal(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF004C',
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF004C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#FF004C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    color: '#FF004C',
    fontWeight: 'bold',
  },
  orderDetailItem: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  detailItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailItemPrice: {
    fontSize: 16,
    color: '#FF004C',
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  closeButton: {
    backgroundColor: '#FF004C',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
