export interface Category {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  image: string;
  gradient: string;
  count: number;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: number;
  isOpen: boolean;
  tags: string[];
  categoryId: string;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number; // so'mda (masalan: 48000)
  image: string;
  category: string;
  isPopular: boolean;
  isAvailable: boolean;
  rating?: number;
  weight?: string; // portion/weight label, e.g. "350 g", "0.5 L", "30 sm"
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface Order {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantId?: string;
  items: { name: string; quantity: number; price: number; foodId?: string; image?: string }[];
  total: number;
  status: "pending" | "preparing" | "on_the_way" | "delivered" | "cancelled";
  createdAt: string;
  address: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  avatar: string;
  ordersCount: number;
  totalSpent: number;
}
