import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    img?: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: { id: number; name: string; price: number; image?: string; img?: string }, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadCart = async () => {
    if (!user?.id) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.getCart(user.id);
      
      if (response.data?.items) {
        const cartItems: CartItem[] = response.data.items.map((item: any) => ({
          product: {
            id: item.menu_item_id,
            name: item.MenuItem?.name || 'Unknown Product',
            price: item.price || 0,
            image: item.MenuItem?.img || item.MenuItem?.image || '',
            img: item.MenuItem?.img || item.MenuItem?.image || '',
          },
          quantity: item.quantity || 1,
        }));
        setItems(cartItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user?.id]);

  const addToCart = async (product: { id: number; name: string; price: number; image?: string; img?: string }, quantity: number = 1) => {
    if (!user?.id) {
      throw new Error('User not logged in');
    }

    try {
      await cartAPI.addToCart(user.id, {
        menuItemId: product.id,
        quantity: quantity,
      });
      await loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user?.id) {
      return;
    }

    try {
      await cartAPI.removeFromCart(user.id, productId);
      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user?.id) {
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      await cartAPI.updateCartItem(user.id, productId, { quantity });
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user?.id) {
      return;
    }

    try {
      await cartAPI.clearCart(user.id);
      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotal = (): number => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getItemCount = (): number => {
    return items.length; // Số sản phẩm khác nhau trong giỏ hàng
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

