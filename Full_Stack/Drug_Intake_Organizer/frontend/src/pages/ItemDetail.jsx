import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function ItemDetail() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await api.get("/items");
      const found = res.data.find(i => i.id === Number(itemId));
      setItem(found);
    }
    load();
  }, [itemId]);

  if (!item) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <Card title={item.name}>
        <p className="text-gray-700 mb-2"><strong>Category:</strong> {item.category}</p>
        <p className="text-gray-700 mb-2"><strong>Dosage:</strong> {item.dosage_per_intake}</p>
        <p className="text-gray-700 mb-2"><strong>Frequency:</strong> {item.frequency}</p>
        <p className="text-gray-700 mb-2"><strong>Times:</strong> {item.times_of_day.join(", ")}</p>

        <div className="mt-4 flex gap-3">
          <Link to={`/interactions/${item.id}`}>
            <Button variant="primary">Interactions</Button>
          </Link>
          <Link to={`/reference/${item.id}`}>
            <Button variant="secondary">Reference</Button>
          </Link>
          <Link to={`/override/${item.id}`}>
            <Button variant="primary">Add Override</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
