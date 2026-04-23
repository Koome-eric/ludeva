import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// POST /api/admin/team-analytics
// Body: multipart/form-data  { file: File, label: string }
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const label = (formData.get('label') as string | null)?.trim();

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 });

    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      return NextResponse.json(
        { error: 'Only .csv, .xlsx, and .xls files are allowed' },
        { status: 400 }
      );
    }

    const fileType = ext === 'csv' ? 'csv' : 'xlsx';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let headers: string[] = [];
    let dataRows: string[][] = [];

    if (fileType === 'csv') {
      const text = buffer.toString('utf-8');
      const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
      const [headerRow, ...rest] = result.data as string[][];
      headers = headerRow.map(String);
      dataRows = rest.map((row) => row.map(String));
    } else {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const [headerRow, ...rest] = json;
      headers = headerRow.map(String);
      dataRows = rest.filter((row) => row.some((cell) => String(cell).trim() !== '')).map((row) => row.map(String));
    }

    if (headers.length === 0) {
      return NextResponse.json({ error: 'File appears to be empty or unreadable' }, { status: 400 });
    }

    // Store parsed data — we skip uploading the raw file to external storage
    // for simplicity (no UploadThing dependency). The parsed JSON is enough
    // to render the table. If you want file download links, integrate UploadThing here.
    const record = await prisma.teamAnalytics.create({
      data: {
        label,
        fileName,
        fileUrl: '', // set this if you wire up file storage
        fileType,
        headers,
        rows: JSON.stringify(dataRows),
        uploadedById: admin.id,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('[TEAM ANALYTICS UPLOAD ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/team-analytics  — list all uploads (admin)
export async function GET() {
  try {
    await requireAdmin();
    const records = await prisma.teamAnalytics.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        label: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        uploadedBy: { select: { fullName: true, email: true } },
      },
    });
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}