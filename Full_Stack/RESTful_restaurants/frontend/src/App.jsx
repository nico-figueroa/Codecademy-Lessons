import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { getCategories } from "./api/categories";
import { getRestaurants } from "./api/restaurants";
import { getStarredRestaurants } from "./api/starredRestaurants";
import CategoriesView from "./components/categories/CategoriesView";
import Categories from "./components/categories";
import Restaurants from "./components/restaurants";
import StarredRestaurants from "./components/starredRestaurants";
import CategoriesContext, {
  CategoriesInitialState,
  CategoriesReducer,
} from "./provider/categories";
import RestaurantsContext, {
  RestaurantsInitialState,
  RestaurantsReducer,
} from "./provider/restaurants";
import { errorMessage } from "./components/shared";

const navigation = [
  { to: "/", label: "Categories view", end: true },
  { to: "/starred", label: "Starred restaurants" },
  { to: "/restaurants", label: "Restaurants" },
  { to: "/categories", label: "Categories" },
];

function AppContent() {
  const { dispatch: categoriesDispatch } = useContext(CategoriesContext);
  const { dispatch: restaurantsDispatch } = useContext(RestaurantsContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [categories, restaurants, starredRestaurants] = await Promise.all([
        getCategories(),
        getRestaurants(),
        getStarredRestaurants(),
      ]);

      categoriesDispatch({ type: "LOADED_CATEGORIES", payload: categories });
      restaurantsDispatch({ type: "LOADED_RESTAURANTS", payload: restaurants });
      restaurantsDispatch({
        type: "LOADED_STARRED_RESTAURANTS",
        payload: starredRestaurants,
      });
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [categoriesDispatch, restaurantsDispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <a
        className="sr-only rounded-md bg-white px-4 py-3 text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        href="#main-content"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-stone-50 text-slate-900">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
                A little taste of everywhere
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                My Restaurant List
              </h1>
            </div>
            <nav aria-label="Main navigation" className="-mb-5 flex flex-wrap gap-2 pb-4">
              {navigation.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      isActive
                        ? "bg-emerald-800 text-white"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          {isLoading ? (
            <p className="py-12 text-center text-slate-700" role="status">
              Loading restaurants and categories…
            </p>
          ) : loadError ? (
            <section
              aria-labelledby="load-error-title"
              className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <h2 id="load-error-title" className="text-lg font-bold text-red-900">
                We couldn’t load your restaurant list
              </h2>
              <p className="mt-2 text-sm text-red-800">{loadError}</p>
              <button
                className="mt-5 rounded-lg bg-red-800 px-4 py-2 font-semibold text-white hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
                onClick={loadData}
                type="button"
              >
                Try again
              </button>
            </section>
          ) : (
            <Routes>
              <Route path="/" element={<CategoriesView />} />
              <Route path="/starred" element={<StarredRestaurants />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  const [categoriesState, categoriesDispatch] = useReducer(
    CategoriesReducer,
    CategoriesInitialState
  );
  const [restaurantsState, restaurantsDispatch] = useReducer(
    RestaurantsReducer,
    RestaurantsInitialState
  );

  return (
    <CategoriesContext.Provider
      value={{ state: categoriesState, dispatch: categoriesDispatch }}
    >
      <RestaurantsContext.Provider
        value={{ state: restaurantsState, dispatch: restaurantsDispatch }}
      >
        <AppContent />
      </RestaurantsContext.Provider>
    </CategoriesContext.Provider>
  );
}

export default App;
