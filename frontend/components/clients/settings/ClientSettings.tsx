import RiskProfileCard from "./RiskProfileCard";
import PreferencesCard from "./PreferencesCard";
import SecurityCard from "./SecurityCard";
import BankAccountsCard from "./BankAccountsCard";
import NomineesCard from "./NomineesCard";
import DangerZoneCard from "./DangerZoneCard";

import { ClientSettings as Settings } from "./types";

interface Props {
  settings: Settings;
}

export default function ClientSettings({
  settings,
}: Props) {
  return (
    <div className="space-y-6">

      <RiskProfileCard
        riskProfile={settings.riskProfile}
      />

      <PreferencesCard
        communicationMode={settings.communicationMode}
      />

      <SecurityCard
        kycVerified={settings.kycVerified}
        fatcaCompleted={settings.fatcaCompleted}
      />

      <BankAccountsCard
        accounts={settings.bankAccounts}
      />

      <NomineesCard
        nominees={settings.nominees}
      />

      <DangerZoneCard />

    </div>
  );
}