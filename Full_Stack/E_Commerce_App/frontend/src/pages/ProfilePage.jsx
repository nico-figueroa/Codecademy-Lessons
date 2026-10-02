import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile } from "../api/auth.js";
import AddressForm from "../components/AddressForm.jsx";
import Alert from "../components/Alert.jsx";
import { addressFromProfile } from "../utils/address.js";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(() => addressFromProfile(user));
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    const { name, phone, ...address } = form;
    try {
      await updateProfile({
        name,
        phone,
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
      });
      await refreshUser();
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Your profile</h1>
      <p className="mt-1 text-sm text-slate-500">
        {user?.email} · saved details prefill checkout.
      </p>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <AddressForm value={form} onChange={setForm} />
        <button
          type="submit"
          disabled={isSaving}
          className="self-start rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
