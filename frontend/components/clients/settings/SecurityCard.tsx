import SettingsSection from "./SettingsSection";

interface Props {
  kycVerified: boolean;
  fatcaCompleted: boolean;
}

export default function SecurityCard({
  kycVerified,
  fatcaCompleted,
}: Props) {
  return (
    <SettingsSection title="Compliance">

      <div className="space-y-3">

        <p>KYC: {kycVerified ? "Verified" : "Pending"}</p>

        <p>FATCA: {fatcaCompleted ? "Completed" : "Pending"}</p>

      </div>

    </SettingsSection>
  );
}