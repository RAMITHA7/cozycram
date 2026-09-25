import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import AppSidebar from "./components/AppSidebar.jsx";
import AppTopbar from "./components/AppTopbar.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import MobileTopbar from "./components/MobileTopbar.jsx";
import MoreSheet from "./components/MoreSheet.jsx";

import "./layouts.css";
import "./app-shell.css";

const SIDEBAR_STORAGE_KEY =
  "cozycram-sidebar-collapsed";

function getInitialSidebarState() {
  return (
    localStorage.getItem(
      SIDEBAR_STORAGE_KEY
    ) === "true"
  );
}

function AppLayout() {
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(
    getInitialSidebarState
  );

  const [
    moreOpen,
    setMoreOpen,
  ] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  function toggleSidebar() {
    setSidebarCollapsed(
      (current) => !current
    );
  }

  const openMore = useCallback(() => {
    setMoreOpen(true);
  }, []);

  const closeMore = useCallback(() => {
    setMoreOpen(false);
  }, []);

  return (
    <div
      className={[
        "layout",
        "layout--app",
        "app-shell",
        sidebarCollapsed
          ? "app-shell--collapsed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={
          toggleSidebar
        }
      />

      <div className="app-shell__workspace">
        <AppTopbar />

        <MobileTopbar />

        <main
          id="main-content"
          className="app-shell__main"
          tabIndex="-1"
        >
          <div className="app-shell__content">
            <Outlet />
          </div>
        </main>

        <MobileBottomNav
          moreOpen={moreOpen}
          onOpenMore={openMore}
        />
      </div>

      <MoreSheet
        open={moreOpen}
        onClose={closeMore}
      />
    </div>
  );
}

export default AppLayout;