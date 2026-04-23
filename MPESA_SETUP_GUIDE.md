# M-Pesa Daraja Integration Setup

## 🔐 Environment Variables

Add these to your `.env.local` file:

```
# M-Pesa Daraja API (Safaricom)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Application URL (for internal API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Daraja Credentials

1. **Go to Safaricom Developer Portal**
   - Visit: https://developer.safaricom.co.ke/

2. **Create an Application**
   - Register and create a new app under "My Apps"
   - You'll get:
     - `Consumer Key`
     - `Consumer Secret`

3. **Get Business Details**
   - Business Short Code: `174379` (Safaricom Test Shortcode)
   - Passkey: Available in your app settings
   - Lipa Na M-Pesa Online Passkey

4. **Configure Callback URL**
   - Set it to: `https://yourdomain.com/api/mpesa/callback`
   - Must be HTTPS in production
   - For local testing, use ngrok: `https://your-ngrok-url.ngrok.io/api/mpesa/callback`

---

## ✅ Implementation Checklist

- [x] Daraja utility library (`src/lib/mpesa.ts`)
- [x] STK Push API route (`src/app/api/mpesa/stk-push/route.ts`)
- [x] Callback webhook (`src/app/api/mpesa/callback/route.ts`)
- [x] Deposit actions integration (`src/app/member/deposit/actions.ts`)
- [ ] Database schema updated (add `providerReference`, `merchantRequestID` fields to Payment model)
- [ ] Callback handler implementation (credit wallet, update status)
- [ ] Testing on Safaricom sandbox
- [ ] Production deployment

---

## 🧪 Testing on Sandbox

### Using Postman or curl

**1. Get Access Token**
```bash
curl -X GET \
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -H "Authorization: Basic YOUR_BASE64_ENCODED_CREDENTIALS"
```

**2. Initiate STK Push**
```bash
curl -X POST \
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "BusinessShortCode": "174379",
    "Password": "YOUR_PASSWORD",
    "Timestamp": "20240101000000",
    "TransactionType": "CustomerPayBillOnline",
    "Amount": 1000,
    "PartyA": "254712345678",
    "PartyB": "174379",
    "PhoneNumber": "254712345678",
    "CallBackURL": "https://yourngrok.ngrok.io/api/mpesa/callback",
    "AccountReference": "TestRef",
    "TransactionDesc": "Test Payment"
  }'
```

### Test Credentials (Sandbox)
- **Phone Number**: 254712345678
- **Amount**: 1 - 150,000 KES
- **PIN**: 1234

---

## 🔄 Flow Diagram

```
User DepositForm
    ↓
Clicks "Pay with M-Pesa"
    ↓
initiateDeposit() action (server-side)
    ↓
POST /api/mpesa/stk-push
    ↓
M-Pesa utility: stkPush()
    ↓
Daraja API: GET access token
    ↓
Daraja API: POST STK Push request
    ↓
Response: CheckoutRequestID + MerchantRequestID
    ↓
Update Payment record with provider reference
    ↓
Response to user: "Check your phone for M-Pesa prompt"
    ↓
User enters PIN on phone
    ↓
Safaricom processes payment
    ↓
Daraja sends callback to /api/mpesa/callback
    ↓
Callback handler:
  ├─ Verify ResultCode === 0 (success)
  ├─ Extract amount, receipt number
  ├─ Update Payment status to SUCCESS
  ├─ Credit user wallet
  └─ Send confirmation email
    ↓
✅ Payment complete
```

---

## 🛡️ Security Best Practices

1. **Never expose secrets in frontend**
   - All Daraja calls go through `/api/mpesa/*` routes
   - Secrets stay in `.env.local` (server-side only)

2. **Validate callbacks**
   - Always check `ResultCode === 0`
   - Log all callbacks for audit trail
   - Use database transactions to prevent double-crediting

3. **Phone number validation**
   - Must be Kenyan format: `2547XXXXXXXX`
   - Validate on both client and server

4. **Amount validation**
   - Minimum: KES 100
   - Maximum: KES 150,000
   - Must be positive integer

5. **Callback URL security**
   - Must be HTTPS in production
   - Consider IP whitelist if needed
   - Respond quickly (< 10 seconds)

---

## 📱 Live Environment Setup

When moving to production:

1. **Update Environment Variables**
   ```
   MPESA_CONSUMER_KEY=live_consumer_key
   MPESA_CONSUMER_SECRET=live_consumer_secret
   MPESA_SHORTCODE=your_business_shortcode
   MPESA_PASSKEY=live_passkey
   MPESA_CALLBACK_URL=https://ludeva.com/api/mpesa/callback
   NEXT_PUBLIC_APP_URL=https://ludeva.com
   ```

2. **Update Daraja Base URL**
   - Change from `sandbox.safaricom.co.ke` to `api.safaricom.co.ke`
   - (Already hardcoded as production URL in `src/lib/mpesa.ts`)

3. **Safaricom Compliance**
   - Provide HTTPS callback URL
   - Set up monitoring/alerting
   - Test end-to-end with real account

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Invalid credentials` | Check MPESA_CONSUMER_KEY and SECRET |
| `Invalid timestamp` | Server time must be accurate (NTP sync) |
| `Callback not received` | Verify MPESA_CALLBACK_URL is HTTPS and reachable |
| `Double charging` | Use database transactions in callback |
| `Stale access token` | Token is cached; refresh interval is handled |

---

## 📊 Payment Record Schema Updates

Add these fields to your Prisma Payment model:

```prisma
model Payment {
  // ... existing fields
  
  // M-Pesa specific
  providerReference    String?  // CheckoutRequestID from Daraja
  merchantRequestID    String?  // MerchantRequestID
  mpesaReceiptNumber   String?  // Only after successful payment
  
  // ... rest of fields
}
```

Then run:
```bash
npx prisma migrate dev --name add_mpesa_fields
```

---

## ✅ Next Steps

1. ✅ Add env variables to `.env.local`
2. ⏳ Update Prisma schema with new fields
3. ⏳ Implement callback handler to credit wallet
4. ⏳ Test on Safaricom sandbox
5. ⏳ Deploy to production

---

## 📚 References

- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/docs)
- [STK Push Documentation](https://developer.safaricom.co.ke/docs?javascript#stkpush)
- [Callback Response Format](https://developer.safaricom.co.ke/docs?javascript#callback-response-format)
