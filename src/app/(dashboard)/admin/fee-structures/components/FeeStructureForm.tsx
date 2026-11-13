"use client";

import { useEffect, useTransition } from "react";
import { toast } from "react-toastify";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FeeStructureFormInput,
  FeeStructureFormValues,
  feeStructureSchema,
} from "@/lib/formValidationSchemas";

import FormInput from "@/components/ui/form/FormInput";
import FormSelect, { SelectOption } from "@/components/ui/form/FormSelect";
import FormSection from "@/components/ui/form/FormSection";

interface FeeStructureFormProps {
  mode: "create" | "edit";
  initialData?: FeeStructureFormValues;
  classOptions: SelectOption[];
  loading?: boolean;
  onSubmit: (values: FeeStructureFormValues) => void | Promise<void>;
}

const DEFAULT_ADMISSION_FEE = 11500;

const defaultValues: FeeStructureFormInput = {
  classId: undefined,
  title: "",
  annualFee: 0,
  admissionFee: DEFAULT_ADMISSION_FEE,
  isActive: true,
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function FeeStructureForm({
  mode,
  initialData,
  classOptions,
  loading = false,
  onSubmit,
}: FeeStructureFormProps) {
  const [isPending, startTransition] = useTransition();

  const disabled = loading || isPending;

  const form = useForm<FeeStructureFormInput, any, FeeStructureFormValues>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: initialData ?? defaultValues,
  });

  const annualFee = useWatch({
    control: form.control,
    name: "annualFee",
  });

  const admissionFee = useWatch({
    control: form.control,
    name: "admissionFee",
  });

  const totalAnnualFee = Math.max(0, Number(annualFee) || 0);
  const includedAdmissionFee = Math.max(0, Number(admissionFee) || 0);

  const remainingFee = Math.max(0, totalAnnualFee - includedAdmissionFee);

  const termFee = remainingFee / 2;

  useEffect(() => {
    form.reset(initialData ?? defaultValues);
  }, [initialData, form]);

  const handleSubmit = (values: FeeStructureFormValues) => {
    if (disabled) return;

    if (values.admissionFee > values.annualFee) {
      form.setError("admissionFee", {
        type: "validate",
        message: "Admission fee cannot exceed the total annual fee.",
      });
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit(values);
      } catch {
        toast.error("Failed to save fee structure.");
      }
    });
  };

  return (
    <form
      id="fee-structure-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-2 pb-1"
    >
      <FormSection
        title="Fee Structure"
        description={
          mode === "create"
            ? "Create the total annual fee structure for a class."
            : "Update the total annual fee structure for this class."
        }
      >
        <FormSelect
          control={form.control}
          name="classId"
          label="Class"
          placeholder="Select class"
          required
          options={classOptions}
          valueAsNumber
          emptyTitle="No Classes Available"
          emptyDescription="Create a class before creating a fee structure."
          disabled={disabled}
        />

        <FormInput
          control={form.control}
          name="title"
          label="Fee Title"
          placeholder="e.g. Grade 2 Annual Fee"
          required
          disabled={disabled}
        />

        <FormInput
          control={form.control}
          name="annualFee"
          label="Total Annual Fee"
          type="number"
          min={1}
          placeholder="80000"
          required
          disabled={disabled}
        />

        <FormInput
          control={form.control}
          name="admissionFee"
          label="Admission Fee (Included)"
          type="number"
          min={0}
          placeholder="11500"
          required
          disabled={disabled}
        />

        <div className="col-span-full space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
          <p className="text-xs leading-5 text-slate-600">
            <span className="font-semibold text-indigo-600">Important:</span>{" "}
            The admission fee is included in the total annual fee. It is
            deducted first; only the remaining balance is split between Term 1
            and Term 2. It is not added again.
          </p>

          <div className="space-y-2 rounded-md border border-indigo-100 bg-white p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Total annual fee</span>
              <span className="font-semibold text-slate-900">
                {formatINR(totalAnnualFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Admission fee (included)</span>
              <span className="font-medium text-slate-900">
                − {formatINR(includedAdmissionFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2 text-sm">
              <span className="text-slate-600">Remaining fee</span>
              <span className="font-semibold text-slate-900">
                {formatINR(remainingFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Term 1 (estimated)</span>
              <span className="font-medium text-slate-900">
                {formatINR(termFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Term 2 (estimated)</span>
              <span className="font-medium text-slate-900">
                {formatINR(termFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-indigo-100 pt-2">
              <span className="font-semibold text-slate-900">
                Total payable
              </span>
              <span className="text-lg font-bold text-indigo-700">
                {formatINR(totalAnnualFee)}
              </span>
            </div>
          </div>

          {includedAdmissionFee > totalAnnualFee && (
            <p className="text-xs font-medium text-red-600">
              Admission fee cannot exceed the total annual fee.
            </p>
          )}
        </div>
      </FormSection>
    </form>
  );
}
