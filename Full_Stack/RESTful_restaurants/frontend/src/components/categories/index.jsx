import { useContext, useState } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../api/categories";
import CategoriesContext from "../../provider/categories";
import { validateName, INPUT_LIMITS } from "../../utils/validation";
import Category from "./Category";
import {
  EmptyState,
  ErrorNotice,
  PageHeading,
  errorMessage,
  inputClassName,
  primaryButtonClassName,
} from "../shared";

const Categories = () => {
  const {
    state: { categories },
    dispatch,
  } = useContext(CategoriesContext);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const onAddNewCategory = async (event) => {
    event.preventDefault();
    const result = validateName(newCategoryName);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    setFormError("");
    setIsSaving(true);
    try {
      const category = await createCategory(result.value);
      dispatch({ type: "ADD_NEW_CATEGORY", payload: category });
      setNewCategoryName("");
    } catch (requestError) {
      setFormError(errorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteCategory = async (id) => {
    setError("");
    try {
      await deleteCategory(id);
      dispatch({ type: "DELETE_CATEGORY", payload: id });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const onUpdateCategory = async (id, name) => {
    const result = validateName(name);
    if (result.error) throw new Error(result.error);

    await updateCategory(id, result.value);
    dispatch({
      type: "UPDATE_CATEGORY_NAME",
      payload: { id, newName: result.value },
    });
  };

  return (
    <section aria-labelledby="categories-title">
      <ErrorNotice message={error} />
      <PageHeading
        eyebrow="Keep things organized"
        title="Manage categories"
        description="Create, rename, or remove the categories you use to organize your restaurant list."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="min-w-0">
          <h3
            className="mb-4 text-xl font-bold text-slate-900"
            id="categories-title"
          >
            Your categories <span className="text-slate-600">({categories.length})</span>
          </h3>
          {categories.length === 0 ? (
            <EmptyState>No categories yet. Add one to get started.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Category
                    category={category}
                    onDeleteCategory={() => onDeleteCategory(category.id)}
                    onUpdateCategory={(name) =>
                      onUpdateCategory(category.id, name)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6"
          onSubmit={onAddNewCategory}
        >
          <h3 className="text-xl font-bold text-slate-900">Add a category</h3>
          <p className="mt-1 text-sm text-slate-700">
            Use a short name that makes your list easier to browse.
          </p>
          <label
            className="mt-5 block text-sm font-semibold text-slate-900"
            htmlFor="new-category-name"
          >
            Category name
          </label>
          <input
            className={inputClassName}
            id="new-category-name"
            aria-describedby={`category-name-count${
              formError ? " category-name-error" : ""
            }`}
            maxLength={INPUT_LIMITS.name}
            onChange={(event) => setNewCategoryName(event.target.value)}
            required
            type="text"
            value={newCategoryName}
          />
          <p className="mt-1 text-right text-xs text-slate-600" id="category-name-count">
            {newCategoryName.length}/{INPUT_LIMITS.name}
          </p>
          <div className="mt-4">
            <ErrorNotice id="category-name-error" message={formError} />
          </div>
          <button
            className={`${primaryButtonClassName} mt-4 w-full`}
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving…" : "Add category"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Categories;
