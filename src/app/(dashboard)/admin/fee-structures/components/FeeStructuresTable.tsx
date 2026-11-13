"use client";

import {
  ReceiptText,
  School,
  IndianRupee,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from "lucide-react";

import FeeStructureRowActions from "./FeeStructureRowActions";

export interface FeeStructureRow {
  id: number;
  classId: number;
  title: string;
  annualFee: number;
  admissionFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
  };
}

interface FeeStructuresTableProps {
  feeStructures: FeeStructureRow[];
  onEdit: (feeStructure: FeeStructureRow) => void;
  onDelete: (feeStructure: FeeStructureRow) => void;
  onView: (feeStructure: FeeStructureRow) => void;
}

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

export default function FeeStructuresTable({
  feeStructures,
  onEdit,
  onDelete,
  onView,
}: FeeStructuresTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {[
                { label: "Class", align: "text-left" },
                { label: "Fee Structure", align: "text-left" },
                { label: "Total Annual Fee", align: "text-right" },
                { label: "Admission Fee", align: "text-right" },
                { label: "Tution Fee", align: "text-right" },
                { label: "Status", align: "text-center" },
                { label: "Actions", align: "text-center" },
              ].map((column) => (
                <th
                  key={column.label}
                  className={`px-5 py-3 ${column.align}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {feeStructures.map((item) => {
              const totalFee = Math.max(0, item.annualFee);
              const admissionFee = Math.max(0, item.admissionFee);
              const remainingFee = Math.max(
                0,
                totalFee - admissionFee,
              );

              return (
                <tr
                  key={item.id}
                  className="group border-b border-slate-100 last:border-b-0 transition-colors duration-150 hover:bg-indigo-50/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-transform duration-150 group-hover:scale-105">
                        <School className="h-[18px] w-[18px]" />
                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {item.class.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <ReceiptText className="h-4 w-4" />
                      </div>

                      <span className="text-sm font-medium text-slate-900">
                        {item.title}
                      </span>
                    </div>
                  </td>

                  {/* Total fee: admission is already included */}
                  <td className="px-5 py-3 text-center">
                    <div className="inline-flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        {/* <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> */}
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(totalFee)}
                        </span>
                      </div>
                      {/* <span className="mt-0.5 text-[10px] text-emerald-600">
                        Total payable
                      </span> */}
                    </div>
                  </td>

                  {/* Admission fee: included, not an extra charge */}
                  <td className="px-5 py-3 text-center">
                    <div className="inline-flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-800">
                        {formatCurrency(admissionFee)}
                      </span>
                      {/* <span className="mt-0.5 text-[10px] text-slate-400">
                        Included in total
                      </span> */}
                    </div>
                  </td>

                  {/* Remaining fee after admission component */}
                  <td className="px-5 py-3 text-center">
                    <div className="inline-flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-800">
                        {formatCurrency(remainingFee)}
                      </span>
                      {/* <span className="mt-0.5 text-[10px] text-slate-400">
                        Balance after admission
                      </span> */}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-center">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        <XCircle className="h-3.5 w-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center">
                      <FeeStructureRowActions
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onView={onView}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {feeStructures.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <MoreVertical className="h-5 w-5 text-slate-400" />
                    </div>

                    <p className="text-sm font-medium text-slate-700">
                      No fee structures found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      There are no fee structure records to display.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}