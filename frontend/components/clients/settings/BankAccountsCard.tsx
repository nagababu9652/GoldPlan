import SettingsSection from "./SettingsSection";

import { BankAccount } from "./types";

interface Props {
  accounts: BankAccount[];
}

export default function BankAccountsCard({
  accounts,
}: Props) {
  return (
    <SettingsSection title="Bank Accounts">

      <div className="space-y-4">

        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-lg border p-4"
          >
            <p className="font-medium">
              {account.bankName}
            </p>

            <p>{account.accountNumber}</p>

            <p>{account.ifsc}</p>
          </div>
        ))}

      </div>

    </SettingsSection>
  );
}