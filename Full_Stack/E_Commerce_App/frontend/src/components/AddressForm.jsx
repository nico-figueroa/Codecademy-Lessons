import { useId } from "react";

const FIELDS = [
  { key: "name", label: "Full name", autoComplete: "name", required: true, span: 2 },
  { key: "phone", label: "Phone", autoComplete: "tel", span: 2 },
  { key: "line1", label: "Address line 1", autoComplete: "address-line1", required: true, span: 2 },
  { key: "line2", label: "Address line 2", autoComplete: "address-line2", span: 2 },
  { key: "city", label: "City", autoComplete: "address-level2", required: true },
  { key: "state", label: "State / Province", autoComplete: "address-level1", required: true },
  { key: "postalCode", label: "Postal code", autoComplete: "postal-code", required: true },
  { key: "country", label: "Country (2-letter code)", autoComplete: "country", required: true, maxLength: 2 },
];

export default function AddressForm({ value, onChange, showName = true }) {
  const prefix = useId();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FIELDS.filter((f) => showName || f.key !== "name").map((f) => (
        <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
          <label htmlFor={`${prefix}-${f.key}`} className="block text-sm font-medium text-slate-700">
            {f.label}
          </label>
          <input
            id={`${prefix}-${f.key}`}
            type="text"
            value={value[f.key] ?? ""}
            required={f.required}
            maxLength={f.maxLength}
            autoComplete={f.autoComplete}
            onChange={(e) =>
              onChange({
                ...value,
                [f.key]: f.key === "country" ? e.target.value.toUpperCase() : e.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      ))}
    </div>
  );
}
