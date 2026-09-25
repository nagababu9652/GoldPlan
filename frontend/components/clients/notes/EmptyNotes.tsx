import { Card } from "@/components/ui/card";

export default function EmptyNotes() {
  return (
    <Card className="p-12 text-center">

      <h3 className="text-lg font-semibold">
        No Notes Yet
      </h3>

      <p className="mt-2 text-muted-foreground">
        Create your first advisor note for this client.
      </p>

    </Card>
  );
}