"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHero from "@/components/PageHero";
import { FileText, Download, Eye } from "lucide-react";


interface DocumentType {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  content?: string;
  type?: "FILE" | "CONTENT";
}

export default function DocumentsSection() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentType | null>(null);
  const [error, setError] = useState("");

  const folderColors = [
    "from-yellow-400 to-yellow-500",
    "from-blue-400 to-blue-500",
    "from-purple-400 to-purple-500",
    "from-green-400 to-green-500",
    "from-pink-400 to-pink-500",
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Use server proxy to trigger reliable downloads (handles CORS/headers)
  const handleDownload = (doc: DocumentType) => {
    if (!doc.id) return;
    // navigate to server download endpoint which redirects to Cloudinary with attachment
    window.location.href = `/api/documents/download?id=${encodeURIComponent(doc.id)}`;
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/documents", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch");

        setDocuments(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // FILE TYPE DETECTION
  const getFileType = (doc: DocumentType) => {
    const source = doc.fileName || doc.fileUrl || "";

    if (source.match(/\.pdf$/i)) return "pdf";
    if (source.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return "image";
    if (source.match(/\.(mp4|webm|mov)$/i)) return "video";

    return "other";
  };

  return (
    <>
      <PageHero
        title="Investor Documents & Compliance"
        description="Transparency, regulatory compliance, and full disclosure at Ludeva."
        imageSrc="/images/hero-mmf.png"
      />

      <section className="py-20 md:py-28">
        <Container>
          {/* LOADING */}
          {loading && (
            <div className="text-center py-20">Loading documents...</div>
          )}

          {/* ERROR */}
          {error && (
            <div className="text-center text-red-500 py-20">{error}</div>
          )}

          {/* EMPTY */}
          {!loading && !error && documents.length === 0 && (
            <div className="text-center py-20">
              <p>No documents available</p>
            </div>
          )}

          {/* GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {documents.map((doc, i) => {
              const fileType = getFileType(doc);
              const color = folderColors[i % folderColors.length];

              return (
                <motion.div
                  key={doc.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  whileHover={{ y: -6 }}
                  className="group relative"
                >
                  {/* CARD */}
                  <div
                    className={`rounded-2xl p-6 bg-gradient-to-br ${color} text-white`}
                  >
                    <div className="flex justify-between mb-4">
                      <FileText />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {fileType.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm opacity-80">{doc.description}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 opacity-0 group-hover:opacity-100 transition">
                    
                    {/* PREVIEW */}
                    {(fileType === "pdf" || fileType === "image") && (
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="text-white flex items-center gap-2"
                      >
                        <Eye size={16} /> Preview
                      </button>
                    )}

                    {/* DOWNLOAD */}
                    {doc.fileUrl && (
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-white flex items-center gap-2"
                      >
                        <Download size={16} /> Download
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 rounded max-w-3xl w-full relative">

            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-2 right-2"
            >
              ✕
            </button>

            {/* PDF */}
            {getFileType(previewDoc) === "pdf" && (
              <div className="w-full">
                <iframe
                  src={`/api/documents/preview?id=${encodeURIComponent(
                    previewDoc.id
                  )}`}
                  className="w-full h-[70vh]"
                  title={previewDoc.title}
                />
              </div>
            )}

            {/* IMAGE */}
            {getFileType(previewDoc) === "image" && (
              <img
                src={`/api/documents/preview?id=${encodeURIComponent(previewDoc.id)}`}
                className="w-full max-h-[70vh] object-contain"
              />
            )}

            {/* OTHER */}
            {getFileType(previewDoc) === "other" && (
              <div className="text-center space-y-4">
                <p>No preview available</p>

                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="text-blue-600 underline"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}