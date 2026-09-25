import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function SettingsSection({
  title,
  children,
}: Props) {
  return (
    <Card className="p-6">

      <h2 className="mb-5 text-lg font-semibold">
        {title}
      </h2>

      {children}

    </Card>
  );
}