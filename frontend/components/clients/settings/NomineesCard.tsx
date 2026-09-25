import SettingsSection from "./SettingsSection";

import { Nominee } from "./types";

interface Props {
  nominees: Nominee[];
}

export default function NomineesCard({
  nominees,
}: Props) {
  return (
    <SettingsSection title="Nominees">

      <div className="space-y-4">

        {nominees.map((nominee) => (
          <div
            key={nominee.id}
            className="rounded-lg border p-4"
          >
            <p className="font-medium">
              {nominee.name}
            </p>

            <p>{nominee.relationship}</p>

            <p>{nominee.allocation}%</p>
          </div>
        ))}

      </div>

    </SettingsSection>
  );
}