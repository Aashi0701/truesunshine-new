import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

const REQUIRED_DOCUMENTS = [
  {
    type: DocumentType.BIRTH_CERTIFICATE,
    title: "Birth Certificate",
  },
  {
    type: DocumentType.STUDENT_AADHAAR,
    title: "Student Aadhaar",
  },
  {
    type: DocumentType.STUDENT_PHOTO,
    title: "Student Photo",
  },
  {
    type: DocumentType.TRANSFER_CERTIFICATE,
    title: "Transfer Certificate",
  },
  {
    type: DocumentType.PARENT_AADHAAR,
    title: "Parent Aadhaar",
  },
  {
    type: DocumentType.ADDRESS_PROOF,
    title: "Address Proof",
  },
  {
    type: DocumentType.MEDICAL_CERTIFICATE,
    title: "Medical Certificate",
  },
] as const;

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        admissionNo: true,
        name: true,
        surname: true,
        img: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 },
      );
    }

    const uploadedDocuments = await prisma.studentDocument.findMany({
      where: { studentId: id },
      orderBy: { uploadedAt: "desc" },
    });

    const documents = REQUIRED_DOCUMENTS.map((required) => {
      // Student Photo is stored on Student.img during admission.
      if (required.type === DocumentType.STUDENT_PHOTO) {
        if (!student.img) {
          return {
            id: 0,
            title: required.title,
            type: required.type,
            status: "MISSING" as const,
          };
        }

        return {
          id: 0,
          title: required.title,
          type: required.type,
          status: "UPLOADED" as const,
          originalFileName: "Student Photo",
          publicId: "",
          fileUrl: student.img,
          uploadedAt: null,
        };
      }

      const document = uploadedDocuments.find(
        (item) => item.documentType === required.type,
      );

      if (!document) {
        return {
          id: 0,
          title: required.title,
          type: required.type,
          status: "MISSING" as const,
        };
      }

      return {
        id: document.id,
        title: required.title,
        type: required.type,
        status: "UPLOADED" as const,
        originalFileName: document.originalFileName,
        publicId: document.publicId,
        fileUrl: document.fileUrl,
        uploadedAt: document.uploadedAt,
      };
    });

    const uploaded = documents.filter(
      (document) => document.status === "UPLOADED",
    ).length;

    const missing = documents.length - uploaded;

    return NextResponse.json({
      success: true,
      summary: {
        uploaded,
        missing,
        total: documents.length,
      },
      documents,
    });
  } catch (error) {
    console.error("Failed to load student documents:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load documents." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const formData = await request.formData();

    const documentType = formData.get("documentType") as string;

    console.log("POST Student:", id);
    console.log("POST Document Type:", documentType);

    const file = formData.get("file") as File | null;

    if (!documentType || !file) {
      return NextResponse.json(
        {
          success: false,
          message: "Document type and file are required.",
        },
        {
          status: 400,
        },
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ---------------------------------------------------
    // TODO
    // Upload file to Cloudinary / Azure / AWS S3
    // ---------------------------------------------------

    // Example
    //
    // const upload = await uploadToCloudinary(file)
    //
    // const fileUrl = upload.secure_url

    const fileUrl = `/uploads/${file.name}`;

    const existing = await prisma.studentDocument.findFirst({
      where: {
        studentId: id,
        documentType: documentType as DocumentType,
      },
    });

    if (existing) {
      const updated = await prisma.studentDocument.update({
        where: {
          id: existing.id,
        },
        data: {
          originalFileName: file.name,
          fileUrl,
          publicId: "...",
          uploadedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Document replaced successfully.",
        document: updated,
      });
    }

    const document = await prisma.studentDocument.create({
      data: {
        studentId: id,
        documentType: documentType as DocumentType,
        originalFileName: file.name,
        fileUrl,
        publicId: "...",
        uploadedBy: "Admin",
      },
    });

    const verify = await prisma.studentDocument.findMany({
      where: {
        studentId: id,
      },
    });

    console.log("Documents after upload");
    console.log(verify);

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      document,
    });
  } catch (error) {
    console.error("DOCUMENT API ERROR");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
