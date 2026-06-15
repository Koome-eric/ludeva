import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc || !doc.fileUrl) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Fetch the remote file and stream it back to the client with attachment headers
    const remoteRes = await fetch(doc.fileUrl);
    if (!remoteRes.ok) {
      console.error('Remote fetch failed', remoteRes.status, await remoteRes.text().catch(() => ''));
      return NextResponse.json({ error: 'Failed to fetch remote file' }, { status: 502 });
    }

    const headers: Record<string, string> = {};
    const contentType = remoteRes.headers.get('content-type') || 'application/octet-stream';
    headers['Content-Type'] = contentType;
    const filename = doc.fileName || 'document';
    headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(filename)}"`;

    return new NextResponse(remoteRes.body, { headers });
  } catch (err) {
    console.error('Download proxy error:', err);
    return NextResponse.json({ error: 'Failed to download' }, { status: 500 });
  }
}
