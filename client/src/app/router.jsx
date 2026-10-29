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
import OnboardingPage from "../features/onboarding/OnboardingPage.jsx";
import TodayPage from "../features/today/TodayPage.jsx";
import SubjectsPage from "../features/subjects/SubjectsPage.jsx";
import SubjectDetailPage from "../features/subjects/SubjectDetailPage.jsx";
import TasksPage from "../features/tasks/TasksPage.jsx";
import TaskDetailPage from "../features/tasks/TaskDetailPage.jsx";
import PlannerPage from "../features/planner/PlannerPage.jsx";
import AvailabilityPage from "../features/planner/AvailabilityPage.jsx";
import CalendarPage from "../features/calendar/CalendarPage.jsx";

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
        element: <OnboardingPage />
      },
    ],
  },

  {
    element: <AppLayout />,
    children: [
      {
        path: "/today",
        element: <TodayPage />
      },

      {
        path: "/planner",
        element: <PlannerPage />
      },

      {
        path: "/planner/tasks",
        element: <TasksPage />
      },

      {
        path: "/planner/tasks/:taskId",
        element: <TaskDetailPage />
      },

      {
        path: "/planner/subjects",
        element: <SubjectsPage />,
      },

      {
        path: "/planner/subjects/:subjectId",
        element:<SubjectDetailPage />
      },

      {
        path: "/planner/availability",
        element: <AvailabilityPage />
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
        element: <CalendarPage />
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