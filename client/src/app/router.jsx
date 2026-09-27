import {
  createBrowserRouter,
  Link
} from "react-router-dom";

import AppLayout from "../layouts/AppLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import FocusLayout from "../layouts/FocusLayout.jsx";
import OnboardingLayout from "../layouts/OnboardingLayout.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import SystemLayout from "../layouts/SystemLayout.jsx";
import LoginPage from "../features/auth/LoginPage.jsx";
import SignupPage from "../features/auth/SignupPage.jsx";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../features/auth/ResetPasswordPage.jsx";
import VerifyEmailPage from "../features/auth/VerifyEmailPage.jsx";

import RoutePlaceholder from "./RoutePlaceholder.jsx";
import LandingPage from "../features/landing/LandingPage.jsx";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />
      },
    ],
  },

  {
    element: <OnboardingLayout />,
    children: [
      {
        path: "/onboarding",
        element: (
          <RoutePlaceholder
            eyebrow="SETUP"
            title="Let's build your study setup."
            description="CozyCram onboarding will be implemented here."
          />
        ),
      },
    ],
  },

  {
    element: <AppLayout />,
    children: [
      {
        path: "/today",
        element: (
          <RoutePlaceholder
            eyebrow="TODAY"
            title="Good evening."
            description="Your daily CozyCram command center."
          />
        ),
      },

      {
        path: "/planner",
        element: (
          <RoutePlaceholder
            eyebrow="PLANNER"
            title="Your study plan"
            description="Overview of your week and generated study blocks."
          />
        ),
      },

      {
        path: "/planner/tasks",
        element: (
          <RoutePlaceholder
            eyebrow="PLANNER"
            title="Tasks"
          />
        ),
      },

      {
        path: "/planner/tasks/:taskId",
        element: (
          <RoutePlaceholder
            eyebrow="TASK"
            title="Task details"
          />
        ),
      },

      {
        path: "/planner/subjects",
        element: (
          <RoutePlaceholder
            eyebrow="PLANNER"
            title="Subjects"
          />
        ),
      },

      {
        path: "/planner/subjects/:subjectId",
        element: (
          <RoutePlaceholder
            eyebrow="SUBJECT"
            title="Subject details"
          />
        ),
      },

      {
        path: "/planner/availability",
        element: (
          <RoutePlaceholder
            eyebrow="PLANNER"
            title="Availability"
            description="Tell CozyCram when you can realistically study."
          />
        ),
      },

      {
        path: "/focus",
        element: (
          <RoutePlaceholder
            eyebrow="FOCUS"
            title="Ready to focus?"
            description="Task, duration and environment selection will live here."
          />
        ),
      },

      {
        path: "/calendar",
        element: (
          <RoutePlaceholder
            eyebrow="CALENDAR"
            title="Calendar"
          />
        ),
      },

      {
        path: "/profile",
        element: (
          <RoutePlaceholder
            eyebrow="ACCOUNT"
            title="Profile"
          />
        ),
      },

      {
        path: "/settings",
        element: (
          <RoutePlaceholder
            eyebrow="SETTINGS"
            title="Settings"
          />
        ),
      },
    ],
  },

  {
    element: <FocusLayout />,
    children: [
      {
        path: "/focus/session",
        element: (
          <RoutePlaceholder
            eyebrow="DEEP FOCUS"
            title="42 : 18"
            description="Active Focus Mode intentionally uses a separate layout."
          />
        ),
      },
    ],
  },

  {
    element: <SystemLayout />,
    children: [
      {
        path: "/offline",
        element: (
           <RoutePlaceholder
              eyebrow="COZYCRAM"
              title="You're offline."
              description="Your active focus session will eventually continue safely."
            >
              <Link
                to="/today"
                className="route-placeholder__action"
              >
                Back to Today
              </Link>
            </RoutePlaceholder> 
        ),
      },

      {
        path: "*",
        element: (
           <RoutePlaceholder
              eyebrow="404"
              title="This page wandered off schedule."
              description="The page you're looking for doesn't exist."
           >
              <Link
                to="/"
                className="route-placeholder__action"
              >
               Back home
              </Link>
            </RoutePlaceholder>
        ),
      },
    ],
  },
]);

export default router;