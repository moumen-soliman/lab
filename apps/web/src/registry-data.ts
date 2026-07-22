import registry from "../registry.json";
import blurs from "./blurs.json";

// Plain, serializable component metadata derived from registry.json (the single
// source of truth). No React imports, so this is safe to use in Server
// Components and pass across the server/client boundary. The slug → Showcase
// component map lives separately in showcases.tsx.

export interface LabVideo {
  src: string;
  aspectRatio: string;
  blur?: string | null;
}

export interface LabComponent {
  slug: string;
  title: string;
  description: string;
  video: LabVideo | null;
}

// Clips per slug (components without one live only on their page). Order and
// titles come from registry.json.
const videos: Record<string, LabVideo> = {
  "unlimited-nested-menu": { src: "/lab/1.mov", aspectRatio: "878 / 836" },
  "ticket-number-ticker": { src: "/lab/2.mov", aspectRatio: "886 / 284" },
  "file-upload-staging": { src: "/lab/3.mov", aspectRatio: "886 / 864" },
  "schedule-builder": { src: "/lab/4.mov", aspectRatio: "1066 / 1004" },
  "otp-segmented-input": { src: "/lab/5.mov", aspectRatio: "918 / 376" },
  "share-permissions-popover": { src: "/lab/6.mov", aspectRatio: "868 / 1000" },
  "command-palette": { src: "/lab/7.mov", aspectRatio: "980 / 776" },
  "morphing-checkout": { src: "/lab/10.mov", aspectRatio: "1692 / 1136" },
  "search-expand-nav": { src: "/lab/9.mov", aspectRatio: "864 / 672" },
  "drag-to-reorder-list": { src: "/lab/8.mov", aspectRatio: "854 / 744" },
  "caret-mention-popover": { src: "/lab/12.mov", aspectRatio: "922 / 658" },
  "inertial-wheel-list": { src: "/lab/11.mov", aspectRatio: "864 / 534" },
};

export const components: LabComponent[] = registry.items
  .filter((item) => item.type === "registry:component")
  .map((item) => {
    const video = videos[item.name];
    return {
      slug: item.name,
      title: item.title,
      description: item.description,
      video: video ? { ...video, blur: (blurs as Record<string, string>)[video.src] ?? null } : null,
    };
  });

// The components that own a clip — the cards on the home grid.
export const bento = components.filter((component) => component.video);

export function getComponent(slug: string): LabComponent | null {
  return components.find((component) => component.slug === slug) ?? null;
}
