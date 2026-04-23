"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHero from "@/components/PageHero";
import { FileText, Download, Eye, ArrowUpRight } from "lucide-react";

const PdfDocument = dynamic(() => import("react-pdf").then((m) => m.Document), { ssr: false });
const PdfPage = dynamic(() => import("react-pdf").then((m) => m.Page), { ssr: false });

interface DocumentType {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  content?: string;
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

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/documents", { cache: "no-store" });
        const text = await res.text();
        const data = JSON.parse(text);

        if (!res.ok) throw new Error(data.message || "Failed to fetch documents");
        if (!Array.isArray(data)) throw new Error("Invalid response format");

        setDocuments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  const getFileType = (url?: string) => {
    if (!url) return "unknown";
    if (url.includes(".pdf")) return "pdf";
    if (url.match(/\.(jpg|jpeg|png|webp|gif)/)) return "image";
    if (url.match(/\.(mp4|webm|mov)/)) return "video";
    return "unknown";
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
          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center py-20 animate-pulse">
              <div className="w-16 h-16 bg-primary/20 rounded-xl mb-4" />
              <p className="text-muted-foreground">Fetching documents...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="text-center py-16 text-red-500">{error}</div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && documents.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-lg font-medium">No documents yet</p>
              <p className="text-muted-foreground text-sm">
                Documents will appear here once uploaded
              </p>
            </div>
          )}

          {/* DOCUMENT GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {documents.map((doc, i) => {
              const fileType = getFileType(doc.fileUrl);
              const color = folderColors[i % folderColors.length];

              return (
                <motion.div
                  key={doc.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group relative cursor-pointer"
                >
                  {/* FOLDER SHAPE */}
                  <div className="relative">
                    {/* Folder tab */}
                    <div
                      className={`absolute -top-3 left-6 w-24 h-6 rounded-t-lg bg-gradient-to-r ${color} opacity-90`}
                    />

                    {/* Main folder body */}
                    <div
                      className={`rounded-2xl p-6 pt-10 bg-gradient-to-br ${color} text-white shadow-lg group-hover:shadow-2xl transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <FileText className="h-10 w-10 opacity-90" />
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {fileType.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                        {doc.title}
                      </h3>

                      {doc.description && (
                        <p className="text-sm text-white/80 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* HOVER ACTIONS */}
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {fileType === "pdf" && (
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center gap-2 text-white font-medium hover:scale-105 transition"
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </button>
                    )}

                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        className="flex items-center gap-2 text-white font-medium hover:scale-105 transition"
                      >
                        <Download className="h-4 w-4" /> Open File
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* PDF MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-background rounded-xl w-full max-w-4xl p-4 relative shadow-2xl">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-4 right-4 text-sm"
            >
              ✕
            </button>
            <div className="overflow-auto max-h-[80vh]">
              <PdfDocument file={previewDoc.fileUrl}>
                <PdfPage pageNumber={1} />
              </PdfDocument>
            </div>
          </div>
        </div>
      )}
    </>
  );
}