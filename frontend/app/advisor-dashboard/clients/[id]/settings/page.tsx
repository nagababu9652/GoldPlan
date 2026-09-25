import { ClientSettings } from "@/components/clients/settings";

import { getClientSettings } from "@/components/clients/settings/api";

export default async function SettingsPage() {
  const settings = await getClientSettings();

  return (
    <ClientSettings settings={settings} />
  );
}