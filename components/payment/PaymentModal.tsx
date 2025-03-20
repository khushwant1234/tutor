import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from "@/utils/supabase/client";

interface PaymentModalProps {
  courseId: string;
  courseTitle: string;
  price: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  courseId,
  courseTitle,
  price,
  currency,
  onClose,
  onSuccess
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load Razorpay script when component mounts
    const loadRazorpayScript = async () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => {
          setError('Failed to load payment gateway. Please refresh and try again.');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };
    
    loadRazorpayScript();
  }, []);
  
  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Create order via API
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          price,
          currency
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }
      
      const { orderId, amount } = await response.json();
      
      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_lACjwUdPF3lxc7', // Replace with your test key
        amount: amount, // Amount in smallest currency unit (paise)
        currency: currency,
        name: 'Tutor Platform',
        description: `Enrollment for ${courseTitle}`,
        order_id: orderId,
        handler: function(response: any) {
          verifyPayment(response);
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };
  
  const verifyPayment = async (response: any) => {
    try {
      setLoading(true);
      
      const verifyResponse = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          courseId
        }),
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }
      
      // On success
      onSuccess();
      
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Enroll in Course</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 mb-6 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800">{courseTitle}</h3>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-600">Course Price</span>
                <span className="text-xl font-bold">
                  {currency === 'INR' && '₹'}
                  {currency === 'USD' && '$'}
                  {currency === 'EUR' && '€'}
                  {currency === 'GBP' && '£'}
                  {price}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Button 
            onClick={initiatePayment} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <>Pay Now</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;