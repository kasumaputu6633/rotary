import {
  AccountPageHeader,
  AccountPanel,
  AccountStatusBadge,
} from "../_components/AccountUi";
import { NotificationSettings } from "./_components/NotificationSettings";

export default function AccountNotificationsPage() {
  return (
    <div className="grid gap-5">
      <AccountPageHeader
        icon="lucide:bell-ring"
        title="Notifikasi"
        description="Atur kabar akun, keamanan, dan aktivitas marketplace yang ingin kamu terima."
        actions={<AccountStatusBadge>Preview</AccountStatusBadge>}
      />

      <AccountPanel
        title="Preferensi notifikasi"
        description="Pilihan akan dapat disimpan setelah sistem notifikasi Rotary terhubung ke database."
      >
        <NotificationSettings />
      </AccountPanel>
    </div>
  );
}
