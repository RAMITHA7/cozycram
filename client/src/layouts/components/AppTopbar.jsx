import {
  Check,
  ChevronDown,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useTheme from "../../context/useTheme.js";

import { getAppPageTitle } from "../appShellRoutes.js";

function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    theme,
    resolvedTheme,
    setTheme,
  } = useTheme();

  const [appearanceOpen, setAppearanceOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const appearanceRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        appearanceRef.current &&
        !appearanceRef.current.contains(
          event.target
        )
      ) {
        setAppearanceOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAppearanceOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const pageTitle =
    getAppPageTitle(location.pathname);

  const ThemeIcon =
    resolvedTheme === "dark"
      ? Moon
      : Sun;

  function chooseTheme(nextTheme) {
    setTheme(nextTheme);
    setAppearanceOpen(false);
  }

  function handleTemporaryLogout() {
    setProfileOpen(false);

    /*
      Real authentication arrives later.
      For now this simply returns the
      prototype user to the login route.
    */
    navigate("/login");
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar__page">
        <p className="app-topbar__title">
          {pageTitle}
        </p>
      </div>

      <div className="app-topbar__actions">
        <div
          className="app-topbar__menu-wrapper"
          ref={appearanceRef}
        >
          <button
            type="button"
            className="app-topbar__icon-trigger"
            aria-label="Appearance"
            aria-expanded={appearanceOpen}
            aria-haspopup="true"
            onClick={() => {
              setAppearanceOpen(
                (current) => !current
              );

              setProfileOpen(false);
            }}
          >
            <ThemeIcon
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          {appearanceOpen && (
            <div
              className="app-topbar__dropdown app-topbar__appearance-menu"
              aria-label="Appearance"
            >
              <p className="app-topbar__menu-heading">
                Appearance
              </p>

              <button
                type="button"
                className="app-topbar__menu-item"
                onClick={() =>
                  chooseTheme("light")
                }
              >
                <Sun
                  size={18}
                  aria-hidden="true"
                />

                <span>Light</span>

                {theme === "light" && (
                  <Check
                    className="app-topbar__menu-check"
                    size={17}
                    aria-hidden="true"
                  />
                )}
              </button>

              <button
                type="button"
                className="app-topbar__menu-item"
                onClick={() =>
                  chooseTheme("dark")
                }
              >
                <Moon
                  size={18}
                  aria-hidden="true"
                />

                <span>Dark</span>

                {theme === "dark" && (
                  <Check
                    className="app-topbar__menu-check"
                    size={17}
                    aria-hidden="true"
                  />
                )}
              </button>

              <button
                type="button"
                className="app-topbar__menu-item"
                onClick={() =>
                  chooseTheme("system")
                }
              >
                <Monitor
                  size={18}
                  aria-hidden="true"
                />

                <span>System</span>

                {theme === "system" && (
                  <Check
                    className="app-topbar__menu-check"
                    size={17}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          )}
        </div>

        <div
          className="app-topbar__menu-wrapper"
          ref={profileRef}
        >
          <button
            type="button"
            className="app-topbar__profile-trigger"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            onClick={() => {
              setProfileOpen(
                (current) => !current
              );

              setAppearanceOpen(false);
            }}
          >
            <span
              className="app-topbar__avatar"
              aria-hidden="true"
            >
              RH
            </span>

            <ChevronDown
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div
              className="app-topbar__dropdown app-topbar__profile-menu"
            >
              <Link
                to="/profile"
                className="app-topbar__menu-item"
                onClick={() =>
                  setProfileOpen(false)
                }
              >
                <User
                  size={18}
                  aria-hidden="true"
                />

                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                className="app-topbar__menu-item"
                onClick={() =>
                  setProfileOpen(false)
                }
              >
                <Settings
                  size={18}
                  aria-hidden="true"
                />

                <span>Settings</span>
              </Link>

              <div
                className="app-topbar__menu-divider"
                aria-hidden="true"
              />

              <button
                type="button"
                className="app-topbar__menu-item app-topbar__menu-item--danger"
                onClick={
                  handleTemporaryLogout
                }
              >
                <LogOut
                  size={18}
                  aria-hidden="true"
                />

                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;