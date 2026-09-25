export function getAppPageTitle(pathname) {
  if (pathname.startsWith("/planner/tasks/")) {
    return "Task details";
  }

  if (pathname.startsWith("/planner/tasks")) {
    return "Tasks";
  }

  if (pathname.startsWith("/planner/subjects/")) {
    return "Subject";
  }

  if (pathname.startsWith("/planner/subjects")) {
    return "Subjects";
  }

  if (pathname.startsWith("/planner/availability")) {
    return "Availability";
  }

  if (pathname.startsWith("/planner")) {
    return "Planner";
  }

  if (pathname.startsWith("/focus")) {
    return "Focus";
  }

  if (pathname.startsWith("/calendar")) {
    return "Calendar";
  }

  if (pathname.startsWith("/profile")) {
    return "Profile";
  }

  if (pathname.startsWith("/settings")) {
    return "Settings";
  }

  return "Today";
}