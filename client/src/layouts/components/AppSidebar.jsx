import {
  CalendarDays,
  CalendarCheck2,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Timer,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import {
  IconButton,
} from "../../components/ui/index.js";

const mainNavigation = [
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

function getNavLinkClass({
  isActive,
}) {
  return [
    "app-sidebar__link",
    isActive
      ? "app-sidebar__link--active"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function AppSidebar({
  collapsed,
  onToggleCollapse,
}) {
  return (
    <aside
      className={[
        "app-sidebar",
        collapsed
          ? "app-sidebar--collapsed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="app-sidebar__brand">
        <span
          className="app-sidebar__brand-text"
          aria-label="CozyCram"
        >
          {collapsed
            ? "C."
            : "CozyCram."}
        </span>
      </div>

      <nav
        className="app-sidebar__navigation"
        aria-label="Primary navigation"
      >
        {mainNavigation.map(
          ({
            label,
            to,
            icon: Icon,
          }) => (
            <NavLink
              key={to}
              to={to}
              className={getNavLinkClass}
              aria-label={label}
              title={label}
            >
              <Icon
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span className="app-sidebar__link-label">
                {label}
              </span>
            </NavLink>
          )
        )}
      </nav>

      <div className="app-sidebar__bottom">
        <NavLink
          to="/settings"
          className={getNavLinkClass}
          aria-label= "Settings"
          title="Settings"
        >
          <Settings
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span className="app-sidebar__link-label">
            Settings
          </span>
        </NavLink>

        <IconButton
          label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          onClick={onToggleCollapse}
          className="app-sidebar__collapse-button"
        >
          {collapsed ? (
            <PanelLeftOpen
              size={20}
              strokeWidth={1.8}
            />
          ) : (
            <PanelLeftClose
              size={20}
              strokeWidth={1.8}
            />
          )}
        </IconButton>
      </div>
    </aside>
  );
}

export default AppSidebar;