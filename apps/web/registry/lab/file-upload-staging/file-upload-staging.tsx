"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { MotionConfig, motion } from "motion/react";

// File upload staging area — a pipeline expressed through motion.
//
// Three hard problems, none of them the dropzone:
//
//   · A reflowing GRID that never jump-cuts. Tiles are motion.li with `layout`:
//     removing a tile mid-grid makes every later tile glide up and across, and
//     entering tiles scale + unblur in. Exits stay subtler than enters — here,
//     instant.
//   · An interruptible state machine PER TILE: queued → uploading → done, or
//     → error frozen at the failure percent. Retry RESUMES from that percent
//     (the arc never lies by rewinding), removal works in any state, and a
//     freed slot immediately promotes the next queued tile — concurrency is
//     capped at 2 so the pipeline is visible instead of everything blasting
//     to 100% at once.
//   · Honest jittered progress. One shared ticker advances every uploading
//     tile by a random 0.6-4% with a 12% chance to stall a beat — variable
//     like a real network — but progress NEVER moves backwards and 100% is
//     the only way to complete. Failures are decided up front (a hidden
//     failAt percent), not rolled per frame.
//
// TWO MODES, one pipeline:
//
//   · No `upload` prop → the built-in simulation (nothing leaves the page).
//     Works out of the box; `failRate` shapes the demo.
//   · An `upload` adapter → REAL uploads. The component keeps owning the queue,
//     concurrency, retry and removal; your adapter owns the network:
//
//       <UploadStaging
//         upload={async ({ file, name }, { onProgress, signal }) => {
//           await api.upload(file!, { signal, onProgress }); // report 0-100
//         }}
//       />
//
//     Resolve → done. Throw → error, frozen at the last reported percent.
//     Removing a tile mid-flight aborts via the AbortSignal. Retry re-invokes
//     the adapter; the arc still never rewinds (progress is forward-only, so a
//     restarted transfer catches up to the frozen percent before it moves).
//
// Real drag-and-drop and the file picker both work (the original File rides
// along for the adapter); stage files programmatically through the ref handle:
//
//   const staging = useRef<UploadStagingHandle>(null);
//   staging.current?.addFiles([{ name: "report.pdf", size: 842_000 }]);
//
// Long names middle-truncate to start…end.ext with the full name a hover away.
// Animation via motion/react; honours prefers-reduced-motion. Requires the
// lab-theme tokens. Fully Tailwind, no CSS files.

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_ICON = [0.2, 0, 0, 1] as const;

export interface UploadStagingHandle {
  /** Stage files programmatically (name + size; kind is inferred from the extension). */
  addFiles: (files: { name: string; size: number; kind?: FileKind; file?: File }[]) => void;
}

export type FileKind = "image" | "pdf" | "archive" | "doc" | "file";

/** Your network layer. Report 0-100 via onProgress; resolve on success, throw
 *  on failure; honour the signal so removing a tile cancels the transfer. */
export type UploadFn = (
  file: { name: string; size: number; kind: FileKind; file?: File },
  ctx: { onProgress: (percent: number) => void; signal: AbortSignal },
) => Promise<void>;

export interface UploadStagingState {
  total: number;
  queued: number;
  uploading: number;
  done: number;
  error: number;
  bytes: number;
}

type Status = "queued" | "uploading" | "done" | "error";

interface StagedFile {
  id: string;
  name: string;
  size: number;
  kind: FileKind;
  file?: File;
  status: Status;
  progress: number;
  failAt: number;
}

function kindOf(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return "archive";
  if (["doc", "docx", "txt", "md", "pages"].includes(ext)) return "doc";
  return "file";
}

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

// Middle-truncate, keeping the start and the extension — a tail-ellipsis
// would eat exactly the part that tells files apart.
function truncateName(name: string, max = 14) {
  if (name.length <= max) return name;
  const head = name.slice(0, Math.ceil((max - 1) * 0.55));
  const tail = name.slice(-(max - 1 - head.length));
  return `${head}…${tail}`;
}

// Failure is decided when the upload STARTS (a hidden failAt percent), not
// re-rolled per frame — the same file fails at the same point.
function pickFailAt(rate: number, floor = 25) {
  return Math.random() < rate ? floor + Math.random() * (88 - floor) : Infinity;
}

const R = 13;
const CIRC = 2 * Math.PI * R;

export default function UploadStaging({
  upload,
  concurrency = 2,
  failRate = 0.25,
  morph = true,
  inspect = false,
  onStateChange,
  ref,
}: {
  /** Your real uploader. Omit it and the component simulates the network. */
  upload?: UploadFn;
  /** How many transfers run at once; the rest wait in the visible queue. */
  concurrency?: number;
  /** Simulation only: chance a newly staged file's upload fails (0-1). */
  failRate?: number;
  /** Grid glides + entrances; false snaps every layout change. */
  morph?: boolean;
  inspect?: boolean;
  onStateChange?: (state: UploadStagingState) => void;
  ref?: Ref<UploadStagingHandle>;
}) {
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const idRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Real mode: one AbortController per in-flight transfer, so removal cancels.
  const activeRef = useRef(new Map<string, AbortController>());

  function addFiles(metas: { name: string; size: number; kind?: FileKind; file?: File }[]) {
    setFiles((list) => [
      ...list,
      ...metas.map((meta) => ({
        id: `f${(idRef.current += 1)}`,
        name: meta.name,
        size: meta.size,
        kind: meta.kind ?? kindOf(meta.name),
        file: meta.file,
        status: "queued" as const,
        progress: 0,
        failAt: pickFailAt(failRate),
      })),
    ]);
  }

  useImperativeHandle(ref, () => ({ addFiles }), [failRate]);

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const dropped = [...(event.dataTransfer?.files ?? [])].map((file) => ({
      name: file.name,
      size: file.size,
      file,
    }));
    if (dropped.length) addFiles(dropped);
  }

  // ── The pipeline, simulation mode ────────────────────────────────────
  // One effect owns promotion AND progress. Freed slots promote the oldest
  // queued tile; a shared 70ms tick advances every uploading tile with
  // jitter and an occasional stall — forward only, done only at 100.
  const anyActive = files.some((f) => f.status === "uploading" || f.status === "queued");
  useEffect(() => {
    if (upload || !anyActive) return undefined;
    const tick = setInterval(() => {
      setFiles((list) => {
        let uploading = list.filter((f) => f.status === "uploading").length;
        return list.map((file) => {
          if (file.status === "queued" && uploading < concurrency) {
            uploading += 1;
            return { ...file, status: "uploading" as const };
          }
          if (file.status !== "uploading") return file;
          if (Math.random() < 0.12) return file; // the stall — networks breathe
          const progress = Math.min(100, file.progress + 0.6 + Math.random() * 3.4);
          if (progress >= file.failAt) {
            uploading -= 1;
            return { ...file, status: "error" as const, progress: Math.round(file.failAt) };
          }
          if (progress >= 100) {
            uploading -= 1;
            return { ...file, status: "done" as const, progress: 100 };
          }
          return { ...file, progress };
        });
      });
    }, 70);
    return () => clearInterval(tick);
  }, [upload, anyActive, concurrency]);

  // ── The pipeline, real mode ──────────────────────────────────────────
  // Same machine, your network. Freed slots promote queued tiles, then every
  // uploading tile that isn't in flight yet gets its adapter call. Progress is
  // still forward-only (the arc never rewinds — a retried transfer catches up
  // to its frozen percent before the arc moves again).
  useEffect(() => {
    if (!upload) return;
    const uploadingCount = files.filter((f) => f.status === "uploading").length;
    if (uploadingCount < concurrency && files.some((f) => f.status === "queued")) {
      setFiles((list) => {
        let free = concurrency - list.filter((f) => f.status === "uploading").length;
        return list.map((f) => (f.status === "queued" && free > 0 && (free -= 1) >= 0 ? { ...f, status: "uploading" as const } : f));
      });
      return;
    }
    for (const f of files) {
      if (f.status !== "uploading" || activeRef.current.has(f.id)) continue;
      const controller = new AbortController();
      activeRef.current.set(f.id, controller);
      const patch = (id: string, up: (x: StagedFile) => StagedFile) =>
        setFiles((list) => list.map((x) => (x.id === id ? up(x) : x)));
      upload(
        { name: f.name, size: f.size, kind: f.kind, file: f.file },
        {
          onProgress: (percent) =>
            patch(f.id, (x) =>
              x.status === "uploading"
                ? { ...x, progress: Math.min(100, Math.max(x.progress, percent)) }
                : x,
            ),
          signal: controller.signal,
        },
      )
        .then(() => {
          activeRef.current.delete(f.id);
          patch(f.id, (x) => ({ ...x, status: "done", progress: 100 }));
        })
        .catch(() => {
          activeRef.current.delete(f.id);
          if (controller.signal.aborted) return; // removed, not failed
          patch(f.id, (x) => ({ ...x, status: "error", progress: Math.round(x.progress) }));
        });
    }
  }, [upload, files, concurrency]);

  // Abort everything in flight on unmount.
  useEffect(
    () => () => {
      activeRef.current.forEach((controller) => controller.abort());
      activeRef.current.clear();
    },
    [],
  );

  // Retry resumes from the frozen percent — the arc never rewinds. In the
  // simulation a retry can still re-fail (15%), but only past the point it
  // already reached; in real mode the adapter simply runs again.
  function retry(id: string) {
    setFiles((list) =>
      list.map((file) =>
        file.id === id
          ? { ...file, status: "queued" as const, failAt: pickFailAt(0.15, Math.min(92, file.progress + 8)) }
          : file,
      ),
    );
  }

  const retryAllFailed = () => files.filter((f) => f.status === "error").forEach((f) => retry(f.id));
  const remove = (id: string) => {
    activeRef.current.get(id)?.abort();
    activeRef.current.delete(id);
    setFiles((list) => list.filter((file) => file.id !== id));
  };
  const clearDone = () => setFiles((list) => list.filter((file) => file.status !== "done"));

  const counts = {
    queued: files.filter((f) => f.status === "queued").length,
    uploading: files.filter((f) => f.status === "uploading").length,
    done: files.filter((f) => f.status === "done").length,
    error: files.filter((f) => f.status === "error").length,
  };
  useEffect(() => {
    onStateChange?.({
      total: files.length,
      ...counts,
      bytes: files.reduce((sum, f) => sum + f.size, 0),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length, counts.queued, counts.uploading, counts.done, counts.error, onStateChange]);

  const ghostBtnClass =
    "h-7 px-2.5 rounded-lg bg-[#f4f4f5] text-[#111] text-xs font-medium transition-[background-color,scale] duration-150 hover:bg-[#e4e4e7] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full max-w-[22rem] flex flex-col gap-3" data-inspect={inspect ? "true" : "false"}>
        {/* Dropzone: real drops and the picker both stage metadata only. */}
        <div
          className={[
            "flex flex-col items-center gap-1 px-4 py-[1.125rem] border-[1.5px] border-dashed rounded-xl text-center transition-[border-color,background-color] duration-150",
            dragOver ? "border-[#111] bg-[#fafafa]" : "border-[#d4d4d8] bg-white",
          ].join(" ")}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className="inline-flex text-gray-400" aria-hidden="true">
            <UploadIcon />
          </span>
          <p className="m-0 text-[0.8125rem] text-gray-500">
            Drop files here or{" "}
            <button
              type="button"
              className="p-0 border-0 bg-transparent text-[#111] text-[length:inherit] font-medium underline underline-offset-[3px] decoration-[#d4d4d8] cursor-pointer transition-[text-decoration-color] duration-150 hover:decoration-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] focus-visible:rounded-[2px]"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="m-0 text-[0.6875rem] text-[#b3b8c2]">Nothing is uploaded anywhere - the network is simulated</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            aria-label="Choose files to stage"
            onChange={(event) => {
              const picked = [...(event.target.files ?? [])].map((file) => ({ name: file.name, size: file.size }));
              if (picked.length) addFiles(picked);
              event.target.value = "";
            }}
          />
        </div>

        {/* The staging grid. `layout` on every tile: on any list change the
            survivors glide to their new spots (the FLIP, without the FLIP). */}
        {files.length > 0 && (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.25rem,1fr))] gap-2 m-0 p-0 list-none">
            {files.map((file) => (
              <motion.li
                key={file.id}
                layout={morph}
                initial={morph ? { opacity: 0, scale: 0.95, filter: "blur(2px)" } : false}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ layout: { duration: 0.3, ease: EASE }, duration: 0.24, ease: EASE }}
                className={[
                  "group/tile relative flex flex-col items-center gap-0.5 pt-3 px-2 pb-2.5 rounded-[0.625rem] transition-[box-shadow,background-color] duration-[350ms]",
                  file.status === "done"
                    ? "shadow-[var(--shadow-border),0_0_0_1.5px_#86efac] bg-[#fcfefc]"
                    : file.status === "error"
                      ? "shadow-[var(--shadow-border),0_0_0_1.5px_#fca5a5] bg-white"
                      : "shadow-border bg-white",
                  inspect ? "outline outline-[1.5px] outline-dashed outline-[#3b82f6] outline-offset-2" : "",
                ].join(" ")}
                data-status={file.status}
              >
                <button
                  type="button"
                  className="absolute top-1 right-1 z-[1] inline-flex items-center justify-center w-5 h-5 rounded-[0.3125rem] text-[#b3b8c2] opacity-0 transition-[opacity,background-color,color,scale] duration-150 group-hover/tile:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 hover:bg-[#f4f4f5] hover:text-[#111] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#111] after:content-[''] after:absolute after:-inset-1.5"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => remove(file.id)}
                >
                  <XIcon />
                </button>

                {/* The visual: type icon inside the progress ring; the check or
                    the retry button takes over the same footprint. */}
                <span className="relative w-[34px] h-[34px] inline-flex items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
                    <circle className="fill-none stroke-[#f0f0f2] stroke-[2.5]" cx="17" cy="17" r={R} />
                    <circle
                      className={[
                        // linear on purpose: the jitter IS the texture, easing would fake it
                        "fill-none stroke-[2.5] [stroke-linecap:round] [transition:stroke-dashoffset_140ms_linear,stroke_200ms_ease,opacity_250ms_ease]",
                        file.status === "queued"
                          ? "stroke-[#d4d4d8]"
                          : file.status === "error"
                            ? "stroke-[#dc2626]"
                            : file.status === "done"
                              ? "stroke-[#111] opacity-0"
                              : "stroke-[#111]",
                      ].join(" ")}
                      cx="17"
                      cy="17"
                      r={R}
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (1 - file.progress / 100)}
                    />
                  </svg>
                  {/* Contextual swap: the kind icon ducks out (opacity + scale +
                      blur) when the check or retry takes the footprint. */}
                  <motion.span
                    className="inline-flex text-gray-500"
                    initial={false}
                    animate={
                      file.status === "done" || file.status === "error"
                        ? { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                        : { opacity: 1, scale: 1, filter: "blur(0px)" }
                    }
                    transition={{ duration: 0.2, ease: EASE_ICON }}
                  >
                    <KindIcon kind={file.kind} />
                  </motion.span>
                  {file.status === "done" && (
                    <svg className="absolute inset-0" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
                      {/* The settle: the check draws itself in. */}
                      <motion.path
                        className="fill-none stroke-[#16a34a] stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"
                        d="M11 17.5l4 4 8-9"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: EASE, delay: 0.12 }}
                      />
                    </svg>
                  )}
                  {file.status === "error" && (
                    <motion.button
                      type="button"
                      className="absolute inset-0 inline-flex items-center justify-center rounded-full text-[#dc2626] transition-[background-color,scale] duration-150 hover:bg-[#fef2f2] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dc2626] after:content-[''] after:absolute after:-inset-1"
                      aria-label={`Retry ${file.name}, failed at ${file.progress}%`}
                      onClick={() => retry(file.id)}
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.2, ease: EASE_ICON }}
                    >
                      <RetryIcon />
                    </motion.button>
                  )}
                </span>

                <span
                  className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis text-[0.6875rem] font-medium text-[#111]"
                  title={file.name}
                >
                  {truncateName(file.name)}
                </span>
                <span
                  className={`text-[0.625rem] min-h-[0.9375rem] tabular-nums ${
                    file.status === "error" ? "text-[#dc2626]" : "text-gray-400"
                  }`}
                >
                  {file.status === "uploading" && `${Math.floor(file.progress)}%`}
                  {file.status === "queued" && "queued"}
                  {file.status === "done" && formatSize(file.size)}
                  {file.status === "error" && `failed at ${file.progress}%`}
                </span>
              </motion.li>
            ))}
          </ul>
        )}

        {/* Pipeline footer — batch actions double as multi-tile glide demos. */}
        {files.length > 0 && (
          <div className="flex items-center justify-between gap-2 min-h-7">
            <span className="text-xs text-gray-500 tabular-nums">
              {counts.done}/{files.length} uploaded
              {counts.error > 0 && <span className="text-[#dc2626] font-medium"> · {counts.error} failed</span>}
            </span>
            <span className="inline-flex gap-1.5">
              {counts.error > 0 && (
                <motion.button
                  type="button"
                  className={ghostBtnClass}
                  onClick={retryAllFailed}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: EASE_ICON }}
                >
                  Retry failed
                </motion.button>
              )}
              {counts.done > 0 && (
                <motion.button
                  type="button"
                  className={ghostBtnClass}
                  onClick={clearDone}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: EASE_ICON }}
                >
                  Clear done
                </motion.button>
              )}
            </span>
          </div>
        )}

        <span className="sr-only" aria-live="polite">
          {counts.error > 0
            ? `${counts.error} ${counts.error === 1 ? "upload" : "uploads"} failed.`
            : counts.uploading > 0
              ? `Uploading ${counts.uploading} of ${files.length}.`
              : files.length > 0 && counts.done === files.length
                ? "All uploads finished."
                : ""}
        </span>

        {/* Blueprint annotations (blue = the grid glide, red = the pipeline). */}
        {inspect && (
          <>
            <span className="absolute bottom-[calc(100%+0.4rem)] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              tiles keyed by id · layout glide 300ms on reflow
            </span>
            <span className="absolute top-[calc(100%+0.4rem)] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              queued → uploading → done | error (frozen) → resume · concurrency {concurrency}
            </span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}

function Svg({ children, size = 15, sw = 1.8 }: { children: React.ReactNode; size?: number; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function KindIcon({ kind }: { kind: FileKind }) {
  if (kind === "image")
    return (
      <Svg size={14}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
      </Svg>
    );
  if (kind === "pdf")
    return (
      <Svg size={14}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </Svg>
    );
  if (kind === "archive")
    return (
      <Svg size={14}>
        <rect x="2" y="3" width="20" height="5" rx="1" />
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
      </Svg>
    );
  if (kind === "doc")
    return (
      <Svg size={14}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h8M8 17h5" />
      </Svg>
    );
  return (
    <Svg size={14}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </Svg>
  );
}

function UploadIcon() {
  return (
    <Svg size={18}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="m16 6-4-4-4 4M12 2v13" />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg size={11} sw={2.2}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

function RetryIcon() {
  return (
    <Svg size={13} sw={2}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Svg>
  );
}
