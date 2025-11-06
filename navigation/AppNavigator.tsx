import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// User Screens
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

// Admin Screens
import AdminDashboard from '../screens/AdminDashboard';
import AdminProducts from '../screens/AdminProducts';
import AdminOrders from '../screens/AdminOrders';
import AdminCategories from '../screens/AdminCategories';
import AdminUsers from '../screens/AdminUsers';
import AdminVouchers from '../screens/AdminVouchers';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  
  // User Main Tabs
  MainTabs: undefined;
  
  // User Screens
  Home: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Profile: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Checkout: undefined;
  
  // Admin Screens
  AdminDashboard: undefined;
  AdminProducts: undefined;
  AdminOrders: undefined;
  AdminCategories: undefined;
  AdminUsers: undefined;
  AdminVouchers: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF004C',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🛒</Text>,
          tabBarLabel: 'Giỏ hàng',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
          tabBarLabel: 'Tài khoản',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null; // Hoặc loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user?.role_name === 'admin' ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="AdminProducts" component={AdminProducts} />
            <Stack.Screen name="AdminOrders" component={AdminOrders} />
            <Stack.Screen name="AdminCategories" component={AdminCategories} />
            <Stack.Screen name="AdminUsers" component={AdminUsers} />
            <Stack.Screen name="AdminVouchers" component={AdminVouchers} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderDetail" component={OrdersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
