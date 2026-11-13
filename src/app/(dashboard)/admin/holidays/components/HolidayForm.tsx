"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { CalendarDays, Clock3 } from "lucide-react";

import { createHoliday, updateHoliday } from "../actions";

import {
  holidaySchema,
  type HolidayFormInput,
  type HolidayFormValues,
} from "@/lib/formValidationSchemas";

import FormInput from "@/components/ui/form/FormInput";
import FormSelect from "@/components/ui/form/FormSelect";
import FormSection from "@/components/ui/form/FormSection";

interface HolidayFormProps {
  mode: "create" | "edit";
  initialData?: HolidayFormValues;
  onSuccess?: () => void;
}

type DateMode = "single" | "range";

const getDefaultValues = () => ({
  title: "",
  date: new Date(),
  isFullDay: "FULL" as const,
});

export default function HolidayForm({
  mode,
  initialData,
  onSuccess,
}: HolidayFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [dateMode, setDateMode] = useState<DateMode>("single");
  const [startDate, setStartDate] = useState<Date | null>(
    initialData?.date ?? new Date(),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialData?.date ?? new Date(),
  );

  const form = useForm<HolidayFormInput, unknown, HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: initialData ?? getDefaultValues(),
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset(initialData);
      setStartDate(initialData.date);
      setEndDate(initialData.date);
      setDateMode("single");
      return;
    }

    form.reset(getDefaultValues());

    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setDateMode("single");
  }, [initialData, mode, form]);

  const selectedDayCount =
    startDate && endDate && endDate >= startDate
      ? (() => {
          let count = 0;

          const cursor = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
          );

          const finalDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
          );

          while (cursor <= finalDate) {
            if (isSchoolHolidayDate(cursor)) {
              count++;
            }

            cursor.setDate(cursor.getDate() + 1);
          }

          return count;
        })()
      : 0;

  const onSubmit = (values: HolidayFormValues) => {
    if (isPending) return;

    if (!startDate) {
      toast.error("Please select a holiday date.");
      return;
    }

    if (dateMode === "range" && (!endDate || endDate < startDate)) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "edit") {
          const result = await updateHoliday(
            { success: false },
            {
              id: values.id!,
              title: values.title,
              date: startDate,
              isFullDay: values.isFullDay === "FULL",
            },
          );

          if (!result.success) {
            toast.error(result.error ?? "Failed to update holiday.");
            return;
          }

          toast.success("Holiday updated successfully.");
        } else {
          const dates: string[] = [];

          const lastDate = dateMode === "range" ? endDate! : startDate;

          const cursor = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
          );

          const finalDate = new Date(
            lastDate.getFullYear(),
            lastDate.getMonth(),
            lastDate.getDate(),
          );

          while (cursor <= finalDate) {
            if (isSchoolHolidayDate(cursor)) {
              dates.push(formatLocalDate(cursor));
            }

            cursor.setDate(cursor.getDate() + 1);
          }

          if (dates.length === 0) {
            toast.error("No eligible school holiday dates were selected.");
            return;
          }

          const result = await createHoliday(
            { success: false },
            {
              title: values.title,
              dates,
              isFullDay: values.isFullDay === "FULL",
            },
          );

          if (!result.success) {
            toast.error(result.error ?? "Failed to create holiday.");
            return;
          }

          toast.success(
            dates.length === 1
              ? "Holiday created successfully."
              : `${dates.length} holiday dates created successfully.`,
          );
        }

        form.reset(getDefaultValues());
        onSuccess?.();
        router.refresh();
      } catch {
        toast.error("Something went wrong while saving the holiday.");
      }
    });
  };

  return (
    <form
      id="holiday-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 pb-1"
    >
      <FormSection
        title="Holiday Information"
        description={
          mode === "create"
            ? "Create a single-day holiday or a multi-day holiday period."
            : "Update the details of this holiday."
        }
      >
        <FormInput
          control={form.control}
          name="title"
          label="Holiday Title"
          placeholder="e.g. Dussehra Holidays"
          required
          disabled={isPending}
        />

        {mode === "create" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Date Selection
            </label>

            <div className="inline-flex w-full items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDateMode("single")}
                className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  dateMode === "single"
                    ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                Single Day
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => setDateMode("range")}
                className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  dateMode === "range"
                    ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                Date Range
              </button>
            </div>
          </div>
        )}

        {dateMode === "single" || mode === "edit" ? (
          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays className="h-4 w-4 text-violet-500" />
                  Holiday Date
                  <span className="text-red-500">*</span>
                </label>

                <DatePicker
                  selected={field.value instanceof Date ? field.value : null}
                  onChange={(date: Date | null) => {
                    if (!date) return;

                    field.onChange(date);
                    setStartDate(date);
                    setEndDate(date);
                  }}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select holiday date"
                  disabled={isPending}
                  popperPlacement="bottom-start"
                  popperClassName="event-datepicker-popper"
                  calendarClassName="event-datepicker-calendar"
                  className="event-datepicker"
                />

                {fieldState.error && (
                  <p className="text-xs text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        ) : (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                Start Date
                <span className="text-red-500">*</span>
              </label>

              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  setStartDate(date);

                  if (date && endDate && endDate < date) {
                    setEndDate(date);
                  }
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate ?? undefined}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select start date"
                disabled={isPending}
                popperPlacement="bottom-start"
                popperClassName="event-datepicker-popper"
                calendarClassName="event-datepicker-calendar"
                className="event-datepicker"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                End Date
                <span className="text-red-500">*</span>
              </label>

              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate ?? undefined}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select end date"
                disabled={isPending}
                popperPlacement="bottom-start"
                popperClassName="event-datepicker-popper"
                calendarClassName="event-datepicker-calendar"
                className="event-datepicker"
              />
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
              <p className="text-sm font-semibold text-violet-900">
                {selectedDayCount > 0
                  ? `${selectedDayCount} calendar ${
                      selectedDayCount === 1 ? "day" : "days"
                    } selected`
                  : "Select a valid date range"}
              </p>

              <p className="mt-1 text-xs text-violet-700">
                Sundays and second Saturdays are excluded automatically. Only
                eligible school days in this range will be created as holidays.
              </p>
            </div>
          </>
        )}

        <Controller
          control={form.control}
          name="isFullDay"
          render={() => (
            <FormSelect
              control={form.control}
              name="isFullDay"
              label="Holiday Duration"
              placeholder="Select duration"
              options={[
                { value: "FULL", label: "Full Day" },
                { value: "HALF", label: "Half Day" },
              ]}
              disabled={isPending}
            />
          )}
        />
      </FormSection>

      <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
            <Clock3 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-violet-900">
              Holiday Duration
            </p>

            <p className="mt-1 text-xs leading-5 text-violet-700">
              Use Single Day for one holiday date or Date Range for school
              breaks such as Dussehra. Full Day and Half Day apply to every date
              created in the selected range.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Saving..."
          : mode === "edit"
            ? "Update Holiday"
            : dateMode === "range"
              ? `Create ${selectedDayCount > 0 ? selectedDayCount : ""} Holiday Dates`
              : "Create Holiday"}
      </button>
    </form>
  );
}

function isSchoolHolidayDate(date: Date): boolean {
  const isSunday = date.getDay() === 0;

  const isSecondSaturday =
    date.getDay() === 6 && date.getDate() >= 8 && date.getDate() <= 14;

  return !isSunday && !isSecondSaturday;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
