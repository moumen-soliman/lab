"use client";

import { useRef } from "react";
import UploadStaging, { type UploadStagingHandle } from "./file-upload-staging";

// Without an `upload` prop the network is simulated — drop in and demo. Wire
// your real network layer through the adapter and the component keeps owning
// the queue, concurrency, retry and abort-on-remove:
//
//   <UploadStaging
//     concurrency={3}
//     upload={async ({ file }, { onProgress, signal }) => {
//       await new Promise<void>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("POST", "/api/upload");
//         xhr.upload.onprogress = (e) => onProgress((e.loaded / e.total) * 100);
//         xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(xhr.statusText)));
//         xhr.onerror = () => reject(new Error("network"));
//         signal.addEventListener("abort", () => xhr.abort());
//         const form = new FormData();
//         form.append("file", file!);
//         xhr.send(form);
//       });
//     }}
//   />

export const SAMPLE_FILES = [
  { name: "team-photo-offsite-2026.png", size: 2_482_000 },
  { name: "quarterly-report-final-v2-approved-signed.pdf", size: 842_000 },
  { name: "design-system-tokens.zip", size: 5_113_000 },
  { name: "launch-checklist.doc", size: 96_400 },
  { name: "billing-webhook-retry-timeout-investigation-notes.doc", size: 141_200 },
  { name: "hero-banner@2x.png", size: 3_926_000 },
  { name: "contracts-archive-2025.zip", size: 11_480_000 },
  { name: "roadmap.pdf", size: 388_000 },
];

export default function UploadStagingExample() {
  const staging = useRef<UploadStagingHandle>(null);
  const cursor = useRef(0);

  // Walk the pool so repeated clicks stage different files.
  const stageSamples = () => {
    const start = cursor.current;
    cursor.current = (start + 4) % SAMPLE_FILES.length;
    staging.current?.addFiles(
      Array.from({ length: 4 }, (_, i) => SAMPLE_FILES[(start + i) % SAMPLE_FILES.length]),
    );
  };

  return (
    <div className="flex w-full max-w-[22rem] flex-col items-center gap-3">
      {/* Default: simulated network. Other knobs — `concurrency` caps parallel
          transfers, `failRate` shapes the simulation (0-1), `morph={false}`
          snaps layout changes instead of gliding. */}
      <UploadStaging ref={staging} concurrency={2} failRate={0.25} />
      <button
        type="button"
        onClick={stageSamples}
        className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-[background-color,scale] hover:bg-primary/85 active:scale-[0.96]"
      >
        Stage 4 sample files
      </button>
    </div>
  );
}
