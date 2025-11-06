import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { orderAPI, menuItemAPI, userAPI } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type AdminDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;

const AdminDashboard = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderAPI.getOrderAll(),
        menuItemAPI.getAll(),
        userAPI.getAllUsers(),
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;
      const users = usersRes.data.users;

      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalUsers = users.length;
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const revenue = orders
        .filter((o: any) => o.payment_status === 'paid')
        .reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);

      setStats({
        totalOrders,
        totalProducts,
        totalUsers,
        pendingOrders,
        revenue,
      });

      // Lấy 5 đơn hàng gần đây nhất
      const sortedOrders = orders.sort((a: any, b: any) => b.id - a.id);
      setRecentOrders(sortedOrders.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
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

  const menuItems = [
    {
      icon: '📦',
      title: 'Quản lý sản phẩm',
      subtitle: `${stats.totalProducts} sản phẩm`,
      color: '#FF6B6B',
      onPress: () => navigation.navigate('AdminProducts'),
    },
    {
      icon: '📋',
      title: 'Quản lý đơn hàng',
      subtitle: `${stats.totalOrders} đơn hàng`,
      color: '#4ECDC4',
      onPress: () => navigation.navigate('AdminOrders'),
    },
    {
      icon: '📁',
      title: 'Quản lý danh mục',
      subtitle: 'Danh mục sản phẩm',
      color: '#95E1D3',
      onPress: () => navigation.navigate('AdminCategories'),
    },
    {
      icon: '👥',
      title: 'Quản lý người dùng',
      subtitle: `${stats.totalUsers} người dùng`,
      color: '#F38181',
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      icon: '🎫',
      title: 'Quản lý Vouchers',
      subtitle: 'Mã giảm giá',
      color: '#A8E6CF',
      onPress: () => navigation.navigate('AdminVouchers'),
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF004C" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
          <View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.adminName}>{user?.fullname || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FF6B6B' }]}>
            <View style={styles.statCardContent}>
              <Text style={styles.statIcon}>📦</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stats.totalOrders}</Text>
                <Text style={styles.statLabel}>Tổng đơn hàng</Text>
              </View>
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>+12% so với tháng trước</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
            <View style={styles.statCardContent}>
              <Text style={styles.statIcon}>🍽️</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stats.totalProducts}</Text>
                <Text style={styles.statLabel}>Sản phẩm</Text>
              </View>
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>Đang hoạt động</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFD93D' }]}>
            <View style={styles.statCardContent}>
              <Text style={styles.statIcon}>⏳</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stats.pendingOrders}</Text>
                <Text style={styles.statLabel}>Chờ xử lý</Text>
              </View>
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>Cần xử lý ngay</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#95E1D3' }]}>
            <View style={styles.statCardContent}>
              <Text style={styles.statIcon}>💰</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>
                  {(stats.revenue / 1000000).toFixed(1)}M
                </Text>
                <Text style={styles.statLabel}>Doanh thu</Text>
              </View>
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>Tháng này</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chức năng quản lý</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuCard}
                onPress={item.onPress}
              >
                <LinearGradient
                  colors={[item.color, `${item.color}CC`]}
                  style={styles.menuCardGradient}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          {recentOrders.length > 0 ? (
            recentOrders.slice(0, 5).map((order: any) => (
              <View key={order.id} style={styles.recentOrderCard}>
                <View style={styles.recentOrderHeader}>
                  <Text style={styles.recentOrderId}>#{order.id}</Text>
                  <Text style={styles.recentOrderStatus}>
                    {translateStatus(order.status)}
                  </Text>
                </View>
                <Text style={styles.recentOrderCustomer}>
                  {order.User?.fullname || 'Khách hàng'}
                </Text>
                <Text style={styles.recentOrderTotal}>
                  {(order.total_price || 0).toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          )}
        </View>
      </ScrollView>
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
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  adminName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 36,
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statFooterText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 20,
  },
  recentOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentOrderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentOrderStatus: {
    fontSize: 12,
    color: '#666',
  },
  recentOrderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF004C',
  },
  recentOrderCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
});

export default AdminDashboard;
