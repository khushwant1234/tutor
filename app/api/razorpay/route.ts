import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side with error handling
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, key);
};

// Razorpay key ID and secret
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    if (!KEY_ID || !KEY_SECRET) {
      console.error('Missing Razorpay environment variables');
      return NextResponse.json(
        { error: 'Payment service not configured' }, 
        { status: 500 }
      );
    }

    // Get the authenticated user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 });
    }
    
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' }, 
        { status: 404 }
      );
    }
    
    // Check if course is free
    if (course.is_free) {
      return NextResponse.json(
        { error: 'Course is free, no payment required' }, 
        { status: 400 }
      );
    }
    
    // Check if user is already enrolled
    const { data: enrollment } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();
    
    if (enrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' }, 
        { status: 400 }
      );
    }
    
    // Calculate amount in smallest currency unit (e.g., paise for INR)
    const amount = Math.round(course.price * 100);
    
    // Create a Razorpay order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount,
        currency: course.currency || 'INR',
        receipt: `course_${courseId}_user_${user.id}`,
        notes: {
          course_id: courseId,
          user_id: user.id
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to create order', details: errorData }, 
        { status: 500 }
      );
    }
    
    const order = await response.json();
    
    // Store order in database
    const { error: orderError } = await supabase
      .from('payment_orders')
      .insert([{
        order_id: order.id,
        user_id: user.id,
        course_id: courseId,
        amount: course.price,
        currency: course.currency || 'INR',
        status: 'created'
      }]);
    
    if (orderError) {
      console.error('Failed to store order:', orderError);
    }
    
    // Return order details to client
    return NextResponse.json({
      order_id: order.id,
      amount: amount,
      currency: course.currency || 'INR',
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
        currency: course.currency || 'INR'
      }
    });
    
  } catch (error) {
    console.error('Razorpay API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}