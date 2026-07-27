import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  VoltaMarketId, 
  CustomerProfile, 
  TraderProfile, 
  RiderProfile, 
  Product, 
  CartItem, 
  Order, 
  Review, 
  AppNotification, 
  OrderStatus,
  PaymentMethod,
  VehicleType
} from '../types';
import { 
  VOLTA_MARKETS, 
  INITIAL_TRADERS, 
  INITIAL_PRODUCTS, 
  INITIAL_RIDERS, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_NOTIFICATIONS 
} from '../data/seedData';

interface AppContextType {
  currentRole: UserRole | 'REPORT';
  setCurrentRole: (role: UserRole | 'REPORT') => void;
  selectedMarket: VoltaMarketId | 'ALL';
  setSelectedMarket: (market: VoltaMarketId | 'ALL') => void;
  customer: CustomerProfile;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  traders: TraderProfile[];
  products: Product[];
  riders: RiderProfile[];
  orders: Order[];
  reviews: Review[];
  notifications: AppNotification[];
  cart: CartItem[];
  
  // Active Modals / Drawer controls
  activeModal: 'CART' | 'CHECKOUT' | 'TRACKING' | 'REGISTER_TRADER' | 'REGISTER_RIDER' | 'AI_ASSISTANT' | 'ADD_PRODUCT' | 'PRICE_TRENDS' | 'NONE';
  setActiveModal: (modal: 'CART' | 'CHECKOUT' | 'TRACKING' | 'REGISTER_TRADER' | 'REGISTER_RIDER' | 'AI_ASSISTANT' | 'ADD_PRODUCT' | 'PRICE_TRENDS' | 'NONE') => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Order actions
  placeOrder: (details: {
    deliveryAddress: string;
    digitalAddress: string;
    paymentMethod: PaymentMethod;
    momoNumber: string;
    notes?: string;
  }) => Order | null;
  
  acceptOrderAsRider: (orderId: string, riderId: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmDeliveryWithPin: (orderId: string, pin: string) => { success: boolean; message: string };
  submitReview: (orderId: string, riderId: string, rating: number, comment: string) => void;

  // Trader & Rider onboarding
  registerTrader: (data: Omit<TraderProfile, 'id' | 'rating' | 'totalSales' | 'verified'>) => void;
  registerRider: (data: Omit<RiderProfile, 'id' | 'rating' | 'reviewCount' | 'isTopRated' | 'totalDeliveries' | 'earningsGhs' | 'verified' | 'status'>) => void;
  toggleRiderVerification: (riderId: string) => void;

  // Product management
  addProduct: (productData: Omit<Product, 'id' | 'rating' | 'salesCount'>) => void;
  deleteProduct: (productId: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const defaultCustomer: CustomerProfile = {
  id: 'cust-1',
  name: 'Abla Fiawoo',
  email: 'abla.fiawoo@gmail.com',
  phone: '+233 24 888 1234',
  digitalAddress: 'VR-0412-8821',
  deliveryAddress: 'House No. 14, Near Akatsi Senior High School',
  preferredMarket: 'akatsi',
  momoNumber: '0248881234',
  momoNetwork: 'MTN MoMo'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'FLASH_CART_VOLTA_STATE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from LocalStorage or use seed
  const [currentRole, setCurrentRole] = useState<UserRole | 'REPORT'>('CUSTOMER');
  const [selectedMarket, setSelectedMarket] = useState<VoltaMarketId | 'ALL'>('ALL');
  const [customer, setCustomer] = useState<CustomerProfile>(defaultCustomer);
  
  const [traders, setTraders] = useState<TraderProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_traders`);
    return saved ? JSON.parse(saved) : INITIAL_TRADERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [riders, setRiders] = useState<RiderProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_riders`);
    return saved ? JSON.parse(saved) : INITIAL_RIDERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reviews`);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_cart`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeModal, setActiveModal] = useState<'CART' | 'CHECKOUT' | 'TRACKING' | 'REGISTER_TRADER' | 'REGISTER_RIDER' | 'AI_ASSISTANT' | 'ADD_PRODUCT' | 'PRICE_TRENDS' | 'NONE'>('NONE');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_traders`, JSON.stringify(traders));
  }, [traders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_riders`, JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reviews`, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_cart`, JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  // Order Operations
  const placeOrder = (details: {
    deliveryAddress: string;
    digitalAddress: string;
    paymentMethod: PaymentMethod;
    momoNumber: string;
    notes?: string;
  }): Order | null => {
    if (cart.length === 0) return null;

    const subtotalGhs = cart.reduce((acc, item) => acc + item.product.priceGhs * item.quantity, 0);
    // Base delivery fee GHS 12 + market count distance calculation
    const uniqueMarkets = Array.from(new Set(cart.map(item => item.product.marketId)));
    const deliveryFeeGhs = 12.0 + (uniqueMarkets.length - 1) * 6.0;
    const totalGhs = subtotalGhs + deliveryFeeGhs;

    // Generate random 4 digit PIN
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderCode = `FC-VR-${Math.floor(1000 + Math.random() * 9000)}`;

    const firstProductMarket = cart[0].product.marketId;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: details.deliveryAddress,
      digitalAddress: details.digitalAddress,
      marketId: firstProductMarket,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        priceGhs: item.product.priceGhs,
        quantity: item.quantity,
        unit: item.product.unit,
        traderId: item.product.traderId,
        traderName: item.product.traderName
      })),
      subtotalGhs,
      deliveryFeeGhs,
      totalGhs,
      paymentMethod: details.paymentMethod,
      paymentStatus: 'PAID', // MoMo processed immediately in demo
      status: 'BROADCAST_PENDING',
      deliveryPin,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Broadcast notification to nearby riders & traders
    const riderNotif: AppNotification = {
      id: `notif-${Date.now()}-1`,
      roleTarget: 'RIDER',
      title: '⚡ New Order Broadcast Available!',
      message: `Order #${orderCode} at ${VOLTA_MARKETS.find(m => m.id === firstProductMarket)?.name || 'Market'}. Total: ₵${totalGhs.toFixed(2)}. First rider to claim gets the job!`,
      type: 'BROADCAST_ALERT',
      createdAt: new Date().toISOString(),
      read: false,
      orderId: newOrder.id
    };

    const traderNotif: AppNotification = {
      id: `notif-${Date.now()}-2`,
      roleTarget: 'TRADER',
      title: '📦 New Order Received!',
      message: `Customer ${customer.name} placed order #${orderCode} for ₵${subtotalGhs.toFixed(2)}.`,
      type: 'ORDER_PLACED',
      createdAt: new Date().toISOString(),
      read: false,
      orderId: newOrder.id
    };

    setNotifications(prev => [riderNotif, traderNotif, ...prev]);
    setTrackingOrderId(newOrder.id);
    return newOrder;
  };

  const acceptOrderAsRider = (orderId: string, riderId: string): boolean => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder || targetOrder.status !== 'BROADCAST_PENDING') {
      return false; // Order already claimed by another rider or updated
    }

    const rider = riders.find(r => r.id === riderId);
    if (!rider) return false;

    setOrders(prev =>
      prev.map(ord =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'ACCEPTED_BY_RIDER',
              riderId: rider.id,
              riderName: rider.name,
              riderPhone: rider.phone,
              riderVehicle: rider.vehicleType,
              acceptedAt: new Date().toISOString()
            }
          : ord
      )
    );

    // Notify Customer
    const custNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      roleTarget: 'CUSTOMER',
      userId: targetOrder.customerId,
      title: '🏍️ Rider Assigned!',
      message: `${rider.name} accepted your order #${targetOrder.orderCode}. Your delivery PIN is ${targetOrder.deliveryPin}.`,
      type: 'ORDER_ACCEPTED',
      createdAt: new Date().toISOString(),
      read: false,
      orderId
    };

    setNotifications(prev => [custNotif, ...prev]);
    return true;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );

    const target = orders.find(o => o.id === orderId);
    if (target) {
      const statusNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        roleTarget: 'CUSTOMER',
        userId: target.customerId,
        title: `Order #${target.orderCode} Update`,
        message: `Status updated to: ${status.replace(/_/g, ' ')}.`,
        type: 'ORDER_STATUS',
        createdAt: new Date().toISOString(),
        read: false,
        orderId
      };
      setNotifications(prev => [statusNotif, ...prev]);
    }
  };

  const confirmDeliveryWithPin = (orderId: string, pin: string) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return { success: false, message: 'Order not found.' };

    if (target.deliveryPin !== pin.trim()) {
      return { success: false, message: 'Invalid 4-digit Delivery PIN. Please ask customer for correct code.' };
    }

    // Mark as delivered & release payment
    setOrders(prev =>
      prev.map(ord =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'DELIVERED',
              paymentStatus: 'RELEASED',
              deliveredAt: new Date().toISOString()
            }
          : ord
      )
    );

    // Update rider stats & earnings
    if (target.riderId) {
      setRiders(prev =>
        prev.map(r => {
          if (r.id === target.riderId) {
            const newTotal = r.totalDeliveries + 1;
            const newEarnings = r.earningsGhs + target.deliveryFeeGhs;
            return {
              ...r,
              totalDeliveries: newTotal,
              earningsGhs: newEarnings
            };
          }
          return r;
        })
      );
    }

    // Notify Customer & Trader
    const paymentNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      roleTarget: 'TRADER',
      title: '💰 Payment Released!',
      message: `Order #${target.orderCode} completed successfully. ₵${target.subtotalGhs.toFixed(2)} released to trader wallet.`,
      type: 'PAYMENT',
      createdAt: new Date().toISOString(),
      read: false,
      orderId
    };

    setNotifications(prev => [paymentNotif, ...prev]);

    return { success: true, message: 'Delivery PIN verified! Order marked as DELIVERED and funds released.' };
  };

  const submitReview = (orderId: string, riderId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      orderId,
      riderId,
      customerId: customer.id,
      customerName: customer.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newRev, ...prev]);

    // Recalculate rider average rating
    const allRiderRevs = [...reviews.filter(r => r.riderId === riderId), newRev];
    const avgRating = Number(
      (allRiderRevs.reduce((sum, r) => sum + r.rating, 0) / allRiderRevs.length).toFixed(2)
    );
    const isTop = avgRating >= 4.8 && allRiderRevs.length >= 2;

    setRiders(prev =>
      prev.map(r =>
        r.id === riderId
          ? {
              ...r,
              rating: avgRating,
              reviewCount: allRiderRevs.length,
              isTopRated: isTop
            }
          : r
      )
    );
  };

  // Onboarding
  const registerTrader = (data: Omit<TraderProfile, 'id' | 'rating' | 'totalSales' | 'verified'>) => {
    const newTrader: TraderProfile = {
      ...data,
      id: `trader-${Date.now()}`,
      rating: 5.0,
      totalSales: 0,
      verified: true
    };
    setTraders(prev => [newTrader, ...prev]);
  };

  const registerRider = (data: Omit<RiderProfile, 'id' | 'rating' | 'reviewCount' | 'isTopRated' | 'totalDeliveries' | 'earningsGhs' | 'verified' | 'status'>) => {
    const newRider: RiderProfile = {
      ...data,
      id: `rider-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      isTopRated: true,
      totalDeliveries: 0,
      earningsGhs: 0,
      verified: true, // auto-verified for smooth demo testing
      status: 'ONLINE'
    };
    setRiders(prev => [newRider, ...prev]);
  };

  const toggleRiderVerification = (riderId: string) => {
    setRiders(prev =>
      prev.map(r => (r.id === riderId ? { ...r, verified: !r.verified } : r))
    );
  };

  // Product actions
  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'salesCount'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      salesCount: 0
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        selectedMarket,
        setSelectedMarket,
        customer,
        setCustomer,
        traders,
        products,
        riders,
        orders,
        reviews,
        notifications,
        cart,
        activeModal,
        setActiveModal,
        trackingOrderId,
        setTrackingOrderId,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        acceptOrderAsRider,
        updateOrderStatus,
        confirmDeliveryWithPin,
        submitReview,
        registerTrader,
        registerRider,
        toggleRiderVerification,
        addProduct,
        deleteProduct,
        markNotificationAsRead,
        clearAllNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
