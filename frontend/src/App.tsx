import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import TopNav from "./components/TopNav";
import { useQuery } from "@tanstack/react-query";
import client from "./api/client";

export default function App() {
  const nav = useNavigate();
  const loc = useLocation();
  const { data, isError } = useQuery({
    queryKey: ["auth:ping"],
    queryFn: async () => {
      const r = await client.get("/settings", { withCredentials: true });
      return r.data;
    },
    retry: false
  });

  if (isError) {
    if (loc.pathname !== "/login") nav("/login");
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
      <footer className="max-w-6xl mx-auto p-4 text-center text-xs text-gray-500">
        © Post-meeting Social
      </footer>
    </div>
  );
}
