import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return <AdminShell title="New project"><ProjectForm /></AdminShell>;
}
