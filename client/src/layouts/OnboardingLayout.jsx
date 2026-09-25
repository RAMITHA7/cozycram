import {
  Link,
  Outlet,
} from "react-router-dom";

import "./layouts.css";

function OnboardingLayout() {
  return (
    <div className="layout onboarding-layout">
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <header className="onboarding-header">
        <Link
          to="/"
          className="layout__brand"
          aria-label="CozyCram home"
        >
          CozyCram.
        </Link>

        <span className="onboarding-header__label">
          Setup
        </span>
      </header>

      <main
        id="main-content"
        className="onboarding-layout__main"
        tabIndex="-1"
      >
        <div className="onboarding-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default OnboardingLayout;