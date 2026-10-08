import { useState } from "react";
import {
  dangerButtonClassName,
  ErrorNotice,
  inputClassName,
  secondaryButtonClassName,
} from "../shared";
import { INPUT_LIMITS, validateName } from "../../utils/validation";

const Category = ({ category, onDeleteCategory, onUpdateCategory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const cancelEdit = () => {
    setName(category.name);
    setError("");
    setIsEditing(false);
  };

  const saveName = async (event) => {
    event.preventDefault();
    const result = validateName(name);
    if (result.error) {
      setError(result.error);
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onUpdateCategory(result.value);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message || "Could not update this category.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
      {isEditing ? (
        <form onSubmit={saveName}>
          <label
            className="block text-sm font-semibold text-slate-900"
            htmlFor={`category-name-${category.id}`}
          >
            Edit {category.name}
          </label>
          <input
            className={inputClassName}
            id={`category-name-${category.id}`}
            maxLength={INPUT_LIMITS.name}
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
          <div className="mt-3">
            <ErrorNotice id={`category-error-${category.id}`} message={error} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={secondaryButtonClassName} onClick={cancelEdit} type="button">
              Cancel
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving…" : "Save name"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h4 className="break-words text-lg font-semibold text-slate-900">
            {category.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              className={secondaryButtonClassName}
              aria-label={`Edit ${category.name}`}
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Edit
            </button>
            <button
              className={dangerButtonClassName}
              aria-label={`Delete ${category.name}`}
              onClick={onDeleteCategory}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default Category;
