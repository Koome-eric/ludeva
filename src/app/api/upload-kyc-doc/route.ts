import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const label = (formData.get('label') as string) || 'kyc_doc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `ludeva/kyc/${user.id}`;

    // Create signature
    const crypto = require('crypto');
    const signatureStr = `folder=${folder}&public_id=${label}_${timestamp}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    const uploadFormData = new FormData();
    uploadFormData.append('file', dataUri);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);
    uploadFormData.append('public_id', `${label}_${timestamp}`);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      { method: 'POST', body: uploadFormData }
    );

    if (!cloudRes.ok) {
      const err = await cloudRes.text();
      console.error('Cloudinary upload error:', err);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const cloudData = await cloudRes.json();
    return NextResponse.json({ url: cloudData.secure_url });
  } catch (err) {
    console.error('KYC upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
