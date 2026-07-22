import Link from "next/link";
import { ArrowLeftIcon } from "../lib/icons";

export function BackLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-gray-500 hover:text-[#111] transition-colors text-sm ${className}`}
    >
      <ArrowLeftIcon />
      {label}
    </Link>
  );
}

export function Divider({ delay = 0, className = "mb-10" }: { delay?: number; className?: string }) {
  return (
    <div
      className={`w-full h-px bg-[linear-gradient(90deg,transparent_2px,#d4d4d8_2px,transparent_4px)] bg-[length:4px_1px] animate-fade-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
