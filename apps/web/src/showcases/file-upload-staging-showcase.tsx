"use client";

import { useCallback, useRef, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import UploadStaging, {
  type UploadStagingHandle,
  type UploadStagingState,
} from "@/registry/lab/file-upload-staging/file-upload-staging";
import { SAMPLE_FILES } from "@/registry/lab/file-upload-staging/example";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function UploadStagingShowcase() {
  const [uploadFlaky, setUploadFlaky] = useState(false);
  const [uploadInstant, setUploadInstant] = useState(false);
  const [inspectUpload, setInspectUpload] = useState(false);
  const [uploadState, setUploadState] = useState<UploadStagingState>({
    total: 0,
    queued: 0,
    uploading: 0,
    done: 0,
    error: 0,
    bytes: 0,
  });
  const handleUploadState = useCallback((state: UploadStagingState) => setUploadState(state), []);

  const staging = useRef<UploadStagingHandle>(null);
  const cursor = useRef(0);
  const stageSamples = () => {
    const start = cursor.current;
    cursor.current = (start + 4) % SAMPLE_FILES.length;
    staging.current?.addFiles(
      Array.from({ length: 4 }, (_, i) => SAMPLE_FILES[(start + i) % SAMPLE_FILES.length]),
    );
  };

  return (
    <>
      <ShowcaseIntro title="File Upload Staging Area" delay={40} defaultOpen>
        Drop real files (or stage the samples - nothing leaves the page) and each tile runs its own{" "}
        <span className="font-medium text-foreground">interruptible state machine</span>: queued → uploading → done, or →{" "}
        <span className="font-medium text-foreground">error frozen at the failure percent</span>. Retry{" "}
        <span className="font-medium text-foreground">resumes from that percent</span> - the arc never rewinds - and a
        freed slot immediately promotes the next queued tile, because{" "}
        <span className="font-medium text-foreground">concurrency is capped at 2</span> so the pipeline stays visible.
        Progress is <span className="font-medium text-foreground">jittered but honest</span>: variable speed with the
        occasional stall like a real network, but it never moves backwards and only 100% completes - failures are
        decided up front at a hidden percent, not rolled per frame. Removing tiles (or{" "}
        <span className="font-medium text-foreground">Clear done</span>) reflows the grid with a{" "}
        <span className="font-medium text-foreground">layout glide</span>: survivors slide to their new spots while new
        tiles scale in. Long names <span className="font-medium text-foreground">middle-truncate</span> with the full name
        on hover.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={uploadFlaky} onChange={setUploadFlaky}>
          Flaky network <span className="text-subtle-foreground">- 60% failure for newly added files, to feel the retry flow</span>
        </CheckToggle>
        <CheckToggle checked={uploadInstant} onChange={setUploadInstant}>
          Instant layout <span className="text-subtle-foreground">- no glides or entrances, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectUpload} onChange={setInspectUpload} />
          {inspectUpload && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex flex-col items-center gap-3 rounded-2xl border px-6 py-8 min-h-[260px] transition-colors ${
          inspectUpload ? `${SPEC_GRID} bg-card border-blue-200` : "bg-muted/40 border-border"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <UploadStaging
          ref={staging}
          failRate={uploadFlaky ? 0.6 : 0.25}
          morph={!uploadInstant}
          inspect={inspectUpload}
          onStateChange={handleUploadState}
        />
        <button
          type="button"
          onClick={stageSamples}
          className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground select-none transition-[background-color,scale] hover:bg-primary/85 active:scale-[0.96]"
        >
          Stage 4 sample files
        </button>
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-muted-foreground break-words" style={{ animationDelay: "90ms" }}>
        {inspectUpload ? (
          <>
            layout glide <code className="text-foreground">300ms</code> · jitter <code className="text-foreground">0.6-4%</code>{" "}
            · stall <code className="text-foreground">12%</code> · concurrency <code className="text-foreground">2</code> · fail
            decided at <code className="text-foreground">failAt</code>
          </>
        ) : uploadState.total === 0 ? (
          <>Stage some files - drop them, browse, or add the samples</>
        ) : (
          <>
            <span className="font-medium text-foreground tabular-nums">
              {uploadState.done}/{uploadState.total}
            </span>{" "}
            uploaded
            {uploadState.uploading > 0 && (
              <>
                {" "}
                · uploading <span className="font-medium text-foreground tabular-nums">{uploadState.uploading}</span>
              </>
            )}
            {uploadState.queued > 0 && (
              <>
                {" "}
                · queued <span className="font-medium text-foreground tabular-nums">{uploadState.queued}</span>
              </>
            )}
            {uploadState.error > 0 && (
              <>
                {" "}
                · failed <span className="font-medium text-foreground tabular-nums">{uploadState.error}</span>
              </>
            )}
            {" · "}
            <span className="font-medium text-foreground">{(uploadState.bytes / 1_000_000).toFixed(1)} MB</span>
          </>
        )}
      </p>
    </>
  );
}
