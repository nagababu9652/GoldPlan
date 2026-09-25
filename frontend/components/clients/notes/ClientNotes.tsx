import EmptyNotes from "./EmptyNotes";
import NoteCard from "./NoteCard";
import NoteEditor from "./NoteEditor";
import NotesToolbar from "./NotesToolbar";

import { ClientNote } from "./types";

interface Props {
  notes: ClientNote[];
}

export default function ClientNotes({
  notes,
}: Props) {
  return (
    <div className="space-y-6">

      <NotesToolbar />

      <NoteEditor />

      {notes.length === 0 ? (
        <EmptyNotes />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
            />
          ))}
        </div>
      )}

    </div>
  );
}