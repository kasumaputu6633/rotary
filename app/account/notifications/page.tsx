import { requireRole } from "@/lib/auth";
import { getNotificationPreferences } from "@/lib/notifications";
import {
  AccountPageHeader,
  AccountPanel,
} from "../_components/AccountUi";
import { NotificationSettings } from "./_components/NotificationSettings";

export default async function AccountNotificationsPage() {
  const user = await requireRole("user");
  const preferences = await getNotificationPreferences(user.id);

  return (
    <div className="grid gap-5">
      <AccountPageHeader
        icon="lucide:bell-ring"
        title="Notifikasi"
        description="Atur kabar akun, keamanan, dan aktivitas marketplace yang ingin kamu terima."
      />

      <AccountPanel
        title="Preferensi notifikasi"
        description="Pilih kabar marketplace yang ingin kamu terima. Perubahan langsung tersimpan."
      >
        <NotificationSettings initialPreferences={preferences} />
      </AccountPanel>
    </div>
  );
}
