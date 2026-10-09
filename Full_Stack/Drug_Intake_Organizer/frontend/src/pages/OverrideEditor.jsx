import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function OverrideEditor() {
  const { itemId } = useParams();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("morning");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  async function submit() {
    try {
      await api.post("/overrides", {
        item_id: Number(itemId),
        date,
        time,
        dosage,
        notes
      });
      setStatus("Override saved!");
    } catch {
      setStatus("Error saving override.");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card title="Add Override">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <option>morning</option>
            <option>afternoon</option>
            <option>evening</option>
            <option>night</option>
          </select>
        </div>

        <Input label="Dosage" value={dosage} onChange={e => setDosage(e.target.value)} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <Button variant="primary" onClick={submit}>Save Override</Button>

        {status && <p className="mt-3 text-green-600">{status}</p>}
      </Card>
    </div>
  );
}
