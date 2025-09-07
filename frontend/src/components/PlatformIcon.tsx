export default function PlatformIcon({ p }: { p: string }) {
  const label = p === "ZOOM" ? "Zoom" : p === "GOOGLE_MEET" ? "Meet" : p === "MICROSOFT_TEAMS" ? "Teams" : "Call";
  return <span className="badge">{label}</span>;
}
