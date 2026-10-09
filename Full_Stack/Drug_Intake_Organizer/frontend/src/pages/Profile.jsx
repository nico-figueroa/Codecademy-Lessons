import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Profile() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <Card title="User Info">
        <p className="text-gray-700 dark:text-gray-300">
          Name: Test User
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Email: test@example.com
        </p>
      </Card>
      <Card title="Security">
        <Button variant="primary">Change Password (placeholder)</Button>
      </Card>
    </div>
  );
}
