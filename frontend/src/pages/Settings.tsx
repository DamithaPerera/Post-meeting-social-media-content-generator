import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../api/client";
import { SettingsResp, Automation } from "../api/types";
import { useState } from "react";

export default function Settings() {
  const { data, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async ()=> (await client.get<SettingsResp>("/settings")).data
  });
  const [minutes, setMinutes] = useState<number>(data?.settings.botLeadMinutes || 5);

  const save = useMutation({
    mutationFn: async ()=> client.post("/settings", { botLeadMinutes: minutes }),
    onSuccess: ()=> refetch()
  });

  // Automations
  const autos = useQuery({ queryKey: ["autos"], queryFn: async ()=> (await client.get<Automation[]>("/settings/automations")).data });
  const [auto, setAuto] = useState<Partial<Automation>>({ platform: "LINKEDIN", enabled: true });
  const upsert = useMutation({
    mutationFn: async ()=> client.post("/settings/automations", auto),
    onSuccess: ()=> { setAuto({ platform: "LINKEDIN", enabled: true }); refetch(); }
  });
  const del = useMutation({
    mutationFn: async (id:string)=> client.delete(`/settings/automations/${id}`),
    onSuccess: ()=> refetch()
  });

  const userId = data?.settings.userId; // we’ll pass ?u=<id> to social OAuth

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="card space-y-3">
        <div className="font-medium">Bot lead time</div>
        <div className="flex gap-2 items-center">
          <input type="number" className="border rounded-xl px-3 py-2 w-24" value={minutes} onChange={e=>setMinutes(parseInt(e.target.value||"0"))} />
          <button className="btn-primary" onClick={()=>save.mutate()}>Save</button>
        </div>
      </section>

      <section className="card space-y-3">
        <div className="font-medium">Social connections</div>
        <div className="flex gap-3">
          <a className="btn" href={`${import.meta.env.VITE_API_BASE}/auth/linkedin?u=${userId}`}>{data?.linkedinConnected ? "Re-connect LinkedIn" : "Connect LinkedIn"}</a>
          <a className="btn" href={`${import.meta.env.VITE_API_BASE}/auth/facebook?u=${userId}`}>{data?.facebookConnected ? "Re-connect Facebook" : "Connect Facebook"}</a>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="font-medium">Automations</div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Platform</label>
            <select className="border rounded-xl px-3 py-2 w-full"
              value={auto.platform}
              onChange={e=>setAuto(a=>({ ...a, platform: e.target.value as any }))}>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="FACEBOOK">Facebook</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm">Template / Prompt</label>
            <textarea className="border rounded-xl px-3 py-2 w-full h-28"
              placeholder="Draft a LinkedIn post (120–180 words) summarizing the meeting in first person…"
              value={auto.template || ""}
              onChange={e=>setAuto(a=>({ ...a, template: e.target.value }))}/>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={!!auto.enabled} onChange={e=>setAuto(a=>({ ...a, enabled: e.target.checked }))}/>
            <span className="text-sm">Enabled</span>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary" onClick={()=>upsert.mutate()}>Save automation</button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Existing automations</div>
          <div className="grid gap-2">
            {autos.data?.map(a=>(
              <div key={a.id} className="flex items-center justify-between border rounded-xl p-3">
                <div>
                  <div className="font-medium">{a.name || "(unnamed)"} <span className="badge ml-2">{a.platform}</span></div>
                  <div className="text-xs text-gray-600 truncate max-w-xl">{a.template}</div>
                </div>
                <button className="btn" onClick={()=>del.mutate(a.id)}>Delete</button>
              </div>
            ))}
            {!autos.data?.length && <div className="text-sm text-gray-500">No automations yet.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
