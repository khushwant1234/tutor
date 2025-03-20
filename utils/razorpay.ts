import { loadScript } from './scriptLoader';

export interface PaymentOptions {
  key: string;
  amount: number; // in smallest currency unit (paise for INR)
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  callback_url?: string;
  handler?: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

// Initialize Razorpay by loading the script
export const initializeRazorpay = async (): Promise<boolean> => {
  return await loadScript('https://checkout.razorpay.com/v1/checkout.js');
};

// Open Razorpay checkout
export const openRazorpayCheckout = async (options: PaymentOptions): Promise<void> => {
  const initialized = await initializeRazorpay();
  
  if (!initialized) {
    throw new Error('Razorpay SDK failed to load');
  }
  
  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};

// Helper to format price with currency symbol
export const formatPrice = (price: number, currency: string): string => {
  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  return `${currencySymbols[currency] || ''}${price}`;
};