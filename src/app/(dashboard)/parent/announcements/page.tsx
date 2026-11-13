import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import ParentMobileBottomNav from "@/components/mobile/parent/ParentMobileBottomNav";
import MobileStudentDropdown from "@/components/mobile/common/MobileStudentDropdown";

import {
  ArrowLeft,
  Bell,
} from "lucide-react";

import ParentAnnouncementsClient from "./ParentAnnouncementsClient";

type Props = {
  searchParams: Promise<{
    studentId?: string;
  }>;
};

export default async function ParentAnnouncementsPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const students = await prisma.student.findMany({
    where: {
      parentId: userId,
    },
    include: {
      class: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] pb-24">
        <main className="px-4 pt-5">
          <Link
            href="/parent"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#4B517D] shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="mt-6 rounded-[22px] border border-slate-100 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7ECF8] text-[#4B517D]">
              <Bell className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-sm font-bold text-[#4B517D]">
              No children found
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              No student profiles are linked to your account.
            </p>
          </div>
        </main>

        <ParentMobileBottomNav />
      </div>
    );
  }

  const student =
    students.find((item) => item.id === params.studentId) ??
    students[0];

  const now = new Date();

  // General announcements and announcements for this student's class.
  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      publishDate: {
        lte: now,
      },
      OR: [
        { classId: null },
        { classId: student.classId },
      ],
      AND: [
        {
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: now } },
          ],
        },
      ],
    },
    include: {
      class: {
        select: {
          name: true,
        },
      },
      reads: {
        where: {
          userId,
        },
        select: {
          id: true,
          readAt: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { publishDate: "desc" },
    ],
  });

  const announcementData = announcements.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    priority: item.priority,
    publishDate: item.publishDate.toISOString(),
    expiryDate: item.expiryDate?.toISOString() ?? null,
    className: item.class?.name ?? null,
    isRead: item.reads.length > 0,
  }));

  const studentOptions = students.map((item) => ({
    id: item.id,
    name: item.name,
    surname: item.surname,
    img: item.img,
    className: item.class?.name || "Class",
  }));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FA] pb-24">
      <main className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <Link
            href={`/parent?studentId=${encodeURIComponent(student.id)}`}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <MobileStudentDropdown
            students={studentOptions}
            selectedStudentId={student.id}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-slate-950">
              Announcements
            </h1>

            <Bell className="h-5 w-5 text-[#4B517D]" />
          </div>

          <p className="mt-1 text-[10px] text-slate-400">
            School updates and important notices
          </p>
        </div>

        <ParentAnnouncementsClient
          announcements={announcementData}
        />
      </main>

      <ParentMobileBottomNav studentId={student.id} />
    </div>
  );
}