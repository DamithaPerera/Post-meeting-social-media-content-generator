import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import { Meeting } from "../api/types";
import { Link } from "react-router-dom";
import PlatformIcon from "../components/PlatformIcon";

export default function PastMeetings() {
  const { data } = useQuery({
    queryKey: ["past"],
    queryFn: async ()=> (await client.get<Meeting[]>("/meetings")).data
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Past meetings</h1>
      <div className="grid gap-3">
        {data?.map(m => (
          <Link key={m.id} to={`/meetings/${m.id}`} className="card block">
            <div className="font-medium">{m.title}</div>
            <div className="text-sm text-gray-600">{new Date(m.startTime).toLocaleString()}</div>
            <div className="mt-1"><PlatformIcon p={m.platform} /></div>
          </Link>
        ))}
        {!data?.length && <div className="text-sm text-gray-500">No past meetings yet.</div>}
      </div>
    </div>
  );
}
