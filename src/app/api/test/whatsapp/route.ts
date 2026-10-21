import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        message: "This test endpoint is disabled in production.",
      },
      { status: 404 },
    );
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "WhatsApp test sending is disabled until an authorized recipient is configured.",
      },
      { status: 403 },
    );
  } catch (error: unknown) {
    console.error("WhatsApp test endpoint failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process the WhatsApp test request.",
      },
      { status: 500 },
    );
  }
}
