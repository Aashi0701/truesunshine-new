import { DocumentType, Prisma } from "@prisma/client";

import type { StudentRegistrationFormValues } from "@/lib/formValidationSchemas";
import type { UploadedDocument } from "@/types/document";

export async function saveStudentDocuments(
  tx: Prisma.TransactionClient,
  studentId: string,
  documents: StudentRegistrationFormValues["documents"],
  uploadedBy?: string,
) {
  const items: {
    documentType: DocumentType;
    document?: UploadedDocument;
  }[] = [
    {
      documentType: DocumentType.BIRTH_CERTIFICATE,
      document: documents.birthCertificate,
    },
    {
      documentType: DocumentType.STUDENT_AADHAAR,
      document: documents.studentAadhaar,
    },
    {
      documentType: DocumentType.TRANSFER_CERTIFICATE,
      document: documents.transferCertificate,
    },
    {
      documentType: DocumentType.PARENT_AADHAAR,
      document: documents.parentAadhaar,
    },
    {
      documentType: DocumentType.ADDRESS_PROOF,
      document: documents.addressProof,
    },
    {
      documentType: DocumentType.MEDICAL_CERTIFICATE,
      document: documents.medicalCertificate,
    },
  ];

  for (const item of items) {
    if (!item.document) {
      continue;
    }

    await tx.studentDocument.upsert({
      where: {
        studentId_documentType: {
          studentId,
          documentType: item.documentType,
        },
      },
      create: {
        studentId,
        documentType: item.documentType,
        originalFileName: item.document.originalFileName,
        fileUrl: item.document.fileUrl,
        publicId: item.document.publicId,
        folder: item.document.folder ?? null,
        mimeType: item.document.mimeType,
        fileSize: item.document.fileSize,
        uploadedBy,
      },
      update: {
        originalFileName: item.document.originalFileName,
        fileUrl: item.document.fileUrl,
        publicId: item.document.publicId,
        folder: item.document.folder ?? null,
        mimeType: item.document.mimeType,
        fileSize: item.document.fileSize,
        uploadedBy,
        uploadedAt: new Date(),
      },
    });
  }
}
