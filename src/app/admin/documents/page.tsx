"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Download, Eye, Trash2, Edit2, Plus,
  Search, X, UploadCloud, Globe, EyeOff, RefreshCw,
  FileImage, File, CheckCircle,
} from "lucide-react";

interface Doc {
  id: string;
  title: string;
  description?: string;
  type: "FILE" | "CONTENT";
  fileUrl?: string | null;
  fileName?: string | null;
  content?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"FILE" | "CONTENT">("FILE");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/documents?page=${page}&search=${encodeURIComponent(search)}&limit=10`);
      const data = await res.json();
      setDocs(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast({ variant: "destructive", title: "Failed to load documents" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [page, search]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setType("FILE");
    setFile(null);
    setContent("");
    setIsPublished(true);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (doc: Doc) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDescription(doc.description || "");
    setType(doc.type);
    setContent(doc.content || "");
    setIsPublished(doc.isPublished);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast({ variant: "destructive", title: "Title is required" }); return; }
    if (type === "FILE" && !file && !editingId) { toast({ variant: "destructive", title: "Please select a file" }); return; }
    if (type === "CONTENT" && !content.trim()) { toast({ variant: "destructive", title: "Content cannot be empty" }); return; }

    setSubmitting(true);
    try {
      let res: Response;
      if (editingId) {
        res = await fetch("/api/admin/documents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, title, description, content, isPublished }),
        });
      } else {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("description", description);
        fd.append("type", type);
        fd.append("isPublished", String(isPublished));
        if (type === "FILE" && file) fd.append("file", file);
        if (type === "CONTENT") fd.append("content", content);
        res = await fetch("/api/admin/documents", { method: "POST", body: fd });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      toast({
        title: editingId ? "Document updated!" : "Document created!",
        description: isPublished ? "✅ Published — visible to members" : "⏸ Saved as draft",
      });
      resetForm();
      fetchDocs();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (doc: Doc) => {
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, title: doc.title, description: doc.description, content: doc.content, isPublished: !doc.isPublished }),
      });
      if (!res.ok) throw new Error("Failed");
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, isPublished: !d.isPublished } : d));
      toast({ title: !doc.isPublished ? "✅ Published — now visible to members" : "⏸ Unpublished — hidden from members" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/documents?id=${id}`, { method: "DELETE" });
      setDocs(prev => prev.filter(d => d.id !== id));
      toast({ title: "Document deleted" });
    } catch {
      toast({ variant: "destructive", title: "Delete failed" });
    }
  };

  const handleDownload = async (doc: Doc) => {
    if (!doc.fileUrl) return;
    try {
      const res = await fetch(doc.fileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName || doc.title || "document";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "Download failed" });
    }
  };

  const getFileType = (doc: Doc) => {
    const src = doc.fileName || doc.fileUrl || "";
    if (src.match(/\.(pdf)$/i)) return "pdf";
    if (src.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return "image";
    return "other";
  };

  const FileIcon = ({ doc }: { doc: Doc }) => {
    const ft = getFileType(doc);
    if (ft === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
    if (ft === "image") return <FileImage className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents & Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload files or write content. Published items appear in the Members Documents Hub.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocs}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Document
          </Button>
        </div>
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="border rounded-xl p-6 bg-muted/30 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">{editingId ? "Edit Document" : "Create New Document"}</h2>
            <button onClick={resetForm}><X className="h-5 w-5" /></button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q1 2025 Fund Report" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              {!editingId ? (
                <select className="w-full border rounded-md p-2 bg-background text-sm"
                  value={type} onChange={e => setType(e.target.value as any)}>
                  <option value="FILE">📎 File Upload (PDF, Word, Excel, Image…)</option>
                  <option value="CONTENT">📝 Written Content / Notice</option>
                </select>
              ) : (
                <div className="border rounded-md p-2 bg-muted text-sm text-muted-foreground">{type} (cannot change type when editing)</div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description visible to members" rows={2} />
          </div>

          {type === "FILE" && !editingId && (
            <div className="space-y-1">
              <label className="text-sm font-medium">File *</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <input ref={fileInputRef} type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.csv"
                  className="block w-full text-sm"
                  onChange={e => setFile(e.target.files?.[0] || null)} />
                {file && <p className="text-sm text-green-600 mt-2">✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
              </div>
            </div>
          )}

          {type === "CONTENT" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Content *</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Write your notice, announcement or content here..." rows={6} />
            </div>
          )}

          {/* Publish toggle */}
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <div>
              <p className="text-sm font-medium">{isPublished ? "✅ Published" : "⏸ Draft"}</p>
              <p className="text-xs text-muted-foreground">
                {isPublished ? "Members can see this in Documents Hub" : "Hidden — only visible to admins"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Create Document"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search documents…"
          value={search} onChange={e => { setPage(1); setSearch(e.target.value); }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: docs.length },
          { label: "Published", value: docs.filter(d => d.isPublished).length, color: "text-green-600" },
          { label: "Drafts", value: docs.filter(d => !d.isPublished).length, color: "text-orange-500" },
        ].map(stat => (
          <div key={stat.label} className="border rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${stat.color || ""}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">No documents yet</p>
          <p className="text-sm text-muted-foreground">Click "New Document" to upload your first file or write content.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="border rounded-xl p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
              
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {doc.type === "CONTENT" ? <FileText className="h-5 w-5 text-purple-500" /> : <FileIcon doc={doc} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{doc.title}</p>
                  <Badge variant={doc.type === "FILE" ? "outline" : "secondary"} className="text-xs">
                    {doc.type === "FILE" ? (doc.fileName?.split(".").pop()?.toUpperCase() || "FILE") : "CONTENT"}
                  </Badge>
                  <Badge
                    className={`text-xs ${doc.isPublished ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}
                    variant="outline"
                  >
                    {doc.isPublished ? "● Published" : "○ Draft"}
                  </Badge>
                </div>
                {doc.description && <p className="text-sm text-muted-foreground mt-0.5 truncate">{doc.description}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(doc.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setPreviewDoc(doc)} title="Preview">
                  <Eye className="h-4 w-4" />
                </Button>
                {doc.fileUrl && (
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)} title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost"
                  onClick={() => handleTogglePublish(doc)}
                  title={doc.isPublished ? "Unpublish" : "Publish"}
                  className={doc.isPublished ? "text-green-600" : "text-orange-500"}
                >
                  {doc.isPublished ? <Globe className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(doc)} title="Edit">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} title="Delete"
                  className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="font-bold text-lg">{previewDoc.title}</h2>
                {previewDoc.description && <p className="text-sm text-muted-foreground">{previewDoc.description}</p>}
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 rounded hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {previewDoc.type === "CONTENT" && (
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                  {previewDoc.content}
                </div>
              )}
              {previewDoc.type === "FILE" && previewDoc.fileUrl && (
                <>
                  {getFileType(previewDoc) === "image" && (
                    <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-w-full max-h-[60vh] mx-auto object-contain rounded" />
                  )}
                  {getFileType(previewDoc) === "pdf" && (
                    <iframe src={previewDoc.fileUrl} className="w-full h-[60vh] rounded" />
                  )}
                  {getFileType(previewDoc) === "other" && (
                    <div className="text-center py-10">
                      <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
                      <Button onClick={() => handleDownload(previewDoc)}>
                        <Download className="h-4 w-4 mr-2" /> Download {previewDoc.fileName}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
