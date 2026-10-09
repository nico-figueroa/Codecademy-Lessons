import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/ui/Card.jsx";

export default function CalendarPage() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/schedule", {
        params: { from: "2026-10-10", to: "2026-10-17" }
      });
      setSchedule(res.data.schedule);
    }
    load();
  }, []);

  const grouped = schedule.reduce((acc, entry) => {
    acc[entry.date] = acc[entry.date] || [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule Calendar</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([date, entries]) => (
          <Card key={date} title={date}>
            <ul className="space-y-2">
              {entries.map((e, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="font-medium">{e.time}</span>
                  <span className="text-gray-700">{e.name}</span>
                  <span className="text-sm text-gray-500">{e.dosage}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
