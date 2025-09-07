import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import { Meeting } from "../api/types";
import PlatformIcon from "../components/PlatformIcon";
import Toggle from "../components/Toggle";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["upcoming"],
    queryFn: async ()=> (await client.get<Meeting[]>("/calendar/events")).data
  });

  const m = useMutation({
    mutationFn: async (p:{meetingId:string;on:boolean}) => client.post("/calendar/toggle", p),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ["upcoming"] })
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Upcoming calendar events</h1>
      <div className="grid gap-3">
        {data?.map(ev => (
          <div key={ev.id} className="card flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{ev.title}</div>
              <div className="text-sm text-gray-600">
                {new Date(ev.startTime).toLocaleString()} – {new Date(ev.endTime).toLocaleTimeString()}
              </div>
              <div className="flex gap-2 items-center">
                <PlatformIcon p={ev.platform} />
                {ev.conferenceLink ? <a className="text-blue-600 underline text-sm" href={ev.conferenceLink} target="_blank">Join link</a> : <span className="text-sm text-gray-500">No link</span>}
                <Link to={`/meetings/${ev.id}`} className="text-sm underline">Details</Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">Send notetaker</span>
              <Toggle checked={ev.notetakerOn} onChange={(v)=>m.mutate({ meetingId: ev.id, on: v })} />
            </div>
          </div>
        ))}
        {!data?.length && <div className="text-sm text-gray-500">No upcoming events (try “Connect Google”).</div>}
      </div>
    </div>
  );
}
