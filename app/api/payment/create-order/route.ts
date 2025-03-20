import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/utils/supabase/client';

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Parse request body
    const { courseId, price, currency } = await request.json();
    
    if (!courseId || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get course details to verify price
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Check if user is already enrolled
    const { data: enrollment } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();
    
    if (enrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }
    
    // Create Razorpay order
    const amount = Math.round(price * 100); // Convert to paise
    const receipt = `course_${courseId}_${Date.now()}`;
    
    // Make API request to Razorpay
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount,
        currency: currency || 'INR',
        receipt,
        notes: {
          courseId,
          userId: user.id
        }
      })
    });
    
    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create payment order' }, 
        { status: 500 }
      );
    }
    
    const orderData = await razorpayResponse.json();
    
    // Store order details in database
    await supabase.from('payment_orders').insert({
      order_id: orderData.id,
      user_id: user.id,
      course_id: courseId,
      amount: price,
      currency: currency || 'INR',
      status: 'created'
    });
    
    return NextResponse.json({
      orderId: orderData.id,
      amount: orderData.amount
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}