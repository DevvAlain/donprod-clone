"use client";

import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  return <AdminShell title="Edit project"><ProjectForm projectId={params.id} /></AdminShell>;
}
