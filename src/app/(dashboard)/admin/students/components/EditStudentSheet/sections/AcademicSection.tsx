"use client";

import { Control } from "react-hook-form";

import FormInput from "@/components/ui/form/FormInput";
import FormSelect from "@/components/ui/form/FormSelect";
import FormDatePicker from "@/components/ui/form/FormDatePicker";

import type { Student } from "@/types/student";

interface AcademicSectionProps {
  control: Control<Student>;
}

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Graduated", value: "GRADUATED" },
  { label: "Transferred", value: "TRANSFERRED" },
];

export default function AcademicSection({ control }: AcademicSectionProps) {
  return (
    <div className="space-y-6 px-3">
      {/* Section Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Academic Information
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Update the student's academic details.
        </p>
      </div>

      {/* Academic Details */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {/* Row 1: Three fields */}
        <div className="min-w-0 lg:col-span-2">
          <FormInput
            control={control}
            name="admissionNo"
            label="Admn Number"
            placeholder="Enter admission number"
            required
          />
        </div>

        <div className="min-w-0 lg:col-span-2">
          <FormInput
            control={control}
            name="rollNo"
            label="Roll Number"
            placeholder="Enter roll number"
            required
          />
        </div>

        <div className="min-w-0 lg:col-span-2">
          <FormInput
            control={control}
            name="className"
            label="Class"
            placeholder="Enter class"
            required
          />
        </div>

        {/* Row 2: Academic Year and Status */}
        <div className="min-w-0 lg:col-span-3">
          <FormInput
            control={control}
            name="academicYear"
            label="Academic Year"
            placeholder="2026-2027"
            required
          />
        </div>

        <div className="min-w-0 lg:col-span-3">
          <FormSelect
            control={control}
            name="status"
            label="Status"
            options={statusOptions}
            placeholder="Select Status"
            required
          />
        </div>

        {/* Row 3: Full-width Admission Date */}
        <div className="min-w-0 sm:col-span-2 lg:col-span-6">
          <FormDatePicker
            control={control}
            name="admissionDate"
            label="Admission Date"
          />
        </div>
      </div>
    </div>
  );
}
