import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { uploadBufferToR2, buildObjectKey, isR2Configured } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isR2Configured()) {
      console.error('[KYC UPLOAD] Cloudflare R2 is not configured — check env vars.');
      return NextResponse.json({ error: 'File storage is not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const label = (formData.get('label') as string) || 'kyc_doc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const key = buildObjectKey(`kyc/${user.id}`, label, file.name);

    const url = await uploadBufferToR2(buffer, key, file.type || 'application/octet-stream');

    return NextResponse.json({ url });
  } catch (err) {
    console.error('KYC upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
