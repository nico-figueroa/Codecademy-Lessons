import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  deactivateUser,
  fetchUsers,
  updateUser,
} from "../api/admin.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

const EMPTY = { email: "", name: "", phone: "", role: "customer", password: "" };

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(u) {
    setEditingId(u.id);
    setForm({
      email: u.email,
      name: u.name || "",
      phone: u.phone || "",
      role: u.role,
      password: "",
    });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        email: form.email.trim(),
        role: form.role,
        ...(form.name.trim() && { name: form.name.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.password && { password: form.password }),
      };
      if (editingId) await updateUser(editingId, payload);
      else await createUser(payload);
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function run(action) {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Manage users</h1>
      {error && <Alert variant="error">{error}</Alert>}

      <form
        onSubmit={handleSubmit}
        aria-label="User form"
        className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
      >
        <h2 className="font-display text-lg font-semibold sm:col-span-2">
          {editingId ? "Edit user" : "Add user"}
        </h2>
        <div>
          <label htmlFor="u-email" className="text-sm font-medium text-slate-700">Email</label>
          <input id="u-email" required type="email" className={input} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label htmlFor="u-name" className="text-sm font-medium text-slate-700">Name</label>
          <input id="u-name" className={input} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="u-phone" className="text-sm font-medium text-slate-700">Phone</label>
          <input id="u-phone" className={input} value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label htmlFor="u-role" className="text-sm font-medium text-slate-700">Role</label>
          <select id="u-role" className={input} value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="customer">customer</option>
            <option value="admin">admin</option>
            <option value="vendor">vendor</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="u-password" className="text-sm font-medium text-slate-700">
            {editingId ? "New password (leave blank to keep)" : "Password"}
          </label>
          <input id="u-password" type="password" minLength={8} required={!editingId}
            className={input} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {editingId ? "Save changes" : "Add user"}
          </button>
          {editingId && (
            <button type="button" onClick={reset}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700">
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <LoadingSpinner label="Loading users…" />
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {u.name || u.email}
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    {u.role}
                  </span>
                  {!u.isActive && (
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs">Inactive</span>
                  )}
                </p>
                <p className="text-sm text-slate-500">{u.email}</p>
              </div>
              <button type="button" onClick={() => startEdit(u)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700">
                Edit
              </button>
              {u.id !== me?.id && (
                u.isActive ? (
                  <button type="button" onClick={() => run(() => deactivateUser(u.id))}
                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-600">
                    Deactivate
                  </button>
                ) : (
                  <button type="button" onClick={() => run(() => updateUser(u.id, { isActive: true }))}
                    className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700">
                    Reactivate
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}