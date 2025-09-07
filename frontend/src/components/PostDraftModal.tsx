import { useState } from "react";
import CopyButton from "./CopyButton";
import client from "../api/client";

export default function PostDraftModal({
  open, onClose, meetingId, platform, defaultText
}: {
  open: boolean; onClose: ()=>void; meetingId: string; platform: "LINKEDIN"|"FACEBOOK"; defaultText: string;
}) {
  const [text, setText] = useState(defaultText || "");

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Draft post</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full h-56 p-3 border rounded-xl" />

        <div className="flex items-center justify-between">
          <CopyButton text={text} />
          <button
            className="btn-primary"
            onClick={async ()=>{
              await client.post(`/meetings/${meetingId}/post`, { platform, content: text });
              onClose();
              alert("Posted!");
            }}
          >
            Post
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Views are for informational purposes only and do not constitute financial advice.
        </p>
      </div>
    </div>
  );
}
