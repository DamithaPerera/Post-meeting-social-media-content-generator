import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PastMeetings from "./pages/PastMeetings";
import MeetingDetail from "./pages/MeetingDetail";
import Settings from "./pages/Settings";

const router = createBrowserRouter([
  { path: "/", element: <App />, children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "login", element: <Login /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "meetings", element: <PastMeetings /> },
      { path: "meetings/:id", element: <MeetingDetail /> },
      { path: "settings", element: <Settings /> }
  ]},
]);

export default router;
