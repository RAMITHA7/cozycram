import {
  Link,
  Outlet,
} from "react-router-dom";

import "./layouts.css";

function PublicLayout() {
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