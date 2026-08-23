'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  User,
} from 'lucide-react';

type AnalyticsRecord = {
  id: string;
  label: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  uploadedBy: { fullName: string | null; email: string };
};

export default function AdminTeamAnalyticsPage() {
  const [records, setRecords] = useState<AnalyticsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team-analytics');
      if (res.ok) setRecords(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file || !label.trim()) {
      setStatus({ type: 'error', message: 'Please provide a label and select a file.' });
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setStatus({ type: 'error', message: 'Only .csv, .xlsx, or .xls files are accepted.' });
      return;
    }

    setUploading(true);
    setStatus(null);

    const form = new FormData();
    form.append('file', file);
    form.append('label', label.trim());

    try {
      const res = await fetch('/api/admin/team-analytics', { method: 'POST', body: form });
      if (res.ok) {
        setStatus({ type: 'success', message: 'Analytics uploaded successfully. It is now live on the L Chama page.' });
        setFile(null);
        setLabel('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchRecords();
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error ?? 'Upload failed.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analytics record? It will no longer appear on the L Chama page.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/team-analytics/${id}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">L Chama Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload a CSV or Excel file. The most recent upload will automatically appear as a table
          in the <strong>L Chama</strong> page under "L Chama Analytics".
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-600" />
          Upload New Analytics File
        </h2>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Report Label <span className="text-red-500">*</span>
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. May 2025 L Chama Analytics"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* File picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            File <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-gray-400 font-normal">(.csv, .xlsx, .xls)</span>
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-emerald-600' : 'text-gray-400'}`} />
            {file ? (
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Click to browse or drag and drop</p>
                <p className="text-xs text-gray-400 mt-0.5">CSV, XLSX, or XLS up to 10 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
          }`}>
            {status.type === 'success'
              ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {status.message}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !label.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & Parsing...</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload Analytics</>
          )}
        </button>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Upload History</h2>
          <button
            onClick={fetchRecords}
            className="text-gray-400 hover:text-emerald-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No analytics uploaded yet. Upload your first file above.
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec, i) => (
              <div
                key={rec.id}
                className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${
                  i === 0
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className={`w-5 h-5 mt-0.5 flex-shrink-0 ${i === 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.label}</p>
                      {i === 0 && (
                        <span className="text-[10px] font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{rec.fileName} · {rec.fileType.toUpperCase()}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(rec.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {rec.uploadedBy.fullName ?? rec.uploadedBy.email}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rec.id)}
                  disabled={deletingId === rec.id}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                  title="Delete"
                >
                  {deletingId === rec.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 text-center">
        💡 The <strong>most recently uploaded</strong> file is always what appears on the public L Chama page.
        To update, simply upload a new file — old records are kept as history.
      </p>
    </div>
  );
}
