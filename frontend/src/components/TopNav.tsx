import { Link, useLocation } from "react-router-dom";

export default function TopNav() {
  const { pathname } = useLocation();
  const tab = (to: string, label: string) => (
    <Link to={to} className={`px-3 py-2 rounded-xl text-sm ${pathname.startsWith(to) ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
      {label}
    </Link>
  );
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-semibold">Post-meeting Social</Link>
        <nav className="flex gap-2">
          {tab("/dashboard","Upcoming")}
          {tab("/meetings","Past meetings")}
          {tab("/settings","Settings")}
        </nav>
        <a href={`${import.meta.env.VITE_API_BASE}/auth/google`} className="btn">Connect Google</a>
      </div>
    </header>
  );
}
