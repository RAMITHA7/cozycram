import {
  Moon,
  Sun,
} from "lucide-react";

import useTheme from "../context/useTheme.js";

import {
  Link,
  Outlet,
} from "react-router-dom";

import "./layouts.css";

function PublicLayout() {
  const {
  resolvedTheme,
  setTheme,
} = useTheme();

const toggleTheme = () => {
  setTheme(
    resolvedTheme === "dark"
      ? "light"
      : "dark"
  );
};
  return (
    <div className="layout public-layout">
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <header className="public-header">
        <Link
          to="/"
          className="layout__brand"
          aria-label="CozyCram home"
        >
          CozyCram.
        </Link>

        <nav
          className="public-header__actions"
          aria-label="Public navigation"
        >
          <Link
            to="/login"
            className="public-header__login"
          >
            Login
          </Link>
          
          <button
  type="button"
  className="public-theme-toggle"
  onClick={toggleTheme}
  aria-label={
    resolvedTheme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme"
  }
  title={
    resolvedTheme === "dark"
      ? "Light mode"
      : "Dark mode"
  }
>
  {resolvedTheme === "dark" ? (
    <Sun
      size={19}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  ) : (
    <Moon
      size={19}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  )}
</button>

          <Link
            to="/signup"
            className="public-header__cta"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main
        id="main-content"
        className="public-layout__main"
        tabIndex="-1"
      >
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;