import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { buffer } from 'node:stream/consumers';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // =================================================================================
  // 6. STRIPE WEBHOOK ENDPOINT
  // =================================================================================
  // This endpoint handles the asynchronous webhook from Stripe to confirm payment status.

  console.log('[Stripe Webhook] Received a request.');

  const rawBody = await buffer(req.body as any);
  const signature = headers().get('stripe-signature') as string;
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.log(`[Stripe Webhook] ⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Verified event: ${event.id}, type: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // The `metadata` contains the `transactionRef` you passed during session creation.
      const transactionRef = session.metadata?.transactionRef;

      if (!transactionRef) {
        console.error('[Stripe Webhook] Critical: transactionRef not found in webhook metadata.');
        break; // Acknowledge the event but log an error.
      }
      
      // Find the transaction in your database.
      const payment = await prisma.payment.findUnique({ where: { transactionRef } });
      if (!payment) {
         console.error(`[Stripe Webhook] Payment not found for ref: ${transactionRef}`);
         break;
      }

      // Check if payment is already processed to ensure idempotency
      if (payment.status === 'completed') {
        console.log(`[Stripe Webhook] Payment ${transactionRef} already processed.`);
        break;
      }
      
      // Update the payment status to 'completed'.
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
            status: 'completed', 
            providerReference: session.payment_intent as string 
        },
      });

      // TODO: Here you would also update the user's investment balance.
      // For example, create a corresponding 'Investment' record.

      console.log(`[Stripe Webhook] Successfully processed payment: ${transactionRef}`);
      break;
    }
    
    // ... handle other event types like 'checkout.session.async_payment_failed'
    
    default:
      console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event.
  return NextResponse.json({ received: true }, { status: 200 });
}
