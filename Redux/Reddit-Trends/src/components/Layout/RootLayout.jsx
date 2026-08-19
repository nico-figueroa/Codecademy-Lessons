import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function RootLayout() {
  return (
    <div className="app-shell">
      <Header />

      {/* Mobile header required by E2E tests */}
      <header id="mobile-header" className="mobile-only mobile-header">
        Reddit Topic Evolution — Mobile
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
