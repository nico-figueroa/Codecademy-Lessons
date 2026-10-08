import React from "react";

export const CategoriesInitialState = {
  categories: [],
};

export const CategoriesReducer = (state = CategoriesInitialState, action) => {
  switch (action.type) {
    case "LOADED_CATEGORIES": {
      return { ...state, categories: action.payload };
    }
    case "ADD_NEW_CATEGORY": {
      return { ...state, categories: [...state.categories, action.payload] };
    }
    case "UPDATE_CATEGORY_NAME": {
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id
            ? { ...category, name: action.payload.newName }
            : category
        ),
      };
    }
    case "DELETE_CATEGORY": {
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
      };
    }
    
    case "ASSIGN_RESTAURANT": {
      const { categoryId, restaurantId } = action.payload;

      const nextCategoriesState = state.categories.map((category) => {
        // Remove restaurant from all categories
        const filtered = category.restaurantIds.filter(id => id !== restaurantId);

        // Add to the selected category
        if (category.id === categoryId) {
          return {
            ...category,
            restaurantIds: [...filtered, restaurantId],
          };
        }

        return {
          ...category,
          restaurantIds: filtered,
        };
      });

      return { ...state, categories: nextCategoriesState };
    }

    case "UNASSIGN_RESTAURANT": {
      const { categoryId, restaurantId } = action.payload;

      const nextCategoriesState = state.categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            restaurantIds: category.restaurantIds.filter(
              (id) => id !== restaurantId
            ),
          };
        }
        return category;
      });

      return { ...state, categories: nextCategoriesState };
    }

    case "REMOVE_RESTAURANT_ASSIGNMENTS": {
      return {
        ...state,
        categories: state.categories.map((category) => ({
          ...category,
          restaurantIds: category.restaurantIds.filter(
            (id) => id !== action.payload
          ),
        })),
      };
    }

    default:
      return state;
  }

};

const CategoriesContext = React.createContext({
  state: CategoriesInitialState,
  dispatch: (action) => {},
});

export default CategoriesContext;