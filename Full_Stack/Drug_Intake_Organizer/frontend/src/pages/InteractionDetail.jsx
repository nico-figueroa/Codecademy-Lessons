import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import Card from "../components/ui/Card.jsx";

export default function InteractionDetail() {
  const { itemId } = useParams();
  const [interaction, setInteraction] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await api.get("/interactions");
      const found = res.data.interactions.find(i => i.item_id === Number(itemId));
      setInteraction(found);
    }
    load();
  }, [itemId]);

  if (!interaction) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card title={`${interaction.name} — Interactions`}>
        <div className="space-y-4">
          {interaction.warnings.map((w, idx) => (
            <details key={idx} className="border rounded p-3">
              <summary className="cursor-pointer font-medium text-gray-800">
                Warning {idx + 1}
              </summary>
              <p className="mt-2 text-gray-700">{w}</p>
            </details>
          ))}
        </div>
      </Card>

      <Card title="Sources">
        <ul className="list-disc pl-6 text-gray-700">
          {interaction.sources.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
