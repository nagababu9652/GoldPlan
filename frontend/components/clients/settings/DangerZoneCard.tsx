"use client";

import { Button } from "@/components/ui/button";

import SettingsSection from "./SettingsSection";

export default function DangerZoneCard() {
  return (
    <SettingsSection title="Danger Zone">

      <div className="flex flex-wrap gap-3">

        <Button variant="outline">
          Archive Client
        </Button>

        <Button variant="destructive">
          Delete Client
        </Button>

      </div>

    </SettingsSection>
  );
}