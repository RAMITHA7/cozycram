import {
  Link,
  Outlet,
} from "react-router-dom";

import "./layouts.css";

function AuthLayout() {
  return (
    <div className="layout auth-layout">
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <aside className="auth-layout__brand-panel">
        <Link
          to="/"
          className="layout__brand"
          aria-label="CozyCram home"
        >
          CozyCram.
        </Link>

        <div className="auth-layout__message">
          <p className="auth-layout__eyebrow">
            YOUR STUDY SPACE
          </p>

          <h2>
            Less panic.
            <br />
            Better planning.
          </h2>

          <p>
            A calmer way to organize what
            needs to get done.
          </p>
        </div>
      </aside>

      <main
        id="main-content"
        className="auth-layout__main"
        tabIndex="-1"
      >
        <Link
          to="/"
          className="auth-layout__mobile-brand"
          aria-label="CozyCram home"
        >
          CozyCram.
        </Link>

        <div className="auth-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;