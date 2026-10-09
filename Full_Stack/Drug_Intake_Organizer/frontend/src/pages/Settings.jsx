import Card from "../components/ui/Card.jsx";

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Card title="Notifications">
        <p className="text-gray-700 dark:text-gray-300">
          (Placeholder) Configure notification preferences here.
        </p>
      </Card>
      <Card title="Account">
        <p className="text-gray-700 dark:text-gray-300">
          (Placeholder) Account options will go here.
        </p>
      </Card>
    </div>
  );
}
