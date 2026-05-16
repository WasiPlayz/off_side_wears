import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  img: string;
  images?: string[];
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}

export interface Order {
  id: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    district: string;
    thana: string;
    address: string;
  };
  paymentInfo: {
    method: string;
    mobileBanking: string;
    transactionId: string;
    screenshotUrl?: string;
    amountPaid?: number;
    balanceDue?: number;
  };
  items: Array<{
    id: number;
    name: string;
    price: string;
    quantity: number;
    size: string;
  }>;
  orderSummary: {
    subtotal: number;
    shipping: number;
    total: number;
    discountAmount?: number;
    appliedPromoCode?: string | null;
    amountPaid?: number;
    balanceDue?: number;
  };
  status: string;
  createdAt: Timestamp | null;
  trackingNumber?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number; // percentage
  type: 'global' | 'product';
  productIds?: number[];
  active: boolean;
}
