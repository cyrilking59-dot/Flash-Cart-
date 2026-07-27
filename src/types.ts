export type UserRole = 'CUSTOMER' | 'TRADER' | 'RIDER' | 'ADMIN' | 'DIRECTORY' | 'SPACE';

export type VoltaMarketId = 'abor' | 'akatsi' | 'dabala' | 'mafi' | 'denu' | 'agbozume' | 'aflao';

export interface VoltaMarket {
  id: VoltaMarketId;
  name: string;
  district: string;
  specialization: string; // E.g., "Cassava Gari Processing & Bulk Grain Distribution Hub"
  markerLocationName: string; // E.g., "Central Market Roundabout, Akatsi Township"
  description: string;
  marketDays: string;
  popularItems: string[];
  coordinates: { lat: number; lng: number };
  image: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  digitalAddress: string; // e.g. VR-0421-9081
  deliveryAddress: string;
  preferredMarket: VoltaMarketId;
  momoNumber: string;
  momoNetwork: 'MTN MoMo' | 'Telecel Cash' | 'AT Money';
}

export interface TraderProfile {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  marketId: VoltaMarketId;
  stallNumber: string;
  category: string;
  rating: number;
  totalSales: number;
  verified: boolean;
  avatar: string;
}

export type VehicleType = 'MOTORBIKE_OKADA' | 'TRICYCLE_ABOBOYAA' | 'BICYCLE' | 'VAN';

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  ghanaCardNo: string; // e.g. GHA-78219381-0
  passportPhoto: string;
  primaryMarket: VoltaMarketId;
  locationDetails: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  verified: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  rating: number; // 1-5 star
  reviewCount: number;
  isTopRated: boolean; // True if rating >= 4.8
  totalDeliveries: number;
  earningsGhs: number;
}

export type ProductCategory = 
  | 'Food & Prepared Meals'
  | 'Groceries'
  | 'Electronics & Gadgets'
  | 'Fashion & Apparel'
  | 'Personal Care & Beauty'
  | 'Household Goods'
  | 'School & Baby Essentials'
  | 'Gari & Grains'
  | 'Fresh Seafood & Fish'
  | 'Kente & Textiles'
  | 'Tubers & Plantain'
  | 'Vegetables & Spices'
  | 'Oils & Provisions'
  | 'Livestock & Poultry';

export interface Product {
  id: string;
  traderId: string;
  traderName: string;
  marketId: VoltaMarketId;
  name: string;
  category: ProductCategory;
  priceGhs: number;
  unit: string; // e.g., "Per Olonka (2.5kg)", "Per Paint Rubber", "Per Large Piece", "Per Sachet"
  stock: number;
  description: string;
  stallLocation?: string; // e.g., "Gari Shed - Section B, Stall #14"
  itemFunction?: string; // e.g., "Staple food item for gari foto, soakings and porridge"
  image: string;
  rating: number;
  salesCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'MTN_MOMO' | 'TELECEL_CASH' | 'AT_MONEY' | 'CARD' | 'COD';

export type OrderStatus = 
  | 'BROADCAST_PENDING'   // Waiting for first rider to accept
  | 'ACCEPTED_BY_RIDER'   // Rider accepted, heading to trader
  | 'PICKING_UP'          // Rider at trader stall picking goods
  | 'IN_TRANSIT'          // Rider en route to customer
  | 'DELIVERED'           // Delivery confirmed by customer PIN
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  priceGhs: number;
  quantity: number;
  unit: string;
  traderId: string;
  traderName: string;
}

export interface Order {
  id: string;
  orderCode: string; // e.g. FC-VR-8910
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  digitalAddress: string;
  marketId: VoltaMarketId;
  items: OrderItem[];
  subtotalGhs: number;
  deliveryFeeGhs: number;
  totalGhs: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID' | 'RELEASED';
  status: OrderStatus;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: VehicleType;
  deliveryPin: string; // 4-digit code for confirmation
  issueReported?: string;
  createdAt: string;
  acceptedAt?: string;
  deliveredAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  riderId: string;
  traderId?: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  roleTarget: UserRole | 'ALL';
  userId?: string;
  title: string;
  message: string;
  type: 'ORDER_PLACED' | 'BROADCAST_ALERT' | 'ORDER_ACCEPTED' | 'ORDER_STATUS' | 'PAYMENT' | 'REVIEW';
  createdAt: string;
  read: boolean;
  orderId?: string;
}
