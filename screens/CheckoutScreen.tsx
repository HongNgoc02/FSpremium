import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { userAPI, orderAPI, paymentAPI } from '../services/api';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { items, getTotal, clearCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const [isPlacing, setIsPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '',
  });

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.getProfile(user.id);
      const userData = response.data;
      
      setShippingInfo({
        fullName: userData.fullname || '',
        phone: userData.phone_number || '',
        address: userData.address || '',
        email: userData.email || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để tiếp tục');
      return;
    }

    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin giao hàng');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }

    setIsPlacing(true);

    try {
      const total = getTotal();

      // Create order
      const orderData = {
        user_Id: user.id,
        total_price: total,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: shippingInfo.address,
        full_name: shippingInfo.fullName,
        phone_number: shippingInfo.phone,
        email: shippingInfo.email,
        payment_method: 'cashOnDelivery',
      };

      const orderResponse = await orderAPI.createOrder(orderData);
      
      if (!orderResponse.data?.order) {
        throw new Error('Không thể tạo đơn hàng');
      }

      const orderId = orderResponse.data.order.id;

      // Create order details
      for (const item of items) {
        await orderAPI.createOrderDetails({
          order_Id: orderId,
          menu_item_Id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          total_price: item.product.price * item.quantity,
        });
      }

      // Create payment
      await paymentAPI.createPayment({
        order_Id: orderId,
        user_Id: user.id,
        total_payment: total,
        method: 'cashOnDelivery',
        status: 'pending',
      });

      // Clear cart
      await clearCart();

      Alert.alert(
        'Thành công',
        `Đơn hàng #${orderId} của bạn đã được đặt thành công!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Orders');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại sau.'
      );
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading || cartLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF004C" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={shippingInfo.fullName}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={shippingInfo.email}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
              value={shippingInfo.phone}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ giao hàng"
              multiline
              numberOfLines={3}
              value={shippingInfo.address}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
            />
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>{item.product.name}</Text>
              <Text style={styles.orderItemDetail}>
                {item.quantity} x {item.product.price.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Tổng cộng:</Text>
            <Text style={styles.finalTotalValue}>
              {getTotal().toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>
      </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, isPlacing && styles.checkoutButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  finalTotal: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF004C',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  checkoutButton: {
    backgroundColor: '#FF004C',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CheckoutScreen;

