import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedDocuments = documents.map((doc) => ({
      id: doc.id.toString(),
      title: doc.title,
      description: doc.description ?? null,
      fileUrl: doc.fileUrl ?? null,
      content: doc.content ?? null,
    }));

    return NextResponse.json(formattedDocuments);

  } catch (error: any) {
    console.error("DOCUMENT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error fetching documents",
        error: error.message,
      },
      { status: 500 }
    );
  }
}