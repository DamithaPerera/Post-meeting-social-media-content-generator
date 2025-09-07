import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import { SocialDraft } from "../api/types";
import PostDraftModal from "../components/PostDraftModal";
import { useState } from "react";

export default function MeetingDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState<null | { platform: "LINKEDIN"|"FACEBOOK"; text: string }>(null);

  const meeting = useQuery({ queryKey: ["meeting", id], queryFn: async ()=> (await client.get(`/meetings/${id}`)).data });
  const transcript = useQuery({ queryKey: ["transcript", id], queryFn: async ()=> (await client.get(`/meetings/${id}/transcript`)).data });
  const email = useQuery({ queryKey: ["email", id], queryFn: async ()=> (await client.get(`/meetings/${id}/email-draft`)).data });
  const drafts = useQuery({ queryKey: ["drafts", id], queryFn: async ()=> (await client.get<SocialDraft[]>(`/meetings/${id}/social-drafts`)).data });

  const gen = useMutation({
    mutationFn: async ()=> client.post(`/meetings/${id}/generate-drafts`, {}),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ["drafts", id] })
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{meeting.data?.title || "Meeting"}</h1>
        <button className="btn" onClick={()=>gen.mutate()}>Generate social drafts</button>
      </div>

      <section className="card">
        <h2 className="font-medium mb-2">Transcript</h2>
        <pre className="whitespace-pre-wrap text-sm">{transcript.data?.transcript || "Transcript not available yet. (We poll Recall.ai every few minutes.)"}</pre>
      </section>

      <section className="card">
        <h2 className="font-medium mb-2">AI follow-up email</h2>
        <pre className="whitespace-pre-wrap text-sm">{email.data?.draft || "Generating…"}</pre>
      </section>

      <section className="card">
        <h2 className="font-medium mb-4">Social media drafts</h2>
        <div className="grid gap-3">
          {drafts.data?.map(d => (
            <div key={d.id} className="border rounded-xl p-3">
              <div className="text-xs text-gray-600 mb-1">{d.platform}</div>
              <pre className="whitespace-pre-wrap text-sm">{d.content}</pre>
              <div className="mt-3 flex justify-end">
                <button className="btn-primary" onClick={()=>setOpen({ platform: d.platform, text: d.content })}>
                  Open & Post
                </button>
              </div>
            </div>
          ))}
          {!drafts.data?.length && <div className="text-sm text-gray-500">No drafts yet — click “Generate social drafts”.</div>}
        </div>
      </section>

      {open && (
        <PostDraftModal
          open={!!open}
          onClose={()=>setOpen(null)}
          meetingId={id}
          platform={open.platform}
          defaultText={open.text}
        />
      )}
    </div>
  );
}
