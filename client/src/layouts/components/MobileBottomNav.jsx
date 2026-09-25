import {
  CalendarCheck2,
  CalendarDays,
  House,
  Menu,
  Timer,
} from "lucide-react";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

const mobileNavigation = [
  {
    label: "Today",
    to: "/today",
    icon: House,
  },
  {
    label: "Planner",
    to: "/planner",
    icon: CalendarCheck2,
  },
  {
    label: "Focus",
    to: "/focus",
    icon: Timer,
  },
  {
    label: "Calendar",
    to: "/calendar",
    icon: CalendarDays,
  },
];

function getLinkClass({ isActive }) {
  return [
    "mobile-nav__item",
    isActive
      ? "mobile-nav__item--active"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function MobileBottomNav({
  moreOpen,
  onOpenMore,
}) {
  const location = useLocation();

  const moreIsActive =
    moreOpen ||
    location.pathname.startsWith(
      "/profile"
    ) ||
    location.pathname.startsWith(
      "/settings"
    );

  return (
    <nav
      className="mobile-nav"
      aria-label="Primary navigation"
    >
      {mobileNavigation.map(
        ({
          label,
          to,
          icon: Icon,
        }) => (
          <NavLink
            key={to}
            to={to}
            className={getLinkClass}
          >
            <Icon
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>{label}</span>
          </NavLink>
        )
      )}

      <button
        type="button"
        className={[
          "mobile-nav__item",
          moreIsActive
            ? "mobile-nav__item--active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-expanded={moreOpen}
        aria-haspopup="dialog"
        onClick={onOpenMore}
      >
        <Menu
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span>More</span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;