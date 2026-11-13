"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type ActionState = {
  success: boolean;
  error?: string;
};

type CreateHolidayInput = {
  title: string;
  date?: Date | string;
  dates?: Array<Date | string>;
  isFullDay: boolean;
};

type UpdateHolidayInput = {
  id: number;
  title: string;
  date: Date;
  isFullDay: boolean;
};

export async function createHoliday(
  _prevState: ActionState,
  data: CreateHolidayInput,
): Promise<ActionState> {
  try {
    const title = data.title?.trim();

    if (!title) {
      return {
        success: false,
        error: "Holiday title is required.",
      };
    }

    // Accept either a single date or a list of dates.
    const inputDates: Array<Date | string> = data.dates?.length
      ? data.dates
      : data.date
        ? [data.date]
        : [];

    if (inputDates.length === 0) {
      return {
        success: false,
        error: "Please select at least one holiday date.",
      };
    }

    const uniqueDates = new Set(inputDates);

    if (uniqueDates.size !== inputDates.length) {
      return {
        success: false,
        error: "Duplicate holiday dates were selected.",
      };
    }

    const normalizedDates = inputDates.map((value) => {
      let dateString: string;

      if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
          throw new Error("Invalid holiday date.");
        }

        // Use the local calendar date to avoid timezone shifts.
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        dateString = `${year}-${month}-${day}`;
      } else {
        dateString = value;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error("Invalid holiday date.");
      }

      const date = new Date(`${dateString}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== dateString
      ) {
        throw new Error("Invalid holiday date.");
      }

      const dayOfWeek = date.getUTCDay();
      const dayOfMonth = date.getUTCDate();

      const isSunday = dayOfWeek === 0;
      const isSecondSaturday =
        dayOfWeek === 6 && dayOfMonth >= 8 && dayOfMonth <= 14;

      if (isSunday || isSecondSaturday) {
        throw new Error(
          `Cannot create a holiday on a Sunday or second Saturday (${dateString}).`,
        );
      }

      return date;
    });

    await prisma.$transaction(
      normalizedDates.map((date) =>
        prisma.holiday.create({
          data: {
            title,
            date,
            isFullDay: data.isFullDay,
          },
        }),
      ),
    );

    revalidatePath("/admin/holidays");

    return { success: true };
  } catch (error) {
    console.error("❌ createHoliday:", error);

    return {
      success: false,
      error:
        error instanceof Error &&
        (error.message === "Invalid holiday date." ||
          error.message.startsWith("Cannot create a holiday"))
          ? error.message
          : "Failed to create holiday dates.",
    };
  }
}

export async function updateHoliday(
  _prevState: ActionState,
  data: UpdateHolidayInput,
): Promise<ActionState> {
  try {
    if (!Number.isInteger(data.id) || data.id <= 0) {
      return {
        success: false,
        error: "Invalid holiday id.",
      };
    }

    const title = data.title?.trim();

    if (!title) {
      return {
        success: false,
        error: "Holiday title is required.",
      };
    }

    if (Number.isNaN(new Date(data.date).getTime())) {
      return {
        success: false,
        error: "Invalid holiday date.",
      };
    }

    await prisma.holiday.update({
      where: {
        id: data.id,
      },
      data: {
        title,
        date: data.date,
        isFullDay: data.isFullDay,
      },
    });

    revalidatePath("/admin/holidays");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ updateHoliday:", error);

    return {
      success: false,
      error: "Failed to update holiday.",
    };
  }
}

export async function deleteHoliday(id: number): Promise<ActionState> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "Invalid holiday id.",
      };
    }

    await prisma.holiday.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/holidays");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ deleteHoliday:", error);

    return {
      success: false,
      error: "Failed to delete holiday.",
    };
  }
}
