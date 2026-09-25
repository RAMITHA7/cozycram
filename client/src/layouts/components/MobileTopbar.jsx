import { useLocation } from "react-router-dom";

import { getAppPageTitle } from "../appShellRoutes.js";

function MobileTopbar() {
  const location = useLocation();

  const pageTitle =
    getAppPageTitle(location.pathname);

  return (
    <header className="mobile-topbar">
      <p className="mobile-topbar__title">
        {pageTitle}
      </p>
    </header>
  );
}

export default MobileTopbar;