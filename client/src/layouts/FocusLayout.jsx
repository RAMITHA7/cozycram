import {
  ArrowLeft,
} from "lucide-react";

import {
  Link,
  Outlet,
} from "react-router-dom";

import "./layouts.css";

function FocusLayout() {
  return (
    <div className="layout focus-layout">
      <header className="focus-layout__header">
        <Link
          to="/focus"
          className="focus-layout__exit"
        >
          <ArrowLeft
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>Exit focus</span>
        </Link>
      </header>

      <main
        id="main-content"
        className="focus-layout__main"
        tabIndex="-1"
      >
        <div className="focus-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default FocusLayout;