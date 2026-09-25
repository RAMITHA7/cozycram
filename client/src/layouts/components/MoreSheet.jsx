import {
  Check,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useTheme from "../../context/useTheme.js";

function MoreSheet({
  open,
  onClose,
}) {
  const sheetRef = useRef(null);
  const closeButtonRef = useRef(null);

  const navigate = useNavigate();

  const {
    theme,
    setTheme,
  } = useTheme();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousFocus =
      document.activeElement;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (
        event.key !== "Tab" ||
        !sheetRef.current
      ) {
        return;
      }

      const focusableElements =
        sheetRef.current.querySelectorAll(
          [
            'a[href]',
            'button:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(",")
        );

      if (
        focusableElements.length === 0
      ) {
        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement ===
          lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function chooseTheme(nextTheme) {
    setTheme(nextTheme);
  }

  function handleLogout() {
    onClose();
    navigate("/login");
  }

  return (
    <div
      className="more-sheet__overlay"
      onPointerDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        ref={sheetRef}
        className="more-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
      >
        <header className="more-sheet__header">
          <h2
            id="more-sheet-title"
            className="more-sheet__title"
          >
            More
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            className="more-sheet__close"
            aria-label="Close more menu"
            onClick={onClose}
          >
            <X
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="more-sheet__section">
          <Link
            to="/profile"
            className="more-sheet__row"
            onClick={onClose}
          >
            <User
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Profile</span>
          </Link>

          <Link
            to="/settings"
            className="more-sheet__row"
            onClick={onClose}
          >
            <Settings
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Settings</span>
          </Link>
        </div>

        <div className="more-sheet__divider" />

        <div className="more-sheet__section">
          <p className="more-sheet__label">
            Appearance
          </p>

          <button
            type="button"
            className="more-sheet__row"
            onClick={() =>
              chooseTheme("light")
            }
          >
            <Sun
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Light</span>

            {theme === "light" && (
              <Check
                className="more-sheet__check"
                size={18}
                aria-hidden="true"
              />
            )}
          </button>

          <button
            type="button"
            className="more-sheet__row"
            onClick={() =>
              chooseTheme("dark")
            }
          >
            <Moon
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Dark</span>

            {theme === "dark" && (
              <Check
                className="more-sheet__check"
                size={18}
                aria-hidden="true"
              />
            )}
          </button>

          <button
            type="button"
            className="more-sheet__row"
            onClick={() =>
              chooseTheme("system")
            }
          >
            <Monitor
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>System</span>

            {theme === "system" && (
              <Check
                className="more-sheet__check"
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <div className="more-sheet__divider" />

        <div className="more-sheet__section">
          <button
            type="button"
            className="more-sheet__row more-sheet__row--danger"
            onClick={handleLogout}
          >
            <LogOut
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Log out</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default MoreSheet;