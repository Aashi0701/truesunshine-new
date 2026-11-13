"use client";

import { Control } from "react-hook-form";

import FormInput from "@/components/ui/form/FormInput";
import FormSelect from "@/components/ui/form/FormSelect";
import FormDatePicker from "@/components/ui/form/FormDatePicker";
import FormImageUpload from "@/components/ui/form/FormImageUpload";

import type { Student } from "@/types/student";

interface PersonalSectionProps {
  control: Control<Student>;
}

const genderOptions = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

const bloodGroupOptions = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

export default function PersonalSection({ control }: PersonalSectionProps) {
  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Section Header */}
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Personal Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Update the student's basic information.
        </p>
      </div>

      {/* Personal Details */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
          <FormInput
            control={control}
            name="fullName"
            label="Full Name"
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="min-w-0">
          <FormSelect
            control={control}
            name="gender"
            label="Gender"
            placeholder="Select Gender"
            options={genderOptions}
            required
          />
        </div>

        <div className="min-w-0">
          <FormSelect
            control={control}
            name="bloodType"
            label="Blood Group"
            placeholder="Select Blood Group"
            options={bloodGroupOptions}
          />
        </div>

        {/* Date of Birth */}
        <div className="min-w-0 sm:col-span-2 lg:col-span-3">
          <FormDatePicker
            control={control}
            name="birthday"
            label="Date of Birth"
          />
        </div>
      </div>

      {/* Student Photo */}
      <div className="min-w-0">
        <FormImageUpload
          control={control}
          name="image"
          label="Student Photo"
          description="Upload a student profile picture"
        />
      </div>
    </div>
  );
}
