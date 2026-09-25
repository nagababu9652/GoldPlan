import SettingsSection from "./SettingsSection";

interface Props {
  riskProfile: string;
}

export default function RiskProfileCard({
  riskProfile,
}: Props) {
  return (
    <SettingsSection title="Risk Profile">

      <div className="flex justify-between">

        <span>Current Profile</span>

        <strong>{riskProfile}</strong>

      </div>

    </SettingsSection>
  );
}