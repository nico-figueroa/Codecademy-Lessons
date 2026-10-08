import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import {
  getCategories,
  removeRestaurantFromCategory,
} from "./api/categories";
import { getRestaurants } from "./api/restaurants";
import { getStarredRestaurants } from "./api/starredRestaurants";

jest.mock("./api/categories", () => ({
  getCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  assignRestaurantToCategory: jest.fn(),
  removeRestaurantFromCategory: jest.fn(),
}));

jest.mock("./api/restaurants", () => ({
  getRestaurants: jest.fn(),
  addNewRestaurant: jest.fn(),
  deleteRestaurant: jest.fn(),
  updateRestaurantName: jest.fn(),
  starRestaurant: jest.fn(),
}));

jest.mock("./api/starredRestaurants", () => ({
  getStarredRestaurants: jest.fn(),
  unstarRestaurant: jest.fn(),
  updateComment: jest.fn(),
}));

beforeEach(() => {
  getCategories.mockResolvedValue([
    { id: "category-1", name: "Italian", restaurantIds: ["restaurant-1"] },
  ]);
  getRestaurants.mockResolvedValue([
    { id: "restaurant-1", name: "Pasta Place" },
  ]);
  getStarredRestaurants.mockResolvedValue([
    {
      id: "starred-1",
      restaurantId: "restaurant-1",
      name: "Pasta Place",
      comment: "Lovely patio",
    },
  ]);
  removeRestaurantFromCategory.mockResolvedValue({});
});

test("shows the categories view and preserves access to all four pages", async () => {
  render(<App />);

  expect(
    await screen.findByRole("heading", { name: "Categories view" })
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Italian" })).toBeInTheDocument();
  expect(screen.getByText("Pasta Place")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "Starred restaurants" }));
  expect(
    await screen.findByRole("heading", { name: "Starred restaurants" })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "Restaurants" }));
  expect(
    await screen.findByRole("heading", { name: "Manage restaurants" })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Restaurant name")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "Categories" }));
  expect(
    await screen.findByRole("heading", { name: "Manage categories" })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Category name")).toBeInTheDocument();
});
