import { useState } from "react";

export default function AddNote({ onSubmit }) {
  const [note, setNote] = useState("");

  return (
    <form
      className="add-note-form"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(note);
      }}
    >
      <input
        className="text-input"
        placeholder="Add a note"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <button type="submit" className="btn btn-primary">
        Save Note
      </button>
    </form>
  );
}
