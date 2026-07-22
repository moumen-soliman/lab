"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";

// Search-expand navigation bar — a two-stage morph disclosure.
//
// Rest: a rounded bar with page icons + an avatar on the left and a search icon
// pinned right. Click search and it plays in two stages, each animating a
// single driving property:
//
//   1. Horizontal morph (open): the search icon GLIDES left to become the
//      field's leading icon while the icons + avatar fade out, the input fades
//      in, and a ✕ fades in on the right. The travel distance is measured from
//      layout (offsetLeft — transform-independent), so it stays correct as the
//      component shrinks on narrow screens.
//   2. Vertical grow (expanded): the box — anchored to the bottom — grows
//      UPWARD (motion animates the panel's height to auto), turning the
//      rectangle into a card with a recent-searches panel cascading in above.
//
// The stages are sequenced in JS (open → grow; collapse → un-morph). "flip"
// effect: the first icon rises + blurs into the search icon instead of the
// right one travelling. Animation via motion/react; honours
// prefers-reduced-motion. Requires the lab-theme tokens. Fully Tailwind.

const MORPH_MS = 400;
const GROW_MS = 420;
const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_EASE = [0.76, 0, 0.24, 1] as const; // icon crossing: symmetric, smooth
const MORPH = { duration: 0.4, ease: EASE } as const;
const GROW = { duration: 0.44, ease: EASE } as const;

// Resting chrome fade: out with a small drift + blur, back in clean.
const CHROME_SHOWN = { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" };
const CHROME_HIDDEN = { opacity: 0, x: -6.4, scale: 0.96, filter: "blur(3px)" };

const ICON_BTN =
  "flex-none grid place-items-center w-[var(--nav-icon)] h-[var(--nav-icon)] rounded-[0.625rem] text-gray-500 hover:bg-[#f4f4f5] hover:text-[#111] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]";

const MENU_ITEM =
  "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-gray-700 text-sm text-left [transition:background-color_150ms_ease,color_150ms_ease] hover:bg-[#f4f4f5] hover:text-[#111] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#111]";

export interface NavItem {
  label: string;
  icon: ReactNode;
}

export default function SearchExpandNav({
  nav = DEFAULT_NAV,
  suggestions = DEFAULT_SUGGESTIONS,
  avatar = AVATAR_URL,
  user = "Moumen Soliman",
  handle = "@moumensoliman",
  effect = "travel",
  inspect = false,
  onSearch,
}: {
  nav?: NavItem[];
  suggestions?: string[];
  avatar?: string;
  user?: string;
  handle?: string;
  effect?: "travel" | "flip";
  inspect?: boolean;
  onSearch?: (query: string) => void;
}) {
  const firstNav = nav[0];
  const restNav = nav.slice(1);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [travelX, setTravelX] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const firstSlotRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLSpanElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const panelId = useId();
  const menuId = useId();

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The travel distance: the search icon's resting left minus the first slot's
  // left — offsetLeft ignores transforms, so this is safe to measure any time
  // and re-measures as the container-query sizing kicks in.
  useLayoutEffect(() => {
    const measure = () => {
      const btn = searchBtnRef.current;
      const first = firstSlotRef.current;
      if (!btn || !first) return;
      setTravelX(first.offsetLeft - btn.offsetLeft);
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (rootRef.current) observer?.observe(rootRef.current);
    return () => observer?.disconnect();
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openSearch() {
    clearTimer();
    setMenuOpen(false);
    setOpen(true);
    if (reduced()) setExpanded(true);
    else timerRef.current = window.setTimeout(() => setExpanded(true), MORPH_MS);
  }

  function closeSearch() {
    clearTimer();
    setExpanded(false);
    if (reduced()) setOpen(false);
    else timerRef.current = window.setTimeout(() => setOpen(false), GROW_MS);
  }

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    if (inspect) {
      setOpen(true);
      setExpanded(true);
    }
  }, [inspect]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeSearch();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
        searchBtnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        avatarBtnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => clearTimer, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSearch?.(inputRef.current?.value ?? "");
  }

  function pickSuggestion(value: string) {
    if (inputRef.current) inputRef.current.value = value;
    inputRef.current?.focus();
    onSearch?.(value);
  }

  const chrome = (hidden: boolean) => ({
    initial: false as const,
    animate: hidden ? CHROME_HIDDEN : CHROME_SHOWN,
    transition: MORPH,
    style: { pointerEvents: hidden ? ("none" as const) : undefined },
  });

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        className="relative w-[22rem] max-w-full h-14 [container-type:inline-size]"
        data-menu={menuOpen ? "true" : "false"}
      >
        <div
          className={`group/nav absolute inset-x-0 bottom-0 flex flex-col bg-white rounded-xl shadow-border [--nav-icon:2.25rem] [--nav-pad:0.5rem] [--nav-avatar:2rem] @max-[330px]:[--nav-icon:1.9rem] @max-[330px]:[--nav-pad:0.375rem] @max-[330px]:[--nav-avatar:1.7rem]${
            inspect ? " outline outline-[1.5px] outline-dashed outline-[#3b82f6] outline-offset-4" : ""
          }`}
          data-menu={menuOpen ? "true" : "false"}
        >
          {/* Elevation on a faded overlay: a cheap opacity tween, no per-frame
              box-shadow repaint. */}
          <motion.span
            className="absolute inset-0 rounded-[inherit] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.22)] pointer-events-none"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={GROW}
          />

          {/* Stage 2: recent searches — motion grows the height to auto. */}
          <motion.div
            className="overflow-hidden"
            id={panelId}
            role="region"
            aria-label="Recent searches"
            aria-hidden={!expanded}
            initial={false}
            animate={{ height: expanded ? "auto" : 0 }}
            transition={GROW}
          >
            <div className="pt-3 px-2 pb-2">
              <motion.p
                className="px-2 mb-1 text-[0.6875rem] font-semibold tracking-[0.04em] uppercase text-gray-400"
                initial={false}
                animate={expanded ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(4px)" }}
                transition={GROW}
              >
                Recent
              </motion.p>
              <ul className="flex flex-col">
                {suggestions.map((value, index) => (
                  <motion.li
                    key={value}
                    initial={false}
                    // Rows cascade in as the panel opens; the close drops the
                    // delays so the fold reads as one soft piece.
                    animate={expanded ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 8, filter: "blur(4px)" }}
                    transition={{ ...GROW, delay: expanded ? index * 0.04 : 0 }}
                  >
                    <button
                      type="button"
                      className="group/sug flex items-center gap-2.5 w-full p-2 rounded-[0.625rem] text-gray-600 text-left [transition:background-color_200ms_ease,color_200ms_ease] hover:bg-[#f4f4f5] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                      tabIndex={expanded ? 0 : -1}
                      onClick={() => pickSuggestion(value)}
                    >
                      <span className="flex-none inline-flex text-gray-400">
                        <ClockIcon />
                      </span>
                      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm">{value}</span>
                      <span className="flex-none inline-flex text-gray-300 opacity-0 -translate-x-1 [transition:opacity_200ms_ease,transform_200ms_ease] group-hover/sug:opacity-100 group-hover/sug:translate-x-0">
                        <ArrowUpLeftIcon />
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* The bar: the fixed-height bottom row of the box. */}
          <form className="relative flex-none h-14" role="search" onSubmit={handleSubmit}>
            {/* Stage 1, field: hidden at rest, revealed under the leading icon. */}
            <motion.input
              ref={inputRef}
              type="search"
              className="absolute inset-0 w-full pl-[calc(var(--nav-pad)+var(--nav-icon)+0.25rem)] pr-[calc(var(--nav-pad)+var(--nav-icon)+0.25rem)] bg-transparent border-0 outline-none text-[0.9375rem] text-[#111] placeholder:text-gray-400 [&::-webkit-search-cancel-button]:appearance-none"
              placeholder="Search…"
              aria-label="Search"
              aria-hidden={!open}
              tabIndex={open ? 0 : -1}
              initial={false}
              animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
              transition={MORPH}
              style={{ pointerEvents: open ? "auto" : "none" }}
            />

            <div className="absolute inset-0 flex items-center justify-between px-[var(--nav-pad)]">
              {firstNav && (
                <motion.button
                  ref={firstSlotRef}
                  type="button"
                  className="flex-none grid place-items-center w-[var(--nav-icon)] h-[var(--nav-icon)] rounded-[0.625rem] overflow-hidden text-gray-500 hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                  aria-label={open && effect === "flip" ? "Search" : firstNav.label}
                  title={firstNav.label}
                  aria-hidden={open && effect !== "flip" ? true : undefined}
                  tabIndex={open && effect !== "flip" ? -1 : 0}
                  initial={false}
                  animate={open && effect === "travel" ? CHROME_HIDDEN : CHROME_SHOWN}
                  transition={MORPH}
                  style={{ pointerEvents: open && effect === "travel" ? "none" : undefined }}
                  onClick={(event) => {
                    if (open && effect === "flip") {
                      event.preventDefault();
                      onSearch?.(inputRef.current?.value ?? "");
                    }
                  }}
                >
                  {/* Both faces share one grid cell; open rises the home out and
                      the search in — a crossfade-in-motion, no 3D backface. */}
                  <motion.span
                    className="[grid-area:1/1] inline-flex"
                    initial={false}
                    animate={open && effect === "flip" ? { opacity: 0, y: -11.2, filter: "blur(4px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={MORPH}
                  >
                    {firstNav.icon}
                  </motion.span>
                  <motion.span
                    className="[grid-area:1/1] inline-flex text-[#111]"
                    aria-hidden="true"
                    initial={false}
                    animate={open && effect === "flip" ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 11.2, filter: "blur(4px)" }}
                    transition={MORPH}
                  >
                    <SearchIcon />
                  </motion.span>
                </motion.button>
              )}

              {restNav.map((item) => (
                <motion.button
                  key={item.label}
                  type="button"
                  className={ICON_BTN}
                  aria-label={item.label}
                  title={item.label}
                  aria-hidden={open || undefined}
                  tabIndex={open ? -1 : 0}
                  {...chrome(open)}
                >
                  {item.icon}
                </motion.button>
              ))}

              <motion.span className="relative flex-none inline-flex" ref={accountRef} {...chrome(open)}>
                <button
                  ref={avatarBtnRef}
                  type="button"
                  className="block rounded-[0.625rem] active:scale-[0.96] [transition:scale_150ms_ease-out] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                  aria-label="Account"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  aria-hidden={open || undefined}
                  tabIndex={open ? -1 : 0}
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar}
                    alt={user}
                    width="32"
                    height="32"
                    loading="lazy"
                    className="block w-[var(--nav-avatar)] h-[var(--nav-avatar)] rounded-[0.625rem] object-cover outline outline-1 -outline-offset-1 outline-black/10 [transition:outline-color_200ms_ease,box-shadow_200ms_ease] group-data-[menu=true]/nav:outline-[#111] group-data-[menu=true]/nav:shadow-[0_0_0_3px_rgba(17,17,17,0.08)]"
                  />
                </button>

                {/* The dropdown: opens UPWARD, scaling out of its bottom-right corner. */}
                <motion.div
                  className="absolute bottom-[calc(100%+0.625rem)] right-0 w-52 p-1.5 bg-white rounded-[0.875rem] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_12px_32px_-8px_rgba(0,0,0,0.22)] origin-bottom-right z-20"
                  id={menuId}
                  ref={menuRef}
                  role="menu"
                  aria-label="Account"
                  initial={false}
                  animate={menuOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6.4, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ pointerEvents: menuOpen ? "auto" : "none" }}
                >
                  <div className="flex items-center gap-2.5 px-2 pt-2 pb-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar} alt="" width="36" height="36" loading="lazy" className="flex-none w-9 h-9 rounded-lg object-cover outline outline-1 -outline-offset-1 outline-black/10" />
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[#111] leading-tight">{user}</span>
                      <span className="text-xs text-gray-400 leading-snug overflow-hidden text-ellipsis whitespace-nowrap">{handle}</span>
                    </span>
                  </div>
                  <div className="h-px bg-[#f1f1f3] my-1" aria-hidden="true" />
                  <button type="button" role="menuitem" className={MENU_ITEM} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>
                    <UserIcon /> View profile
                  </button>
                  <button type="button" role="menuitem" className={MENU_ITEM} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>
                    <GearIcon /> Settings
                  </button>
                  <div className="h-px bg-[#f1f1f3] my-1" aria-hidden="true" />
                  <button
                    type="button"
                    role="menuitem"
                    className={`${MENU_ITEM} text-[#dc2626] hover:!bg-[#fef2f2] hover:!text-[#dc2626]`}
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogOutIcon /> Sign out
                  </button>
                </motion.div>
              </motion.span>

              {/* The travelling search icon: slides left by the measured
                  distance to become the field's leading icon. */}
              <motion.button
                ref={searchBtnRef}
                type={open ? "submit" : "button"}
                className={`relative z-[2] flex-none grid place-items-center w-[var(--nav-icon)] h-[var(--nav-icon)] rounded-[0.625rem] [transition:color_200ms_ease] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
                  open && effect === "travel" ? "text-gray-500" : "text-[#111]"
                }${inspect && effect === "travel" ? " outline outline-[1.5px] outline-dashed outline-[#ef4444]" : ""}`}
                aria-label="Search"
                aria-expanded={open}
                aria-controls={panelId}
                initial={false}
                animate={
                  effect === "travel"
                    ? { x: open ? travelX : 0, opacity: 1, scale: 1, filter: "blur(0px)" }
                    : open
                      ? { x: 0, opacity: 0, scale: 0.9, filter: "blur(3px)" }
                      : { x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }
                }
                transition={{ x: { duration: 0.4, ease: SLIDE_EASE }, default: MORPH }}
                style={{ pointerEvents: open && effect === "flip" ? "none" : undefined }}
                onClick={(event) => {
                  if (!open) {
                    event.preventDefault();
                    openSearch();
                  }
                }}
              >
                <SearchIcon />
              </motion.button>
            </div>

            {/* ✕ fades in on the right once the search icon has vacated it. */}
            <motion.button
              type="button"
              className="absolute top-1/2 right-[var(--nav-pad)] z-[2] grid place-items-center w-[var(--nav-icon)] h-[var(--nav-icon)] rounded-[0.625rem] text-gray-500 [transition:background-color_200ms_ease,color_200ms_ease] hover:bg-[#f4f4f5] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              aria-label="Close search"
              tabIndex={open ? 0 : -1}
              initial={false}
              animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
              transition={MORPH}
              style={{ y: "-50%", pointerEvents: open ? "auto" : "none" }}
              onClick={closeSearch}
            >
              <CloseIcon />
            </motion.button>
          </form>

          {inspect && (
            <>
              <span className="absolute -top-[1.85rem] left-0 whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                fixed width · bottom-anchored · grows ↑
              </span>
              <span className="absolute top-3 right-2 whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                height 0 → auto
              </span>
              <span className="absolute -bottom-[1.6rem] left-0 whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                {effect === "flip" ? "home ↑ blur out · search ↑ blur in" : `slides ← ${Math.round(travelX)}px measured`}
              </span>
            </>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

const AVATAR_URL = "https://avatars.githubusercontent.com/u/24474287?v=4";

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
function HomeIcon() { return <Svg><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>; }
function CompassIcon() { return <Svg><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></Svg>; }
function BellIcon() { return <Svg><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Svg>; }
function MessageIcon() { return <Svg><path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.9-5a8.38 8.38 0 0 1-.9-4 8.5 8.5 0 0 1 17 0Z" /></Svg>; }
function BookmarkIcon() { return <Svg><path d="M6 4.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V5.5a1 1 0 0 1 1-1Z" /></Svg>; }
function UserIcon() { return <Svg size={17}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></Svg>; }
function GearIcon() { return <Svg size={17}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></Svg>; }
function LogOutIcon() { return <Svg size={17}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Svg>; }
function SearchIcon() { return <Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></Svg>; }
function CloseIcon() { return <Svg><path d="M18 6 6 18M6 6l12 12" /></Svg>; }
function ClockIcon() { return <Svg size={16}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>; }
function ArrowUpLeftIcon() { return <Svg size={16}><path d="M17 17 7 7" /><path d="M7 13V7h6" /></Svg>; }

const DEFAULT_NAV: NavItem[] = [
  { label: "Home", icon: <HomeIcon /> },
  { label: "Explore", icon: <CompassIcon /> },
  { label: "Messages", icon: <MessageIcon /> },
  { label: "Bookmarks", icon: <BookmarkIcon /> },
  { label: "Activity", icon: <BellIcon /> },
];
const DEFAULT_SUGGESTIONS = ["Animations on the web", "flex-grow vs grid-fr", "prefers-reduced-motion", "container query units"];
