import { useEffect, useState, type RefObject } from "react";
import { readConnection, type ConnectionState } from "./media";

export function useConnection(): ConnectionState {
  const [conn, setConn] = useState<ConnectionState>(readConnection);
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: EventTarget }).connection;
    if (!c?.addEventListener) return undefined;
    // A link that drops to 2g (or flips on data saver) mid-session re-buckets
    // live, so already-visible clips narrow their pipe without a reload.
    const onChange = () => setConn(readConnection());
    c.addEventListener("change", onChange);
    return () => c.removeEventListener("change", onChange);
  }, []);
  return conn;
}

export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = "0px", enabled = true }: { rootMargin?: string; enabled?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Caller opted out of observation: always "visible".
    if (!enabled) {
      setInView(true);
      return undefined;
    }
    const element = ref.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, enabled]);

  return inView;
}
