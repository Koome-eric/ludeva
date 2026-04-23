import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// =================================================================================
// 5. M-PESA CALLBACK ENDPOINT
// =================================================================================
// TODO: This endpoint is critical for confirming the status of a payment. Safaricom
// will call this URL after the user has responded to the STK push on their phone.
// In a production environment, you should add a layer of security to validate
// that the callback is genuinely from Safaricom (e.g., by checking the source IP).

export async function POST(req: Request) {
  console.log('[M-PESA Callback] Received a request.');
  
  try {
    const callbackData = await req.json();
    console.log('[M-PESA Callback] Data:', JSON.stringify(callbackData, null, 2));

    const { Body: { stkCallback } } = callbackData;

    // `ResultCode` 0 means the transaction was successful.
    const resultCode = stkCallback.ResultCode;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    
    // Find the original transaction in your database using the CheckoutRequestID
    // which you should have saved when you initiated the STK push.
    // For this to work, you MUST store the `checkoutRequestId` in your `Payment` record.
    //
    // Let's assume you stored it in the `providerReference` field.
    const payment = await prisma.payment.findFirst({ where: { providerReference: checkoutRequestId } });
    
    if (!payment) {
      console.error(`[M-PESA Callback] Payment not found for CheckoutRequestID: ${checkoutRequestId}`);
      // Respond to Safaricom but log the error.
      return NextResponse.json({ message: 'Payment not found' }, { status: 200 });
    }

    if (resultCode === 0) {
      // PAYMENT SUCCESS
      // - The payment was successful.
      // - `stkCallback.CallbackMetadata` contains details like the M-Pesa receipt number.
      // - Verify that the amount paid matches the amount in your database record.
      const metadata = stkCallback.CallbackMetadata.Item;
      const receipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amountPaid = metadata.find((item: any) => item.Name === 'Amount')?.Value;

      if (amountPaid < payment.amount) {
          console.warn(`[M-PESA Callback] Amount paid (${amountPaid}) is less than expected (${payment.amount}) for CheckoutRequestID: ${checkoutRequestId}`);
          // You might want to handle this case specifically, e.g., by creating a partial payment record.
      }

      await prisma.payment.update({
         where: { id: payment.id },
         data: { status: 'completed', providerReference: receipt } // Update status and save the official receipt number
      });
      
      // TODO: Here you would also update the user's investment balance.
      // For example, create a corresponding 'Investment' record.

      console.log(`[M-PESA Callback] Successfully processed transaction for CheckoutRequestID: ${checkoutRequestId}`);

    } else {
      // PAYMENT FAILURE
      // - The user cancelled, entered the wrong PIN, or had insufficient funds.
      await prisma.payment.update({
         where: { id: payment.id },
         data: { status: 'failed' }
      });

      console.log(`[M-PESA Callback] Failed transaction for CheckoutRequestID: ${checkoutRequestId}. Reason: ${stkCallback.ResultDesc}`);
    }

    // Respond to Safaricom to acknowledge receipt of the callback.
    return NextResponse.json({ message: "Callback received successfully" }, { status: 200 });

  } catch (error) {
    console.error('[M-PESA Callback] Error processing callback:', error);
    // Return a 500 error but Safaricom might retry. It's often better to return a 200
    // and handle the error internally to prevent repeated failed callbacks.
    return NextResponse.json({ message: "An error occurred but callback acknowledged" }, { status: 200 });
  }
}
