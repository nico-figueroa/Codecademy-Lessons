import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const linkClasses = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="font-display flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            N
          </span>
          Nomadant&nbsp;Tech&nbsp;Store
        </NavLink>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={linkClasses}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={linkClasses}>
            Cart
            {itemCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={linkClasses}>
              Orders
            </NavLink>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink to="/admin/products" className={linkClasses}>
                Manage products
              </NavLink>
              <NavLink to="/admin/orders" className={linkClasses}>
                Manage orders
              </NavLink>
              <NavLink to="/admin/users" className={linkClasses}>
              Manage users
              </NavLink>
            </>
          )}

          {isAuthenticated ? (
            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-3">
              <NavLink to="/profile" className={linkClasses}>
                {user?.name || user?.email}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <NavLink to="/login" className={linkClasses}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
