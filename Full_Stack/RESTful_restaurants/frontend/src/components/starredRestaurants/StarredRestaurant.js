import { useState } from "react";
import { INPUT_LIMITS, validateComment } from "../../utils/validation";
import {
  dangerButtonClassName,
  ErrorNotice,
  inputClassName,
  secondaryButtonClassName,
} from "../shared";

const StarredRestaurant = ({
  restaurant,
  onUnstarRestaurant,
  onUpdateComment,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(restaurant.comment || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const cancelEdit = () => {
    setComment(restaurant.comment || "");
    setError("");
    setIsEditing(false);
  };

  const saveComment = async (event) => {
    event.preventDefault();
    const result = validateComment(comment);
    if (result.error) {
      setError(result.error);
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await onUpdateComment(result.value);
      setComment(result.value);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message || "Could not save this comment.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="break-words text-xl font-bold text-slate-950">
        {restaurant.name}
      </h3>

      {isEditing ? (
        <form className="mt-4 flex flex-1 flex-col" onSubmit={saveComment}>
          <label
            className="text-sm font-semibold text-slate-900"
            htmlFor={`comment-${restaurant.id}`}
          >
            Your note
          </label>
          <textarea
            className={`${inputClassName} min-h-28 flex-1 resize-y`}
            id={`comment-${restaurant.id}`}
            aria-describedby={`comment-count-${restaurant.id}${
              error ? ` comment-error-${restaurant.id}` : ""
            }`}
            maxLength={INPUT_LIMITS.comment}
            onChange={(event) => setComment(event.target.value)}
            value={comment}
          />
          <p
            className="mt-1 text-right text-xs text-slate-600"
            id={`comment-count-${restaurant.id}`}
          >
            {comment.length}/{INPUT_LIMITS.comment}
          </p>
          <div className="mt-2">
            <ErrorNotice id={`comment-error-${restaurant.id}`} message={error} />
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
              {isSaving ? "Saving…" : "Save comment"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-3 min-h-16 flex-1 rounded-xl bg-stone-50 p-3">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {comment || "No note yet."}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={secondaryButtonClassName}
              aria-label={`Edit note for ${restaurant.name}`}
              onClick={() => setIsEditing(true)}
              type="button"
            >
              {comment ? "Edit note" : "Add a note"}
            </button>
            <button
              className={dangerButtonClassName}
              aria-label={`Unstar ${restaurant.name}`}
              onClick={onUnstarRestaurant}
              type="button"
            >
              Unstar
            </button>
          </div>
        </>
      )}
    </article>
  );
};

export default StarredRestaurant;
