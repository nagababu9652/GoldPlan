import SettingsSection from "./SettingsSection";

interface Props {
  communicationMode: string;
}

export default function PreferencesCard({
  communicationMode,
}: Props) {
  return (
    <SettingsSection title="Communication Preferences">

      <div className="flex justify-between">

        <span>Preferred Mode</span>

        <strong>{communicationMode}</strong>

      </div>

    </SettingsSection>
  );
}