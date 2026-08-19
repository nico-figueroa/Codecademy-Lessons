import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function RootLayout() {
  return (
    <>
      <Header />

      {/* Mobile header required by E2E tests */}
      <header id="mobile-header" className="mobile-only">
        Reddit Topic Evolution — Mobile
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}
