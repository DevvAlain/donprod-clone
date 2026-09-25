import { AdminShell } from "@/components/admin/AdminShell";
import { TvcManager } from "@/components/admin/TvcManager";

export default function AdminTvcPage() {
  return (
    <AdminShell title="TVC">
      <TvcManager />
    </AdminShell>
  );
}
