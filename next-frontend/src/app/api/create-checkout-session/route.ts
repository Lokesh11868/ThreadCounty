import { NextResponse } from 'next/server';

const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/pg/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, price, planName } = body;

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payload = {
      order_id: orderId,
      order_amount: Number(price),
      order_currency: 'INR',
      customer_details: {
        customer_id: 'cust_default',
        customer_name: 'ThreadCounty User',
        customer_email: 'user@threadcounty.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `${request.headers.get('origin')}/dashboard?session_id={order_id}&plan=${planId}`,
      },
      order_tags: {
        plan: planName,
      }
    };

    const res = await fetch(CASHFREE_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID || '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to create Cashfree order');
    }

    // Determine the checkout URL
    // Sandbox default URL structure
    const checkoutUrl = `https://payments-test.cashfree.com/order/#${data.payment_session_id}`;

    return NextResponse.json({ url: checkoutUrl, payment_session_id: data.payment_session_id });
  } catch (err: any) {
    console.error('Cashfree error:', err);
    return NextResponse.json(
      { error: err.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
