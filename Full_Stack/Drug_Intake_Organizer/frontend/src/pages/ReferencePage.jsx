import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import Card from "../components/ui/Card.jsx";

export default function ReferencePage() {
  const { itemId } = useParams();
  const [reference, setReference] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get(`/reference/${itemId}`);
      setReference(res.data.reference);
    }
    load();
  }, [itemId]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reference Information</h2>

      {reference.length === 0 && (
        <p className="text-gray-600">No reference data found.</p>
      )}

      {reference.map((ref, idx) => (
        <Card key={idx} title={ref.source.toUpperCase()}>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(ref.data, null, 2)}
          </pre>
        </Card>
      ))}
    </div>
  );
}
