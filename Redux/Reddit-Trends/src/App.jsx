import React from "react";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./App.css";

// Exposed for manual dev/debug inspection only.
if (import.meta.env.DEV) {
  window.__store = store;
}

// Pages / Views
import AnalysisForm from "./pages/AnalysisForm";
import AnalysisResults from "./pages/AnalysisResults";
import DetailedAnalysisView from "./pages/DetailedAnalysisView";

// Layout
import RootLayout from "./components/Layout/RootLayout";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        {/* Redirect root → /analysis */}
        <Route index element={<Navigate to="/analysis" replace />} />

        {/* Main analysis form */}
        <Route path="/analysis" element={<AnalysisForm />} />

        {/* Results page */}
        <Route path="/results" element={<AnalysisResults />} />

        {/* Detailed view for a specific insight/topic */}
        <Route path="/details/:id" element={<DetailedAnalysisView />} />
      </Route>
    )
  );

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
