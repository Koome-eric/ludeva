import Breadcrumb from "@/components/Common/Breadcrumb";
import DocumentsHub from "@/components/documents/documents";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents Hub | Ludeva Public Ltd",
  description:
    "Explore and access Ludeva's key documents, reports, and resources. The Documents Hub provides an organized, responsive interface for viewing, exporting, and managing Ludeva documents.",
};

const DocumentsPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Documents Hub"
        description="Access Ludeva's official documents, reports, and resources in a modern, responsive interface. View files, explore folders, and export documents conveniently."
      />
      <DocumentsHub />
    </>
  );
};

export default DocumentsPage;
