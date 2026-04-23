"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AdminDocumentsPage() {
  const { toast } = useToast();

  const [documents, setDocuments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"FILE" | "CONTENT">("FILE");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    const res = await fetch(
      `/api/admin/documents?page=${page}&search=${search}`
    );
    const data = await res.json();

    setDocuments(data.data);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, search]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);

      if (type === "FILE" && file) {
        formData.append("file", file);
      }

      if (type === "CONTENT") {
        formData.append("content", content);
      }

      const res = await fetch("/api/admin/documents", {
        method: editingId ? "PUT" : "POST",
        body: editingId
          ? JSON.stringify({ id: editingId, title, description, content })
          : formData,
      });

      if (!res.ok) throw new Error("Failed");

      toast({ title: "Success" });

      resetForm();
      fetchDocuments();
    } catch {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/documents?id=${id}`, { method: "DELETE" });
    fetchDocuments();
  };

  const handleEdit = (doc: any) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDescription(doc.description || "");
    setType(doc.type);
    setContent(doc.content || "");
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setContent("");
  };

  return (
    <div className="p-10 space-y-10">

      {/* FORM */}
      <div className="space-y-4 max-w-xl">
        <h1 className="text-2xl font-bold">
          {editingId ? "Edit Document" : "Create Document"}
        </h1>

        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="FILE">File</option>
          <option value="CONTENT">Content</option>
        </select>

        {type === "FILE" && (
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        )}

        {type === "CONTENT" && (
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
        )}

        <Button onClick={handleSubmit}>
          {editingId ? "Update" : "Create"}
        </Button>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search documents..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="max-w-md"
      />

      {/* LIST */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="border p-4 rounded flex justify-between">
            <div>
              <p className="font-semibold">{doc.title}</p>
              <p className="text-sm text-gray-500">{doc.description}</p>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => setPreviewDoc(doc)}>
                View
              </Button>

              <Button size="sm" onClick={() => handleEdit(doc)}>
                Edit
              </Button>

              <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex gap-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>

        <span>Page {page} / {totalPages}</span>

        <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      {/* MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-2xl w-full space-y-4">
            <h2 className="text-xl font-bold">{previewDoc.title}</h2>

            {previewDoc.type === "FILE" ? (
              <iframe
                src={previewDoc.fileUrl}
                className="w-full h-[400px]"
              />
            ) : (
              <p className="whitespace-pre-wrap">{previewDoc.content}</p>
            )}

            <Button onClick={() => setPreviewDoc(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}