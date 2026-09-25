import { ClientNotes } from "@/components/clients/notes";
import { getNotes } from "@/components/clients/notes/api";

export default async function NotesPage() {
  const notes = await getNotes();

  return <ClientNotes notes={notes} />;
}