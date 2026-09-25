import { AdminShell } from "@/components/admin/AdminShell";
import { ContactManager } from "@/components/admin/ContactManager";

export default function AdminContactPage() {
  return (
    <AdminShell title="Contact">
      <ContactManager />
    </AdminShell>
  );
}
