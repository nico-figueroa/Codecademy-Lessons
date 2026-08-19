import { useState } from "react";

export default function AddNote({ onSubmit }) {
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(note);
      }}
    >
      <input
        placeholder="Add a note"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <button type="submit">
        Save Note
      </button>
    </form>
  );
}
