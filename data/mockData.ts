// Mock data cho đồ ăn với ảnh thật từ Unsplash
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
  };
}

export const categories: Category[] = [
  { id: '1', name: 'Món chính', icon: '🍽️' },
  { id: '2', name: 'Đồ uống', icon: '🥤' },
  { id: '3', name: 'Tráng miệng', icon: '🍰' },
  { id: '4', name: 'Đồ ăn nhanh', icon: '🍔' },
  { id: '5', name: 'Đồ ăn vặt', icon: '🍿' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Phở Bò Đặc Biệt',
    description: 'Phở bò truyền thống với thịt bò tái, gân, sách và bò viên, nước dùng đậm đà',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    category: '1',
    rating: 4.8,
    reviews: 234,
    stock: 50,
  },
  {
    id: '2',
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả đậm đà với thịt nướng thơm lừng, nước mắm chua ngọt đặc trưng',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
    category: '1',
    rating: 4.9,
    reviews: 189,
    stock: 40,
  },
  {
    id: '3',
    name: 'Bánh Mì Thịt Nướng',
    description: 'Bánh mì giòn tan với thịt nướng, pate, chả lụa và rau củ tươi ngon',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1576717585964-4fa8e0eb5f23?w=800&h=600&fit=crop',
    category: '4',
    rating: 4.7,
    reviews: 456,
    stock: 100,
  },
  {
    id: '4',
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê phin truyền thống với sữa đặc, đá viên mát lạnh',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
    category: '2',
    rating: 4.8,
    reviews: 678,
    stock: 200,
  },
  {
    id: '5',
    name: 'Chè Thái',
    description: 'Chè Thái mát lạnh với nhiều loại topping: thạch, mít, dừa, sữa dừa',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd028d483?w=800&h=600&fit=crop',
    category: '3',
    rating: 4.6,
    reviews: 312,
    stock: 80,
  },
  {
    id: '6',
    name: 'Bánh Tráng Trộn',
    description: 'Bánh tráng trộn cay ngọt với nhiều topping đặc biệt: trứng cút, khô bò, xoài',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1586380951233-e41c42eb6f63?w=800&h=600&fit=crop',
    category: '5',
    rating: 4.5,
    reviews: 567,
    stock: 150,
  },
  {
    id: '7',
    name: 'Cơm Tấm Sườn Nướng',
    description: 'Cơm tấm thơm dẻo với sườn nướng mật ong đậm đà, bì, chả trứng',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
    category: '1',
    rating: 4.7,
    reviews: 234,
    stock: 60,
  },
  {
    id: '8',
    name: 'Trà Sữa Trân Châu',
    description: 'Trà sữa thơm ngon với trân châu dai giòn, đường đen, đá viên',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1563729784474-d77d0e5d8442?w=800&h=600&fit=crop',
    category: '2',
    rating: 4.9,
    reviews: 890,
    stock: 120,
  },
  {
    id: '9',
    name: 'Bánh Xèo',
    description: 'Bánh xèo giòn tan với nhân tôm thịt, giá đỗ, rau sống tươi ngon',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
    category: '1',
    rating: 4.6,
    reviews: 145,
    stock: 45,
  },
  {
    id: '10',
    name: 'Sinh Tố Bơ',
    description: 'Sinh tố bơ mát lạnh, béo ngậy với sữa đặc và đá xay',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop',
    category: '2',
    rating: 4.7,
    reviews: 267,
    stock: 90,
  },
  {
    id: '11',
    name: 'Kem Flan',
    description: 'Kem flan mềm mịn với caramel ngọt ngào, lạnh mát',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1563805042-7688c019e1c3?w=800&h=600&fit=crop',
    category: '3',
    rating: 4.8,
    reviews: 423,
    stock: 70,
  },
  {
    id: '12',
    name: 'Nem Chua Rán',
    description: 'Nem chua rán giòn tan với nhân thịt đậm đà, chấm nước mắm chua ngọt',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
    category: '4',
    rating: 4.5,
    reviews: 189,
    stock: 85,
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return mockProducts.filter(product => product.category === categoryId);
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    items: [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[3], quantity: 1 },
    ],
    total: 195000,
    status: 'completed',
    createdAt: '2024-11-01T10:30:00Z',
    shippingAddress: {
      fullName: 'Nguyễn Văn A',
      phone: '0123456789',
      address: '123 Đường ABC, Quận XYZ, TP.HCM',
    },
  },
  {
    id: 'ORD002',
    items: [
      { product: mockProducts[1], quantity: 1 },
      { product: mockProducts[4], quantity: 2 },
    ],
    total: 135000,
    status: 'delivering',
    createdAt: '2024-11-03T14:20:00Z',
    shippingAddress: {
      fullName: 'Trần Thị B',
      phone: '0987654321',
      address: '456 Đường DEF, Quận UVW, TP.HCM',
    },
  },
  {
    id: 'ORD003',
    items: [
      { product: mockProducts[2], quantity: 3 },
      { product: mockProducts[5], quantity: 2 },
    ],
    total: 145000,
    status: 'pending',
    createdAt: '2024-11-04T09:15:00Z',
    shippingAddress: {
      fullName: 'Lê Văn C',
      phone: '0912345678',
      address: '789 Đường GHI, Quận JKL, TP.HCM',
    },
  },
  {
    id: 'ORD004',
    items: [
      { product: mockProducts[6], quantity: 1 },
      { product: mockProducts[7], quantity: 2 },
    ],
    total: 145000,
    status: 'preparing',
    createdAt: '2024-11-04T11:45:00Z',
    shippingAddress: {
      fullName: 'Phạm Thị D',
      phone: '0923456789',
      address: '321 Đường MNO, Quận PQR, TP.HCM',
    },
  },
  {
    id: 'ORD005',
    items: [
      { product: mockProducts[8], quantity: 2 },
    ],
    total: 110000,
    status: 'confirmed',
    createdAt: '2024-11-04T13:20:00Z',
    shippingAddress: {
      fullName: 'Hoàng Văn E',
      phone: '0934567890',
      address: '654 Đường STU, Quận VWX, TP.HCM',
    },
  },
  {
    id: 'ORD006',
    items: [
      { product: mockProducts[9], quantity: 1 },
      { product: mockProducts[10], quantity: 1 },
    ],
    total: 63000,
    status: 'pending',
    createdAt: '2024-11-04T15:10:00Z',
    shippingAddress: {
      fullName: 'Vũ Thị F',
      phone: '0945678901',
      address: '987 Đường YZA, Quận BCD, TP.HCM',
    },
  },
  {
    id: 'ORD007',
    items: [
      { product: mockProducts[11], quantity: 2 },
      { product: mockProducts[0], quantity: 1 },
    ],
    total: 215000,
    status: 'delivering',
    createdAt: '2024-11-04T16:30:00Z',
    shippingAddress: {
      fullName: 'Đặng Văn G',
      phone: '0956789012',
      address: '147 Đường EFG, Quận HIJ, TP.HCM',
    },
  },
];
