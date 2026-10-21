import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { mailer } from "@/lib/email";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Administrator access is required" },
        { status: 403 },
      );
    }

    let body: { studentId?: unknown; feeId?: unknown };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { studentId, feeId } = body;

    if (
      typeof studentId !== "string" ||
      !studentId.trim() ||
      typeof feeId !== "number" ||
      !Number.isSafeInteger(feeId) ||
      feeId <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Valid student and fee IDs are required" },
        { status: 400 },
      );
    }

    const studentFee = await prisma.studentFee.findFirst({
      where: {
        id: feeId as number,
        studentId,
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        status: true,
        student: {
          select: {
            name: true,
            surname: true,
            parent: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!studentFee) {
      return NextResponse.json(
        { success: false, error: "Assigned fee not found" },
        { status: 404 },
      );
    }

    const parentEmail = studentFee.student.parent?.email;

    if (!parentEmail) {
      return NextResponse.json(
        { success: false, error: "Parent email is not available" },
        { status: 400 },
      );
    }

    const outstanding = Math.max(
      studentFee.totalAmount - studentFee.paidAmount,
      0,
    );

    if (studentFee.status === "PAID" || outstanding <= 0) {
      return NextResponse.json(
        { success: false, error: "This fee has already been paid" },
        { status: 400 },
      );
    }

    const studentName = [studentFee.student.name, studentFee.student.surname]
      .filter(Boolean)
      .join(" ");

    await mailer.sendMail({
      from: `"TrueSunshine School" <${process.env.SMTP_USER}>`,
      to: parentEmail,
      subject: "Outstanding Fee Reminder",
      text: [
        "Dear Parent,",
        "",
        `Your child ${studentName} has an outstanding fee of ₹${outstanding.toLocaleString("en-IN")}.`,
        "Please clear it at the earliest.",
        "",
        "Regards,",
        "TrueSunshine School",
      ].join("\n"),
      html: `
        <p>Dear Parent,</p>
        <p>Your child <strong>${escapeHtml(studentName)}</strong> has an outstanding fee of
        <strong>₹${outstanding.toLocaleString("en-IN")}</strong>.</p>
        <p>Please clear it at the earliest.</p>
        <p>Regards,<br/>TrueSunshine School</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Email reminder sent successfully.",
    });
  } catch (error) {
    console.error(
      "Email reminder failed:",
      error instanceof Error ? error.name : "Unknown error",
    );

    return NextResponse.json(
      { success: false, error: "Unable to send email reminder" },
      { status: 500 },
    );
  }
}
