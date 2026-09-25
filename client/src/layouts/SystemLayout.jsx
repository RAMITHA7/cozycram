import {
  Link,
  Outlet,
} from "react-router-dom";

import "./layouts.css";

function SystemLayout() {
  return (
    <div className="layout system-layout">
      <header className="system-layout__header">
        <Link
          to="/"
          className="layout__brand"
          aria-label="CozyCram home"
        >
          CozyCram.
        </Link>
      </header>

      <main
        id="main-content"
        className="system-layout__main"
        tabIndex="-1"
      >
        <Outlet />
      </main>
    </div>
  );
}

export default SystemLayout;