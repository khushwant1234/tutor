import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/utils/supabase/client';
import crypto from 'crypto';

// Replace with your Razorpay key secret
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'SDcnBAi6pn6mGQe5LmX6wAcZ';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Parse request body
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      courseId
    } = await request.json();
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !courseId) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
    }
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(body)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }
    
    // Get payment order from database
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', razorpay_order_id)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Update payment status
    await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    // Enroll user in course
    await supabase
      .from('user_data')
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_id: razorpay_payment_id,
        payment_order_id: razorpay_order_id
      });
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    });
    
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}